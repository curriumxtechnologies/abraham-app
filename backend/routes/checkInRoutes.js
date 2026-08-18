import express from "express";
import {
  getQRCode,
  checkout,
  checkinReturn,
  resetQR,
  getMyHistory,
  getAllCheckIns,
  checkoutByToken,
  returnByToken,
} from "../controllers/checkInController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ─── Public scanner endpoints (no auth) ──────────────────
router.post("/scan/checkout", checkoutByToken);
router.post("/scan/return", returnByToken);

// ─── Protected routes (authenticated) ────────────────────
router.use(protect);

// User endpoints
router.get("/qr", getQRCode);
router.post("/checkout", checkout);
router.post("/return", checkinReturn);
router.get("/history", getMyHistory);

// Admin-only endpoints (role checked inside controller)
router.put("/admin/reset-qr/:userId", resetQR);
router.get("/admin/all", getAllCheckIns);

export default router;