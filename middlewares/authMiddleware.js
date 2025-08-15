import jwt from 'jsonwebtoken'
import User from '../models/user.model.js'

export const verifyToken = async(req, res, next) => {

    const token = req.cookies.jwt
    if(!token) {
        return res.status(401).json({message : "Unauthorized - No token provided"})
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
    if(!decodedToken) {
        return res.status(401).json({message : "Unauthorized - Invalid token provided."})
    }

    const user = await User.findById(decodedToken.userId) 
    if(!user) {
        return res.status(404).json({message : "User not found"})
    }

    req.user = user

    next();
}