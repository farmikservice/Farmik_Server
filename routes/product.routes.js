import express from "express";
import multer from "multer";
import {
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    createProduct,
} from "../controllers/product.controller.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const productRouter = express.Router();

// Multer setup (temporary storage before Cloudinary upload)
const upload = multer({ dest: "uploads/" });

// Routes
productRouter.post("/add", upload.single("image"), createProduct);
productRouter.get("/", getProducts);
productRouter.get("/:id", getProductById);
productRouter.patch("/update/:id", upload.single("image"), updateProduct);
productRouter.delete("/delete/:id", deleteProduct);

export default productRouter;
