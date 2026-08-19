import asyncHandler from "express-async-handler";
import Hostel from "../models/hostelModel.js";
import Building from "../models/buildingModel.js";
import Room from "../models/roomModel.js";
import Bunk from "../models/bunkModel.js";
import User from "../models/userModel.js";

// ──────────────────────────────────────────────────────────────
// @desc    Get all hostels with their buildings, rooms, and bunks
// @route   GET /api/hostel
// @access  Private
// ──────────────────────────────────────────────────────────────
const getHostels = asyncHandler(async (req, res) => {
  const hostels = await Hostel.find().sort({ type: 1, name: 1 });

  const result = [];
  for (const hostel of hostels) {
    const buildings = await Building.find({ hostelId: hostel._id }).sort({ name: 1 });
    const buildingData = [];
    for (const building of buildings) {
      const rooms = await Room.find({ buildingId: building._id }).sort({ roomNumber: 1 });
      const roomData = [];
      for (const room of rooms) {
        const bunks = await Bunk.find({ roomId: room._id }).sort({ bunkNumber: 1 });
        roomData.push({
          _id: room._id,
          roomNumber: room.roomNumber,
          bunkCount: room.bunkCount,
          price: room.price,
          isFull: room.isFull,
          bunks,
        });
      }
      buildingData.push({
        _id: building._id,
        name: building.name,
        description: building.description,
        rooms: roomData,
      });
    }
    result.push({
      _id: hostel._id,
      name: hostel.name,
      type: hostel.type,
      description: hostel.description,
      buildings: buildingData,
    });
  }

  res.status(200).json({
    success: true,
    data: result,
  });
});

// ──────────────────────────────────────────────────────────────
// @desc    Allocate a bunk to the current user
// @route   POST /api/hostel/allocate
// @access  Private
// ──────────────────────────────────────────────────────────────
const allocateBunk = asyncHandler(async (req, res) => {
  const { bunkId } = req.body;
  const userId = req.user._id;

  if (!bunkId) {
    res.status(400);
    throw new Error("Bunk ID is required");
  }

  // Check if user already has a bunk
  const existingBunk = await Bunk.findOne({ allocatedTo: userId });
  if (existingBunk) {
    res.status(400);
    throw new Error("You already have a bunk allocated. Only one bunk per student.");
  }

  const bunk = await Bunk.findById(bunkId);
  if (!bunk) {
    res.status(404);
    throw new Error("Bunk not found");
  }

  if (!bunk.isAvailable) {
    res.status(400);
    throw new Error("This bunk is no longer available");
  }

  // Allocate the bunk
  bunk.isAvailable = false;
  bunk.allocatedTo = userId;
  await bunk.save();

  // Update user
  const user = await User.findById(userId);
  if (user) {
    user.allocatedBunk = bunk._id;
    await user.save();
  }

  // Check if the room is now full
  const room = await Room.findById(bunk.roomId);
  if (room) {
    const bunksInRoom = await Bunk.find({ roomId: room._id });
    const occupied = bunksInRoom.filter((b) => !b.isAvailable).length;
    if (occupied === room.bunkCount) {
      room.isFull = true;
      await room.save();
    }
  }

  res.status(200).json({
    success: true,
    message: "Bunk allocated successfully",
    data: bunk,
  });
});

// ──────────────────────────────────────────────────────────────
// @desc    Get current user's allocation
// @route   GET /api/hostel/my-allocation
// @access  Private
// ──────────────────────────────────────────────────────────────
const getMyAllocation = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: "allocatedBunk",
    populate: {
      path: "roomId",
      populate: {
        path: "buildingId",
        populate: {
          path: "hostelId",
        },
      },
    },
  });

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
// @desc    Admin: Create a new hostel
// @route   POST /api/hostel/admin/hostel
// @access  Private/Admin
// ──────────────────────────────────────────────────────────────
const createHostel = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "super_admin") {
    res.status(403);
    throw new Error("Not authorized as admin");
  }

  const { name, type, description } = req.body;
  if (!name || !type) {
    res.status(400);
    throw new Error("Name and type are required");
  }

  const hostel = await Hostel.create({ name, type, description });
  res.status(201).json({
    success: true,
    data: hostel,
  });
});

