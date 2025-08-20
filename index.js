import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import connectToDB from './utils/connectToDB.js'

import authRoutes from './routes/auth.routes.js'
import userRoutes from './routes/user.routes.js'
import productRoutes from './routes/product.routes.js'
import { v2 as cloudinary } from "cloudinary";

const app = express();
dotenv.config();

const clorsOption = {
    origin: ["http://localhost:5173", "https://farmik.in", "https://admin.farmik.in"],
    methods: "GET, POST, PUT, DELETE, PATCH, HEAD",
    credentials: true,
};

// Cloudinary Config
cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET,
});

app.use(cors(clorsOption));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({extended : true}));

// testing 
app.get('/', (req, res) => {
    res.send('API IS WORKING...');
});

// Auth routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/products', productRoutes)

app.listen(process.env.PORT, async() => {
    console.log(`Server listening on : localhost:${process.env.PORT}`);
    connectToDB()
    .then(() => console.log("DB connection successful"))
    .catch((err) => console.log("Error in connecting DB", err));
});