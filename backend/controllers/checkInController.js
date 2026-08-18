import asyncHandler from "express-async-handler";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import CheckIn from "../models/checkInModel.js";

// ──────────────────────────────────────────────────────────────
// @desc    Get current user's QR code (JWT token as content)
// @route   GET /api/checkin/qr
// @access  Private (user)
// ──────────────────────────────────────────────────────────────
const getQRCode = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (!user.allocatedBunk) {
    res.status(400);
    throw new Error("You do not have a bunk allocated. Cannot check in/out.");
  }

  // If no QR secret exists, generate one (should already exist after allocation)
  if (!user.qrSecret) {
    user.qrSecret = crypto.randomBytes(32).toString("hex");
    await user.save();
  }

  const token = jwt.sign(
    { userId: user._id, qrSecret: user.qrSecret },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );

  res.status(200).json({
    success: true,
    data: { qrToken: token },
  });
});

// ──────────────────────────────────────────────────────────────
// @desc    Check out – user leaves the hostel
// @route   POST /api/checkin/checkout
// @access  Private (user)
// ──────────────────────────────────────────────────────────────
const checkout = asyncHandler(async (req, res) => {
  const { expectedReturnTime } = req.body;
  const userId = req.user._id;

  if (!expectedReturnTime) {
    res.status(400);
    throw new Error("Expected return time is required");
  }

  const user = await User.findById(userId);
  if (!user || !user.allocatedBunk) {
    res.status(400);
    throw new Error("You do not have a bunk allocated.");
  }

  const activeCheckout = await CheckIn.findOne({
    user: userId,
    returnTime: { $exists: false },
  });
  if (activeCheckout) {
    res.status(400);
    throw new Error("You are already checked out. Please check in (return) first.");
  }

  const checkIn = await CheckIn.create({
    user: userId,
    bunk: user.allocatedBunk,
    checkoutTime: new Date(),
    expectedReturnTime: new Date(expectedReturnTime),
    status: "out",
  });

  res.status(201).json({
    success: true,
    message: "Checked out successfully.",
    data: checkIn,
  });
});

// ──────────────────────────────────────────────────────────────
// @desc    Check in (return) – user comes back
// @route   POST /api/checkin/return
// @access  Private (user)
// ──────────────────────────────────────────────────────────────
const checkinReturn = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const activeCheckout = await CheckIn.findOne({
    user: userId,
    returnTime: { $exists: false },
  }).sort({ checkoutTime: -1 });

  if (!activeCheckout) {
    res.status(400);
    throw new Error("No active checkout found.");
  }

  activeCheckout.returnTime = new Date();
  activeCheckout.status = "in";
  await activeCheckout.save();

  res.status(200).json({
    success: true,
    message: "Welcome back! Check-in recorded.",
    data: activeCheckout,
  });
});

// ──────────────────────────────────────────────────────────────
// @desc    Reset QR code – admin only
// @route   PUT /api/checkin/admin/reset-qr/:userId
// @access  Private (admin)
// ──────────────────────────────────────────────────────────────
const resetQR = asyncHandler(async (req, res) => {
  // Admin check
  if (req.user.role !== "admin" && req.user.role !== "super_admin") {
    res.status(403);
    throw new Error("Not authorized as admin");
  }

  const { userId } = req.params;
  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.qrSecret = crypto.randomBytes(32).toString("hex");
  await user.save();

  res.status(200).json({
    success: true,
    message: "QR code reset successfully for user.",
  });
});

// ──────────────────────────────────────────────────────────────
// @desc    Get user's check-in history
// @route   GET /api/checkin/history
// @access  Private (user)
// ──────────────────────────────────────────────────────────────
const getMyHistory = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const history = await CheckIn.find({ user: userId })
    .sort({ checkoutTime: -1 })
    .populate("bunk", "roomNumber bunkNumber");

  res.status(200).json({
    success: true,
    data: history,
  });
});

// ──────────────────────────────────────────────────────────────
// @desc    Admin: Get all check-in records
// @route   GET /api/checkin/admin/all
// @access  Private (admin)
// ──────────────────────────────────────────────────────────────
const getAllCheckIns = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "super_admin") {
    res.status(403);
    throw new Error("Not authorized as admin");
  }

  const records = await CheckIn.find()
    .populate("user", "fullName matricNumber institutionalEmail")
    .populate("bunk", "roomNumber bunkNumber")
    .sort({ checkoutTime: -1 });

  res.status(200).json({
    success: true,
    data: records,
  });
});

// ──────────────────────────────────────────────────────────────
// @desc    Scanner: Checkout using QR token
// @route   POST /api/checkin/scan/checkout
// @access  Public (token in body)
// ──────────────────────────────────────────────────────────────
const checkoutByToken = asyncHandler(async (req, res) => {
  const { token, expectedReturnTime } = req.body;

  if (!token || !expectedReturnTime) {
    res.status(400);
    throw new Error("Token and expected return time are required");
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    res.status(401);
    throw new Error("Invalid or expired QR code");
  }

  const user = await User.findById(decoded.userId);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (user.qrSecret !== decoded.qrSecret) {
    res.status(401);
    throw new Error("QR code has been reset. Please generate a new one.");
  }

  if (!user.allocatedBunk) {
    res.status(400);
    throw new Error("User has no bunk allocated.");
  }

  const activeCheckout = await CheckIn.findOne({
    user: user._id,
    returnTime: { $exists: false },
  });
  if (activeCheckout) {
    res.status(400);
    throw new Error("User is already checked out.");
  }

  const checkIn = await CheckIn.create({
    user: user._id,
    bunk: user.allocatedBunk,
    checkoutTime: new Date(),
    expectedReturnTime: new Date(expectedReturnTime),
    status: "out",
  });

  res.status(201).json({
    success: true,
    message: "Checked out successfully (via QR).",
    data: checkIn,
  });
});

// ──────────────────────────────────────────────────────────────
// @desc    Scanner: Return using QR token
// @route   POST /api/checkin/scan/return
// @access  Public (token in body)
// ──────────────────────────────────────────────────────────────
const returnByToken = asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    res.status(400);
    throw new Error("Token is required");
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    res.status(401);
    throw new Error("Invalid or expired QR code");
  }

  const user = await User.findById(decoded.userId);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (user.qrSecret !== decoded.qrSecret) {
    res.status(401);
    throw new Error("QR code has been reset.");
  }

  const activeCheckout = await CheckIn.findOne({
    user: user._id,
    returnTime: { $exists: false },
  }).sort({ checkoutTime: -1 });

  if (!activeCheckout) {
    res.status(400);
    throw new Error("No active checkout found.");
  }

  activeCheckout.returnTime = new Date();
  activeCheckout.status = "in";
  await activeCheckout.save();

  res.status(200).json({
    success: true,
    message: "Welcome back! Check-in recorded (via QR).",
    data: activeCheckout,
  });
});

export {
  getQRCode,
  checkout,
  checkinReturn,
  resetQR,
  getMyHistory,
  getAllCheckIns,
  checkoutByToken,
  returnByToken,
};