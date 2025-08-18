import express from 'express'
import { verifyToken } from '../middlewares/authMiddleware.js';
import { createProduct} from '../controllers/product.controller.js';
import multer from "multer";

var uploader = multer({
    storage: multer.diskStorage({}),
    limits: {fileSize: 500000}
})

const productRoutes = express.Router();

productRoutes.post('/add', verifyToken, uploader.single('image'), createProduct)

export default productRoutes