import express from 'express'
import { ConfirmAgent, ConfirmProvider, login, logout, register, registerAgent, verifyOtp, verifyProvider } from '../controllers/auth.controller.js'
import { verifyToken } from '../middlewares/authMiddleware.js'

const authRoutes = express.Router()

authRoutes.post('/register', register)
authRoutes.post('/login', login)
authRoutes.post('/verify-otp', verifyOtp)
authRoutes.post('/logout', verifyToken, logout)
authRoutes.patch('/verify-provider', verifyToken, verifyProvider)
authRoutes.post('/register-agent', registerAgent)
authRoutes.patch('/confirm-provider', ConfirmProvider)
authRoutes.patch('/confirm-agent', ConfirmAgent)

export default authRoutes