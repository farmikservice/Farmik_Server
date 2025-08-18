import { v2 as cloudinary } from "cloudinary";
import Product from "../models/product.model.js";
import { uploadFile } from "../utils/upload.js";
import User from "../models/user.model.js";


// Create Product API POST : /api/product/add
export const createProduct = async (req, res) => {
    try {
        const { userId, name, description, category, price, offerPrice } = req.body;

        const user = await User.findById(userId);
        if (!user.isProvider && !user.isAgent) {
            return res.status(401).json({ message: "Not authorized" });
        }

        // Validate required fields
        if (!name || !description || !category || !price || !offerPrice) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const image = await uploadFile(req.file.path)

        // Save product
        const newProduct = await Product.create({
            userId,
            name,
            description,
            category,
            price: Number(price),
            offerPrice: Number(offerPrice),
            image: image.secure_url
        });

        return res.status(200).json({ success: true, message: "Product Added", newProduct });

    } catch (error) {

    }
};
