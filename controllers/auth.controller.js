import OTP from "../models/otp.model.js"
import User from "../models/user.model.js"
import generateToken from "../utils/generateToken.js"
import { saveCookie } from "../utils/saveCookie.js"
import { sendOtp } from "../utils/sendOtp.js"


// Register API POST : /api/auth/register
export const register = async (req, res) => {
    try {
        const { fullName, phoneNumber } = req.body

        if (!fullName || !phoneNumber) {
            return res.status(400).json({ message: "All fields are required!" })
        }

        const isUserAlreadyExist = await User.findOne({ phoneNumber })
        if (isUserAlreadyExist) {
            return res.status(400).json({ message: "User already exist!" })
        }

        await sendOtp(phoneNumber)
        res.status(200).json({ message: "OTP sent successfully!" })

    } catch (err) {
        console.log("Error in register controller : ", err)
        res.status(500).json({ message: "Internal server error" })
    }
}

// Login API POST : /api/auth/login
export const login = async (req, res) => {
    try {
        const { phoneNumber } = req.body

        if (!phoneNumber) {
            return res.status(400).json({ message: "Phone number is required!" })
        }

        const user = await User.findOne({ phoneNumber })
        if (!user) return res.status(404).json({ message: "User not found!" })

        await sendOtp(phoneNumber)
        res.status(200).json({ message: "OTP sent successfully!" })

    } catch (err) {
        console.log("Error in login controller : ", err)
        res.status(500).json({ message: "Internal server error" })
    }
}

// Verify Otp API POST : /api/auth/verify-otp
export const verifyOtp = async (req, res) => {
    try {
        const { fullName, phoneNumber, otp } = req.body

        if (!phoneNumber || !otp) {
            return res.status(400).json({ message: "All fields are required!" })
        }

        const otpDetails = await OTP.findOne({ phoneNumber })
        if (!otpDetails || otpDetails.otp !== otp) {
            return res.status(400).json({ message: "Invalid or expired OTP!" })
        }

        const user = await User.findOne({ phoneNumber })

        if (user) {
            const token = generateToken(user._id, user.phoneNumber)
            saveCookie(token, res)
            return res.status(200).json({
                user: {
                    userId: user._id,
                    phoneNumber: user.phoneNumber,
                    token: token 
                },
                message: "OTP verified successfully!"
            })
        }

        if (!user) {
            const newUser = await User.create({ fullName, phoneNumber })
            const token = generateToken(newUser._id, newUser.phoneNumber)
            saveCookie(token, res)
            return res.status(200).json({
                user: {
                    userId: newUser._id,
                    phoneNumber: newUser.phoneNumber,
                    token: token 
                },
                message: "OTP verified successfully!"
            })
        }

    } catch (err) {
        console.log("Error in verify OTP controller", err)
        res.status(500).json({ message: "Internal server error!" })
    }
}

// Logout API POST : /api/auth/logout
export const logout = async (req, res) => {
    try {
        res.cookie('jwt', '', {
            maxAge: 0,
            httpOnly: true,
            secure: true,
            sameSite: "None"
        })
        return res.status(200).json({ message: "Logged out successfully!" });
    } catch (err) {
        console.log("Error in logout controller", logout)
        res.status(500).json({ message: "Internal server error!" })
    }
}

// Verify Provider API PATCH : /api/auth/verify-provider
export const verifyProvider = async (req, res) => {
    try {
        const { userId, address, DOB, licenseNumber, accountNumber, ifscCode, aadharNumber } = req.body;

        // validate required fields
        if (!userId || !address || !DOB || !licenseNumber || !accountNumber || !ifscCode || !aadharNumber) {
            return res.status(400).json({ message: "All fields are required!" });
        }

        // check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        // update user with provider details
        user.address = address;
        user.DOB = DOB;
        user.licenseNumber = licenseNumber;
        user.accountNumber = accountNumber;
        user.ifscCode = ifscCode;
        user.aadharNumber = aadharNumber;
        user.verificationStatus = "requested";

        await user.save();

        res.status(200).json({
            message: "Your profile is now under review",
            user,
        });
    } catch (err) {
        console.error("Error in provider verification:", err);
        res.status(500).json({ message: "Internal server error" });
    }
}

// register Agent API POST : /api/auth/register-agent
export const registerAgent = async (req, res) => {
  try {
    const { fullName, phoneNumber, address, DOB, accountNumber, ifscCode, aadharNumber } = req.body;

    // validate required fields
    if (!fullName || !phoneNumber || !address || !DOB || !accountNumber || !ifscCode || !aadharNumber) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    // check if agent already exists
    const existingAgent = await User.findOne({ phoneNumber });
    if (existingAgent) {
      return res.status(400).json({ message: "Agent already exists!" });
    }

    // create new agent
    const newAgent = new User({
      fullName,
      phoneNumber,
      address,
      DOB,
      accountNumber,
      ifscCode,
      aadharNumber,
      verificationStatus: "requested",
    });

    await newAgent.save();

    res.status(201).json({
      message: "Your profile is under review.",
      user: newAgent,
    });
  } catch (err) {
    console.error("Error in register agent:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Confirm Provider API PATCH : /api/auth/confirm-provider
export const ConfirmProvider = async (req, res) => {
  try {
    const { agentId, userId } = req.body;

    // validate required fields
    if (!agentId || !userId) {
      return res.status(400).json({ success: false, message: "Agent ID and User ID are required!" });
    }

    // check if requester is an agent
    const agent = await User.findById(agentId);
    if (agent.verificationStatus !== "confirmed" || !agent.isAgent) {
      return res.status(403).json({ success: false, message: "Only agents can confirm providers." });
    }

    // check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found!" });
    }

    // check if already verified provider
    if (user.isProvider && user.verificationStatus === "confirmed") {
      return res.status(400).json({ success: false, message: "User is already a verified provider." });
    }

    // confirm provider
    user.isProvider = true;
    user.verificationStatus = "confirmed";
    await user.save();

    res.status(200).json({
      success: true,
      message: "User has been confirmed as a provider partner.",
      confirmedBy: agent.fullName,
    });
  } catch (err) {
    console.error("Error in Confirm Provider:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Confirm Agent API PATCH : /api/auth/confirm-agent
export const ConfirmAgent = async (req, res) => {
  try {
    const { adminId, agentId } = req.body;

    // validate required fields
    if (!adminId || !agentId) {
      return res.status(400).json({ success: false, message: "Admin ID and Agent ID are required!" });
    }

    // check if requester is an admin
    const admin = await User.findById(adminId);
    if (!admin.isAdmin) {
      return res.status(403).json({ success: false, message: "Only admin can confirm agents." });
    }

    // check if agent exists
    const agent = await User.findById(agentId);
    if (!agent) {
      return res.status(404).json({ success: false, message: "Agent not found!" });
    }

    // check if already verified provider
    if (agent.isAgent && agent.verificationStatus === "confirmed") {
      return res.status(400).json({ success: false, message: "User is already a verified Agent." });
    }

    // confirm provider
    agent.isAgent = true;
    agent.verificationStatus = "confirmed";
    await agent.save();

    res.status(200).json({
      success: true,
      message: "User has been confirmed as a agent partner.",
      confirmedBy: admin.fullName,
      agent,
    });
  } catch (err) {
    console.error("Error in Confirm Agent:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
