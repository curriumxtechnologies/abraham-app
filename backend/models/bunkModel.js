import mongoose from "mongoose";

const bunkSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: Number,
      required: [true, "Room number is required"],
    },
    bunkNumber: {
      type: Number,
      required: [true, "Bunk number is required"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      default: 5000, // in Naira (or your currency)
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
    // Reference of the payment that is pending for this bunk
    paymentReference: {
      type: String,
      default: null,
    },
    // Status of payment / allocation
    paymentStatus: {
      type: String,
      enum: ["available", "pending", "paid", "failed"],
      default: "available",
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a room cannot have two bunks with the same number
bunkSchema.index({ roomNumber: 1, bunkNumber: 1 }, { unique: true });

const Bunk = mongoose.model("Bunk", bunkSchema);
export default Bunk;