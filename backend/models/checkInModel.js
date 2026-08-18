// models/checkInModel.js
import mongoose from "mongoose";

const checkInSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bunk: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bunk",
      required: true,
    },
    checkoutTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    expectedReturnTime: {
      type: Date,
      required: true,
    },
    returnTime: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["in", "out"],
      default: "out",
    },
  },
  {
    timestamps: true,
  }
);

const CheckIn = mongoose.model("CheckIn", checkInSchema);
export default CheckIn;