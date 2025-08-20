import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    brand: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    pincode: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

const Product = mongoose.models.product || mongoose.model('product', productSchema);

export default Product;
