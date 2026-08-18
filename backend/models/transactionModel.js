import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    bunk: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bunk",
      required: [true, "Bunk is required"],
    },
    reference: {
      type: String,
      required: [true, "Transaction reference is required"],
      unique: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
    },
    currency: {
      type: String,
      default: "NGN",
    },
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    paymentGateway: {
      type: String,
      default: "paystack",
    },
    // Raw response from the gateway (useful for debugging)
    paymentData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    // Custom metadata sent during initialization
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast lookups by reference and user
transactionSchema.index({ reference: 1 });
transactionSchema.index({ user: 1, createdAt: -1 });

const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;