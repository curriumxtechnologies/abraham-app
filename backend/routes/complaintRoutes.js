import express from "express";
import {
  createComplaint,
  getComplaints,
  getComplaintById,
  markAsRead,
  markAsDone,
  deleteComplaint,
} from "../controllers/complaintController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All complaint routes require authentication
router.use(protect);

// ─── Create a new complaint ──────────────────────────────────
router.post("/", createComplaint);

// ─── Get all complaints (admin: all, user: their own) ──────
router.get("/", getComplaints);

// ─── Get a single complaint by ID ────────────────────────────
router.get("/:id", getComplaintById);

// ─── Mark complaint as read (admin only) ────────────────────
router.patch("/:id/read", markAsRead);

// ─── Mark complaint as done (owner or admin) ────────────────
router.patch("/:id/done", markAsDone);

// ─── Delete a complaint (owner or admin) ────────────────────
router.delete("/:id", deleteComplaint);

export default router;