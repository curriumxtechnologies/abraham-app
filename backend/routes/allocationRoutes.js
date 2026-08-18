import express from "express";
import {
  getHostels,
  allocateBunk,
  getMyAllocation,
  createHostel,
  createBuilding,
  createRoom,
  getAllBunks,
  deleteHostel,
} from "../controllers/hostelAllocationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// ─── User endpoints ──────────────────────────────────────────────
router.get("/", getHostels);
router.post("/allocate", allocateBunk);
router.get("/my-allocation", getMyAllocation);

// ─── Admin endpoints (role check inside controller) ────────────
router.post("/admin/hostel", createHostel);
router.post("/admin/building", createBuilding);
router.post("/admin/room", createRoom);
router.get("/admin/bunks", getAllBunks);
router.delete("/admin/hostel/:id", deleteHostel);

export default router;