import mongoose from "mongoose";
import Order from "../models/order.model.js";
import generateOtp from "../utils/generateOtp.js";
import User from "../models/user.model.js";

// create order POST API : /api/orders/create
export const createOrder = async (req, res) => {
  try {
    const { userId, productId, orderDate, timeSlot, area } = req.body;

    // validation
    if (!userId || !productId || !orderDate || !timeSlot || !area) {
      return res.status(400).json({ success: false, message: "All fields required" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Invalid userId or productId" });
    }

    // generate unique order code
    let orderCode = generateOtp();

    const order = new Order({
      userId,
      orderCode,
      productId,
      orderDate,
      timeSlot,
      area
    });

    await order.save();

    return res.status(201).json({ success: true, order });
  } catch (error) {
    console.error("Error creating order:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// get user orders GET API : /api/orders/user/:userId
export const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid userId" });
    }

    const orders = await Order.find({ userId })

    return res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// get all orders GET API : /api/orders
export const getAllOrders = async (req, res) => {
  try {
    const { userId } = req.body;

    // validation
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID required" });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user.isAdmin) {
      return res.status(404).json({ message: "not authorized" });
    }

    const orders = await Order.find();
    return res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    console.error("Error fetching all orders:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// confirmed order PATCH API : /api/orders/confirmed/:orderId
export const confirmedOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { userId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, message: "Invalid orderId" });
    }

    // validation
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID required" });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user.isProvider) {
      return res.status(404).json({ message: "not authorized" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    order.status = "confirmed";
    await order.save();
    return res.json({ success: true, order, message: "Order confirmed" });
  } catch (error) {
    console.error("Error updating order status:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// delete order DELETE API : /api/orders/delete/:orderId
export const deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { userId } = req.body;

    // validation
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID required" });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user.isAgent) {
      return res.status(404).json({ message: "not authorized" });
    }

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, message: "Invalid orderId" });
    }
    const order = await Order.findByIdAndDelete(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    return res.json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// get order by ID GET API : /api/orders/:orderId
export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, message: "Invalid orderId" });
    }
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    return res.json({ success: true, order });
  } catch (error) {
    console.error("Error fetching order by ID:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// completed order PATCH API : /api/orders/completed/:orderId
export const completedOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { userId, orderCode } = req.body;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, message: "Invalid orderId" });
    }

    // validation
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID required" });
    }
    if (!orderCode) {
      return res.status(400).json({ success: false, message: "Order code required" });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user.isProvider) {
      return res.status(404).json({ message: "not authorized" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.status !== "confirmed") {
      return res.json({ success: false, message: "Order not confirmed" });
    }

    if (order.orderCode !== orderCode) {
      return res.status(404).json({ message: "Invalid order code" });
    }

    order.status = "completed";
    await order.save();
    return res.json({ success: true, order, message: "Order completed" });
  } catch (error) {
    console.error("Error updating order status:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// cancelled order PATCH API : /api/orders/cancelled/:orderId
export const cancelledOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { userId, orderCode } = req.body;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, message: "Invalid orderId" });
    }

    // validation
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID required" });
    }
    if (!orderCode) {
      return res.status(400).json({ success: false, message: "Order code required" });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user.isProvider) {
      return res.status(404).json({ message: "not authorized" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.status !== "confirmed") {
      return res.json({ success: false, message: "Order not confirmed" });
    }

    if (order.orderCode !== orderCode) {
      return res.status(404).json({ message: "Invalid order code" });
    }

    order.status = "cancelled";

    await order.save();
    return res.json({ success: true, order, message: "Order cancelled" });
  } catch (error) {
    console.error("Error updating order status:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
