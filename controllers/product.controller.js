import { v2 as cloudinary } from "cloudinary";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";


// CREATE Product API POST : /api/products/add
export const createProduct = async (req, res) => {
    try {
        const { userId, name, description, category, price, brand, pincode } = req.body;

        if (!userId || !name || !description || !category || !price || !brand || !pincode) {
            return res.status(400).json({ message: "All fields are required!" });
        }

        // Find user
        const user = await User.findById(userId);
        if (!user.isProvider && !user.isAgent) {
            return res.status(404).json({ message: "not authorized" });
        }

        if (!req.file) {
            return res.status(400).json({ message: "Image file is required!" });
        }

        // Upload image to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(req.file.path, {
            folder: "products",
        });

        const newProduct = new Product({
            userId,
            brand,
            name,
            description,
            category,
            price,
            pincode,
            image: uploadResult.secure_url,
        });

        await newProduct.save();
        res.status(201).json({ success: true, message: "new product added", product: newProduct });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all products API GET : /api/products
export const getProducts = async (req, res) => {
    try {
        const products = await Product.find().populate("userId", "name email");
        res.json({ success: true, products });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get single product API GET : /api/products/:id
export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate("userId", "name email");
        if (!product) return res.status(404).json({ message: "Product not found" });
        res.json({ success: true, product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// UPDATE Product API PATCH : /api/products/update/:id
export const updateProduct = async (req, res) => {
    try {
        const { name, description, category, price, brand, pincode } = req.body;
        let updatedData = { name, description, category, price, brand, pincode };

        if (req.file) {
            // Upload new image if provided
            const uploadResult = await cloudinary.uploader.upload(req.file.path, {
                folder: "products",
            });
            updatedData.image = uploadResult.secure_url;
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            updatedData,
            { new: true }
        );

        if (!updatedProduct) return res.status(404).json({ message: "Product not found" });

        res.json({ success: true, product: updatedProduct });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// DELETE Product API DELETE : /api/products/delete/:id
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });

        res.json({ success: true, message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// GET Products by User API GET : /api/products/user/:userId
export const getUserProducts = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID is required" });
        }

        const products = await Product.find({ userId }).sort({ date: -1 });

        res.json({ success: true, products });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
