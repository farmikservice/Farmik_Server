import mongoose from "mongoose"

const otpSchema = new mongoose.Schema({

    phoneNumber: { 
        type: String, 
        required: true, 
        unique: true,
        maxLength : 13
    },
    otp: { 
        type: String, 
        required: true ,
        max : 6 // Change this to 4 in deployment
    },
    createdAt: { 
        type: Date, 
        default: Date.now, 
        expires: 300 
    },
    
})

const OTP = mongoose.model('OTP', otpSchema)
export default OTP;