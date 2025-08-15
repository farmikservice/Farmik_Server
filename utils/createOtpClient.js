import twilio from 'twilio'

export default function createOtpClient() {
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN )
    return client
}