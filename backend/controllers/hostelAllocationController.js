import asyncHandler from "express-async-handler";
import axios from "axios";
import crypto from "crypto";
import Bunk from "../models/bunkModel.js";
import User from "../models/userModel.js";
import Transaction from "../models/transactionModel.js";

// ──────────────────────────────────────────────────────────────
// @desc    Get all available bunks (room + bunk number)
// @route   GET /api/hostel/available
// @access  Private
// ──────────────────────────────────────────────────────────────
const getAvailableBunks = asyncHandler(async (req, res) => {
  const availableBunks = await Bunk.find({ isAvailable: true })
    .select("roomNumber bunkNumber price")
    .sort({ roomNumber: 1, bunkNumber: 1 });

  if (!availableBunks.length) {
    return res.status(200).json({
      success: true,
      message: "No available bunks at the moment",
      data: [],
    });
  }

  // Group by room for better readability
  const rooms = {};
  availableBunks.forEach((bunk) => {
    const room = bunk.roomNumber;
    if (!rooms[room]) rooms[room] = [];
    rooms[room].push({
      bunkNumber: bunk.bunkNumber,
      price: bunk.price,
      _id: bunk._id,
    });
  });

  res.status(200).json({
    success: true,
    data: rooms,
  });
});

// ──────────────────────────────────────────────────────────────
// @desc    Initialize payment for a bunk
// @route   POST /api/hostel/initiate-payment
// @access  Private
// ──────────────────────────────────────────────────────────────
const initiatePayment = asyncHandler(async (req, res) => {
  const { bunkId } = req.body;
  const userId = req.user._id;

  if (!bunkId) {
    res.status(400);
    throw new Error("Bunk ID is required");
  }

  // Check if user already has an allocated bunk
  const existingAllocation = await Bunk.findOne({ allocatedTo: userId });
  if (existingAllocation) {
    res.status(400);
    throw new Error("You already have a bunk allocated. Only one bunk per student.");
  }

  // Find the selected bunk
  const bunk = await Bunk.findById(bunkId);
  if (!bunk) {
    res.status(404);
    throw new Error("Bunk not found");
  }

  if (!bunk.isAvailable) {
    res.status(400);
    throw new Error("This bunk is no longer available");
  }

  // Generate unique transaction reference
  const reference = `HOSTEL-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  // Prepare Paystack payload
  const amountInKobo = bunk.price * 100;
  const email = req.user.institutionalEmail;

  try {
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: amountInKobo,
        reference,
        metadata: {
          bunkId: bunk._id.toString(),
          userId: userId.toString(),
        },
        callback_url: `${process.env.FRONTEND_URL}/payment/callback`,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.status) {
      // Create a transaction record with status 'pending'
      const transaction = await Transaction.create({
        user: userId,
        bunk: bunk._id,
        reference,
        amount: bunk.price,
        currency: "NGN",
        status: "pending",
        paymentGateway: "paystack",
        metadata: response.data.data,
      });

      // Update bunk with reference
      bunk.paymentReference = reference;
      bunk.paymentStatus = "pending";
      await bunk.save();

      res.status(200).json({
        success: true,
        message: "Payment initiated",
        data: {
          authorization_url: response.data.data.authorization_url,
          reference: response.data.data.reference,
          transactionId: transaction._id,
        },
      });
    } else {
      res.status(500);
      throw new Error("Paystack initialization failed: " + response.data.message);
    }
  } catch (error) {
    // Clean up on failure
    await Transaction.findOneAndDelete({ reference });
    if (bunk.paymentReference) {
      bunk.paymentReference = undefined;
      bunk.paymentStatus = "available";
      await bunk.save();
    }
    res.status(500);
    throw new Error(error.response?.data?.message || error.message);
  }
});

// ──────────────────────────────────────────────────────────────
// @desc    Verify payment status (for frontend polling)
// @route   GET /api/hostel/verify-payment/:reference
// @access  Private
// ──────────────────────────────────────────────────────────────
const verifyPayment = asyncHandler(async (req, res) => {
  const { reference } = req.params;
  if (!reference) {
    res.status(400);
    throw new Error("Reference is required");
  }

  const transaction = await Transaction.findOne({ reference });
  if (!transaction) {
    res.status(404);
    throw new Error("Transaction not found");
  }

  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const data = response.data.data;
    if (data.status === "success") {
      if (transaction.status !== "paid") {
        transaction.status = "paid";
        transaction.paymentData = data;
        await transaction.save();
      }
      res.status(200).json({
        success: true,
        message: "Payment verified successfully",
        data: {
          status: data.status,
          amount: transaction.amount,
        },
      });
    } else {
      if (transaction.status === "pending") {
        transaction.status = "failed";
        transaction.paymentData = data;
        await transaction.save();
        // Reset bunk availability
        const bunk = await Bunk.findById(transaction.bunk);
        if (bunk && bunk.paymentStatus === "pending") {
          bunk.paymentStatus = "available";
          bunk.paymentReference = undefined;
          await bunk.save();
        }
      }
      res.status(200).json({
        success: false,
        message: "Payment not successful",
        data: { status: data.status },
      });
    }
  } catch (error) {
    res.status(500);
    throw new Error("Error verifying payment: " + error.message);
  }
});

// ──────────────────────────────────────────────────────────────
// @desc    Paystack webhook to confirm payment and allocate bunk
// @route   POST /api/hostel/webhook
// @access  Public (verified by signature)
// ──────────────────────────────────────────────────────────────
const handlePaystackWebhook = asyncHandler(async (req, res) => {
  // Verify signature
  const hash = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (hash !== req.headers["x-paystack-signature"]) {
    res.status(401);
    throw new Error("Invalid signature");
  }

  const event = req.body;
  if (event.event === "charge.success") {
    const { reference, metadata } = event.data;
    const { bunkId, userId } = metadata;

    // Find the transaction
    const transaction = await Transaction.findOne({ reference });
    if (!transaction) {
      console.error(`Transaction not found for reference ${reference}`);
      return res.sendStatus(200);
    }

    // Prevent double processing
    if (transaction.status === "paid") {
      return res.sendStatus(200);
    }

    // Find the bunk
    const bunk = await Bunk.findById(bunkId);
    if (!bunk) {
      console.error(`Bunk not found for reference ${reference}`);
      return res.sendStatus(200);
    }

    // Verify that the reference matches the bunk's pending reference
    if (bunk.paymentReference !== reference) {
      console.error(`Reference mismatch for bunk ${bunkId}`);
      return res.sendStatus(200);
    }

    // Allocate the bunk
    bunk.isAvailable = false;
    bunk.allocatedTo = userId;
    bunk.paymentStatus = "paid";
    await bunk.save();

    // Update transaction
    transaction.status = "paid";
    transaction.paymentData = event.data;
    await transaction.save();

    // Update user's allocation and generate QR secret
    const user = await User.findById(userId);
    if (user) {
      user.allocatedBunk = bunk._id;
      // Generate a new QR secret for the user
      user.qrSecret = crypto.randomBytes(32).toString("hex");
      await user.save();
    }

    console.log(`Bunk ${bunk.roomNumber}-${bunk.bunkNumber} allocated to user ${userId}`);
  }

  // Always respond with 200
  res.sendStatus(200);
});

// ──────────────────────────────────────────────────────────────
// @desc    Admin: Set up rooms and bunks (seed)
// @route   POST /api/hostel/admin/setup
// @access  Private (admin only – checked in function)
// ──────────────────────────────────────────────────────────────
const setupRooms = asyncHandler(async (req, res) => {
  // Admin check
  if (req.user.role !== "admin" && req.user.role !== "super_admin") {
    res.status(403);
    throw new Error("Not authorized as admin");
  }

  const { rooms } = req.body; // e.g., [{ roomNumber: 1, bunks: [1,2,3,4], price: 5000 }]

  if (!rooms || !Array.isArray(rooms)) {
    res.status(400);
    throw new Error("Provide an array of rooms with bunk configurations");
  }

  const createdBunks = [];
  for (const room of rooms) {
    const { roomNumber, bunks, price } = room;
    for (const bunkNumber of bunks) {
      const existing = await Bunk.findOne({ roomNumber, bunkNumber });
      if (!existing) {
        const bunk = await Bunk.create({
          roomNumber,
          bunkNumber,
          price: price || 5000,
          isAvailable: true,
        });
        createdBunks.push(bunk);
      }
    }
  }

  res.status(201).json({
    success: true,
    message: `${createdBunks.length} bunks created`,
    data: createdBunks,
  });
});

// ──────────────────────────────────────────────────────────────
// @desc    Get user's current allocation
// @route   GET /api/hostel/my-allocation
// @access  Private
// ──────────────────────────────────────────────────────────────
const getMyAllocation = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("allocatedBunk");
  if (!user || !user.allocatedBunk) {
    return res.status(200).json({
      success: true,
      message: "You have no bunk allocated yet",
      data: null,
    });
  }

  res.status(200).json({
    success: true,
    data: user.allocatedBunk,
  });
});

// ──────────────────────────────────────────────────────────────
// @desc    Get user's transaction history
// @route   GET /api/hostel/my-transactions
// @access  Private
// ──────────────────────────────────────────────────────────────
const getMyTransactions = asyncHandler(async (req, res) => {
  const transactions = await Transaction.find({ user: req.user._id })
    .populate("bunk", "roomNumber bunkNumber")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: transactions,
  });
});

// ──────────────────────────────────────────────────────────────
// @desc    Admin: Get all transactions
// @route   GET /api/hostel/admin/transactions
// @access  Private (admin only – checked in function)
// ──────────────────────────────────────────────────────────────
const getAllTransactions = asyncHandler(async (req, res) => {
  // Admin check
  if (req.user.role !== "admin" && req.user.role !== "super_admin") {
    res.status(403);
    throw new Error("Not authorized as admin");
  }

  const transactions = await Transaction.find()
    .populate("user", "fullName matricNumber institutionalEmail")
    .populate("bunk", "roomNumber bunkNumber")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: transactions,
  });
});

export {
  getAvailableBunks,
  initiatePayment,
  verifyPayment,
  handlePaystackWebhook,
  setupRooms,
  getMyAllocation,
  getMyTransactions,
  getAllTransactions,
};