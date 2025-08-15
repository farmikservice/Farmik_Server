import jwt from 'jsonwebtoken'

export default function generateToken(userId, phoneNumber) {
    return jwt.sign({userId, phoneNumber}, process.env.JWT_SECRET, {
        expiresIn : 7 * 24 * 60 * 60 * 1000
    })
}