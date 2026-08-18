import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    buildingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Building",
      required: true,
    },
    roomNumber: {
      type: String,
      required: true,
      trim: true,
    },
    bunkCount: {
      type: Number,
      required: true,
      default: 4,
      min: 1,
    },
    price: {
      type: Number,
      default: 0,
    },
    isFull: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Ensure unique room number per building
roomSchema.index({ buildingId: 1, roomNumber: 1 }, { unique: true });

const Room = mongoose.model("Room", roomSchema);
export default Room;