import express from "express";

import { verifyToken } from "../middlewares/authMiddleware.js";
import { cancelledOrder, completedOrder, confirmedOrder, createOrder, deleteOrder, getAllOrders, getOrderById, getUserOrders } from "../controllers/order.controller.js";

const orderRouter = express.Router();


// Routes
orderRouter.post("/", getAllOrders)
orderRouter.post("/create", createOrder);
orderRouter.get("/user/:userId", getUserOrders);
orderRouter.patch("/confirmed/:orderId", confirmedOrder)
orderRouter.patch("/cancelled/:orderId", cancelledOrder)
orderRouter.patch("/completed/:orderId", completedOrder)
orderRouter.delete("/delete/:orderId", deleteOrder)
orderRouter.get("/:orderId", getOrderById)

export default orderRouter;
