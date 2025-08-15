import OTP from "../models/otp.model.js"
import User from "../models/user.model.js"
import generateToken from "../utils/generateToken.js"
import { saveCookie } from "../utils/saveCookie.js"
import { sendOtp } from "../utils/sendOtp.js"


// Register API POST : /api/auth/register
export const register = async(req, res) => {
    try {
        const { fullName, phoneNumber } = req.body

        if(!fullName || !phoneNumber) {
            return res.status(400).json({message : "All fields are required!"})
        } 
        
        const isUserAlreadyExist = await User.findOne({phoneNumber}) 
        if(isUserAlreadyExist) {
            return res.status(400).json({message : "User already exist!"})
        }
            
        await sendOtp(phoneNumber)
        res.status(200).json({message : "OTP sent successfully!"}) 

    } catch(err) {
        console.log("Error in register controller : ", err)
        res.status(500).json({message : "Internal server error"})
    }        
}

// Login API POST : /api/auth/login
export const login = async(req, res) => {   
    try {
        const { phoneNumber } = req.body

        if(!phoneNumber) {
            return res.status(400).json({message : "Phone number is required!"})
        } 
        
        const user = await User.findOne({phoneNumber})
        if(!user) return res.status(404).json({message : "User not found!"})
            
        await sendOtp(phoneNumber)
        res.status(200).json({message : "OTP sent successfully!"}) 

    } catch(err) {
        console.log("Error in login controller : ", err)
        res.status(500).json({message : "Internal server error"})
    }        
}

// Verify Otp API POST : /api/auth/verify-otp
export const verifyOtp = async (req, res) => {
    try {
        const {fullName, phoneNumber, otp} = req.body
        
        if(!phoneNumber || !otp) {
            return res.status(400).json({message : "All fields are required!"})
        }

        const otpDetails = await OTP.findOne({phoneNumber})
        if(!otpDetails || otpDetails.otp !== otp) {
            return res.status(400).json({message : "Invalid or expired OTP!"})
        }

        const user = await User.findOne({phoneNumber})

        if(user) {
            const token = generateToken(user._id, user.phoneNumber)
            saveCookie(token, res)
            return res.status(200).json({
                user : {
                    userId : user._id,
                    phoneNumber : user.phoneNumber
                },
                message : "OTP verified successfully!"
            })
        }

        if(!user) {
            const newUser = await User.create({fullName, phoneNumber})
            const token = generateToken(newUser._id, newUser.phoneNumber)
            saveCookie(token, res)
            return res.status(200).json({
                user : {
                    userId : newUser._id,
                    phoneNumber : newUser.phoneNumber
                },
                message : "OTP verified successfully!"
            })
        }
  
    } catch(err) {
        console.log("Error in verify OTP controller", err)
        res.status(500).json({message : "Internal server error!"})
    }
}

// Logout API POST : /api/auth/logout
export const logout = async(req, res) => {
    try {
        res.cookie('jwt', '', {
            maxAge : 0,   
            httpOnly : true,
            secure : true,
            sameSite : "None"
        })
        return res.status(200).json({ message: "Logged out successfully!" });
    } catch(err) {
        console.log("Error in logout controller", logout)
        res.status(500).json({message : "Internal server error!"})
    }
}