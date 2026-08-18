import mongoose from "mongoose";

const bunkSchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    bunkNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    allocatedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

// Ensure unique bunk number per room
bunkSchema.index({ roomId: 1, bunkNumber: 1 }, { unique: true });

const Bunk = mongoose.model("Bunk", bunkSchema);
export default Bunk;