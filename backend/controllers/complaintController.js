import asyncHandler from "express-async-handler";
import Complaint from "../models/complaintModel.js";
import User from "../models/userModel.js";

// ──────────────────────────────────────────────────────────────
// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Private
// ──────────────────────────────────────────────────────────────
const createComplaint = asyncHandler(async (req, res) => {
  const { title, description, category, anonymous } = req.body;

  if (!title || !description) {
    res.status(400);
    throw new Error("Title and description are required");
  }

  const complaint = await Complaint.create({
    user: req.user._id,
    title,
    description,
    category: category || "General",
    anonymous: anonymous || false,
    status: "pending",
  });

  res.status(201).json({
    success: true,
    data: complaint,
  });
});

// ──────────────────────────────────────────────────────────────
// @desc    Get all complaints (admin: all, user: only their own)
// @route   GET /api/complaints
// @access  Private
// ──────────────────────────────────────────────────────────────
const getComplaints = asyncHandler(async (req, res) => {
  const isAdmin = req.user.role === "admin" || req.user.role === "super_admin";
  let filter = {};

  if (!isAdmin) {
    filter.user = req.user._id;
  }

  const complaints = await Complaint.find(filter)
    .populate("user", "fullName institutionalEmail studentId")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: complaints,
  });
});

// ──────────────────────────────────────────────────────────────
// @desc    Get a single complaint by ID
// @route   GET /api/complaints/:id
// @access  Private
// ──────────────────────────────────────────────────────────────
const getComplaintById = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id)
    .populate("user", "fullName institutionalEmail studentId");

  if (!complaint) {
    res.status(404);
    throw new Error("Complaint not found");
  }

  // Check if user is admin or the owner
  const isAdmin = req.user.role === "admin" || req.user.role === "super_admin";
  if (!isAdmin && complaint.user._id.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to view this complaint");
  }

  res.status(200).json({
    success: true,
    data: complaint,
  });
});

// ──────────────────────────────────────────────────────────────
// @desc    Mark complaint as read (admin only)
// @route   PATCH /api/complaints/:id/read
// @access  Private (admin)
// ──────────────────────────────────────────────────────────────
const markAsRead = asyncHandler(async (req, res) => {
  const isAdmin = req.user.role === "admin" || req.user.role === "super_admin";
  if (!isAdmin) {
    res.status(403);
    throw new Error("Not authorized as admin");
  }

  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) {
    res.status(404);
    throw new Error("Complaint not found");
  }

  complaint.status = "read";
  await complaint.save();

  res.status(200).json({
    success: true,
    message: "Complaint marked as read",
    data: complaint,
  });
});

// ──────────────────────────────────────────────────────────────
// @desc    Mark complaint as done (user who owns it)
// @route   PATCH /api/complaints/:id/done
// @access  Private
// ──────────────────────────────────────────────────────────────
const markAsDone = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) {
    res.status(404);
    throw new Error("Complaint not found");
  }

  // Only the owner can mark as done (or admin)
  const isAdmin = req.user.role === "admin" || req.user.role === "super_admin";
  if (!isAdmin && complaint.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to mark this complaint as done");
  }

  complaint.status = "done";
  await complaint.save();

  res.status(200).json({
    success: true,
    message: "Complaint marked as done",
    data: complaint,
  });
});

// ──────────────────────────────────────────────────────────────
// @desc    Delete a complaint (owner or admin)
// @route   DELETE /api/complaints/:id
// @access  Private
// ──────────────────────────────────────────────────────────────
const deleteComplaint = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) {
    res.status(404);
    throw new Error("Complaint not found");
  }

  const isAdmin = req.user.role === "admin" || req.user.role === "super_admin";
  if (!isAdmin && complaint.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to delete this complaint");
  }

  await complaint.deleteOne();

  res.status(200).json({
    success: true,
    message: "Complaint deleted successfully",
  });
});

export {
  createComplaint,
  getComplaints,
  getComplaintById,
  markAsRead,
  markAsDone,
  deleteComplaint,
};