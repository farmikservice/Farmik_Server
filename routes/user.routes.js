import express from 'express'
import { verifyToken } from '../middlewares/authMiddleware.js';
import { updateProfile, userCurrentLocation, userProfile } from '../controllers/user.controller.js';

const userRoutes = express.Router();

userRoutes.get('/profile', verifyToken, userProfile)
userRoutes.patch('/update-profile', verifyToken, updateProfile)
userRoutes.patch('/current-location', verifyToken, userCurrentLocation)

export default userRoutes