import express from "express";
import {
  getAvailableBunks,
  initiatePayment,
  verifyPayment,
  getMyAllocation,
  getMyTransactions,
  setupRooms,
  getAllTransactions,
} from "../controllers/hostelAllocationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// ─── User endpoints ──────────────────────────────────────────────
router.get("/available", getAvailableBunks);
router.post("/initiate-payment", initiatePayment);
router.get("/verify-payment/:reference", verifyPayment);
router.get("/my-allocation", getMyAllocation);
router.get("/my-transactions", getMyTransactions);

// ─── Admin-only endpoints (role check inside controller) ──────
router.post("/admin/setup", setupRooms);
router.get("/admin/transactions", getAllTransactions);

export default router;