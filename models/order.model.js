import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  orderCode: {
    type: String,
    required: true,
    unique: true,
    maxlength: 4,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  orderDate: {
    type: Date,
    default: Date.now
  },
  timeSlot: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "completed", "cancelled"],
    default: "pending"
  },
  area: {
    type: String,
    required: true,
  }
}, { timestamps: true });

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;