// ──────────────────────────────────────────────────────────────
// @desc    Admin: Create a building under a hostel
// @route   POST /api/hostel/admin/building
// @access  Private/Admin
// ──────────────────────────────────────────────────────────────
const createBuilding = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "super_admin") {
    res.status(403);
    throw new Error("Not authorized as admin");
  }

  const { hostelId, name, description } = req.body;
  if (!hostelId || !name) {
    res.status(400);
    throw new Error("Hostel ID and building name are required");
  }

  const hostel = await Hostel.findById(hostelId);
  if (!hostel) {
    res.status(404);
    throw new Error("Hostel not found");
  }

  const building = await Building.create({ hostelId, name, description });
  res.status(201).json({
    success: true,
    data: building,
  });
});

// ──────────────────────────────────────────────────────────────
// @desc    Admin: Create a room with automatic bunks
// @route   POST /api/hostel/admin/room
// @access  Private/Admin
// ──────────────────────────────────────────────────────────────
// controllers/hostelAllocationController.js

// @desc    Admin: Create a room with automatic bunks
// @route   POST /api/hostel/admin/room
// @access  Private/Admin
const createRoom = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "super_admin") {
    res.status(403);
    throw new Error("Not authorized as admin");
  }

  const { buildingId, roomNumber, bunkCount, price } = req.body;
  if (!buildingId || !roomNumber || !bunkCount) {
    res.status(400);
    throw new Error("Building ID, room number, and bunk count are required");
  }

  const building = await Building.findById(buildingId);
  if (!building) {
    res.status(404);
    throw new Error("Building not found");
  }

  // Check if room already exists in this building
  const existingRoom = await Room.findOne({ buildingId, roomNumber });
  if (existingRoom) {
    res.status(400);
    throw new Error("Room number already exists in this building");
  }

  // Create room
  const room = await Room.create({
    buildingId,
    roomNumber,
    bunkCount,
    price: price || 0,
  });

  // Auto-create bunks
  const bunks = [];
  for (let i = 1; i <= bunkCount; i++) {
    bunks.push({
      roomId: room._id,
      bunkNumber: i,
      isAvailable: true,
    });
  }
  await Bunk.insertMany(bunks);

  res.status(201).json({
    success: true,
    message: `${bunkCount} bunks created in room ${roomNumber}`,
    data: room,
  });
});

// ──────────────────────────────────────────────────────────────
// @desc    Admin: Get all bunks (for overview)
// @route   GET /api/hostel/admin/bunks
// @access  Private/Admin
// ──────────────────────────────────────────────────────────────
const getAllBunks = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "super_admin") {
    res.status(403);
    throw new Error("Not authorized as admin");
  }

  const bunks = await Bunk.find()
    .populate({
      path: "roomId",
      populate: {
        path: "buildingId",
        populate: { path: "hostelId" },
      },
    })
    .populate("allocatedTo", "fullName studentId")
    .sort({ "roomId.buildingId.hostelId.name": 1, "roomId.buildingId.name": 1, "roomId.roomNumber": 1, bunkNumber: 1 });

  res.status(200).json({
    success: true,
    data: bunks,
  });
});

// ──────────────────────────────────────────────────────────────
// @desc    Admin: Delete a hostel (and cascade)
// @route   DELETE /api/hostel/admin/hostel/:id
// @access  Private/Admin
// ──────────────────────────────────────────────────────────────
const deleteHostel = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "super_admin") {
    res.status(403);
    throw new Error("Not authorized as admin");
  }

  const hostel = await Hostel.findById(req.params.id);
  if (!hostel) {
    res.status(404);
    throw new Error("Hostel not found");
  }

  // Delete all buildings, rooms, bunks (cascade via middleware or manual)
  const buildings = await Building.find({ hostelId: hostel._id });
  for (const building of buildings) {
    const rooms = await Room.find({ buildingId: building._id });
    for (const room of rooms) {
      await Bunk.deleteMany({ roomId: room._id });
      await room.deleteOne();
    }
    await building.deleteOne();
  }
  await hostel.deleteOne();

  res.status(200).json({
    success: true,
    message: "Hostel and all associated data deleted",
  });
});

export {
  getHostels,
  allocateBunk,
  getMyAllocation,
  createHostel,
  createBuilding,
  createRoom,
  getAllBunks,
  deleteHostel,
};