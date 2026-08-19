import asyncHandler from "express-async-handler";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import CheckIn from "../models/checkInModel.js";

// Reusable filter: matches records with no return recorded yet,
// whether the field is missing OR explicitly null
const NO_RETURN_FILTER = {
  $or: [
    { returnTime: { $exists: false } },
    { returnTime: null },
  ],
};

// ──────────────────────────────────────────────────────────────
// @desc    Check out – user leaves the hostel
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
    ...NO_RETURN_FILTER,
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
// ──────────────────────────────────────────────────────────────
const checkinReturn = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const activeCheckout = await CheckIn.findOne({
    user: userId,
    ...NO_RETURN_FILTER,
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
// @desc    Scanner: Checkout using QR token
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
    ...NO_RETURN_FILTER,
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
    ...NO_RETURN_FILTER,
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

// ──────────────────────────────────────────────────────────────
// Unchanged handlers below
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
  if (!user.qrSecret) {
    user.qrSecret = crypto.randomBytes(32).toString("hex");
    await user.save();
  }
  const token = jwt.sign(
    { userId: user._id, qrSecret: user.qrSecret },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );
  res.status(200).json({ success: true, data: { qrToken: token } });
});

const resetQR = asyncHandler(async (req, res) => {
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
  res.status(200).json({ success: true, message: "QR code reset successfully for user." });
});

const getMyHistory = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const history = await CheckIn.find({ user: userId })
    .sort({ checkoutTime: -1 })
    .populate("bunk", "roomNumber bunkNumber");
  res.status(200).json({ success: true, data: history });
});

const getAllCheckIns = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "super_admin") {
    res.status(403);
    throw new Error("Not authorized as admin");
  }
  const records = await CheckIn.find()
    .populate("user", "fullName matricNumber institutionalEmail")
    .populate("bunk", "roomNumber bunkNumber")
    .sort({ checkoutTime: -1 });
  res.status(200).json({ success: true, data: records });
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