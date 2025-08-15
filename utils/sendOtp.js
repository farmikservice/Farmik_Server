import OTP from "../models/otp.model.js"
import generateOtp from "./generateOtp.js"
import createOtpClient from "./createOtpClient.js"

export const sendOtp = async(phoneNumber) => {
    try {
        const otp = generateOtp()
        await OTP.findOneAndUpdate(
            { phoneNumber },
            { otp, createdAt: new Date() },
            { upsert: true, new: true }
        )
        
        const client = createOtpClient()
        await client.messages.create({
            body : `You OTP is ${otp}`,
            from : process.env.TWILIO_PHONE_NUMBER,
            to : phoneNumber,
        })  

    } catch(err) {
        console.log("Error in send OTP function", err)
    }
}