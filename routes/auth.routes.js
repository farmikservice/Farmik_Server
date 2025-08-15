import express from 'express'
import { login, logout, register, verifyOtp } from '../controllers/auth.controller.js'
import { verifyToken } from '../middlewares/authMiddleware.js'

const authRoutes = express.Router()

authRoutes.post('/register', register)
authRoutes.post('/login', login)
authRoutes.post('/verify-otp', verifyOtp)
authRoutes.post('/logout', verifyToken, logout)

export default authRoutes