import User from "../models/user.model.js";

// User Profile API GET : /api/user/profile
export const userProfile = async (req, res) => {
    try {
        const { userId } = req.body

        if (!userId) {
            return res.status(400).json({ message: "User ID required!" });
        }

        // check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        res.status(200).json({
            success: true,
            message: "User profile",
            user,
        });

    } catch (error) {
        console.error("Error in get user profile:", err);
        res.status(500).json({ message: "Internal server error" });
    }
}

// Update User Profile API PATCH : /api/user/update-profile
export const updateProfile = async (req, res) => {
    try {
        const { userId, address, DOB, licenseNumber, accountNumber, ifscCode, aadharNumber } = req.body;

        if (!userId) {
            return res.status(400).json({ message: "User ID is required!" });
        }


        // check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        // Validation rules based on role
        if (!user.isProvider && !user.isAgent && !user.isAdmin) {
            if (!address || !DOB) {
                return res.status(400).json({ message: "Address and DOB are required!" });
            }
        }

        if (user.isProvider) {
            if (!address || !DOB || !licenseNumber || !accountNumber || !ifscCode || !aadharNumber) {
                return res.status(400).json({ message: "All fields are required!" });
            }
        }

        if (user.isAgent) {
            if (!address || !DOB || !accountNumber || !ifscCode || !aadharNumber) {
                return res.status(400).json({ message: "All fields are required!" });
            }
        }

        if (address) user.address = address;
        if (DOB) user.DOB = DOB;
        if (licenseNumber) user.licenseNumber = licenseNumber;
        if (accountNumber) user.accountNumber = accountNumber;
        if (ifscCode) user.ifscCode = ifscCode;
        if (aadharNumber) user.aadharNumber = aadharNumber;

        await user.save();

        res.status(200).json({
            message: "Your profile has been updated successfully",
            user,
        });
    } catch (err) {
        console.error("Error in update user profile:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

// User Current Location and Update Address API PATCH : /api/user/current-location
export const userCurrentLocation = async (req, res) => {
    const OPENCAGE_API = "https://api.opencagedata.com/geocode/v1/json";
    const { userId, latitude, longitude } = req.body;

    try {
        // Validate inputs
        if (!userId || !latitude || !longitude) {
            return res.status(400).json({ message: "userId, latitude and longitude are required!" });
        }

        // Find user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        // Fetch location from OpenCage
        let query = `${latitude},${longitude}`;
        let CURRENT_LOCATION = `${OPENCAGE_API}?q=${query}&key=${process.env.OPENCAGE_API_KEY}`;

        const response = await fetch(CURRENT_LOCATION);
        const data = await response.json();
        console.log(data.results[0]);
        

        if (!data.results || data.results.length === 0) {
            return res.status(400).json({ message: "Unable to fetch location details" });
        }

        const { city, state, postcode, country } = data.results[0].components;

        console.log("postcode:", postcode );
        

        // Update user address
        user.address = {
            street: data.results[0].formatted || "",
            city: city || "",
            state: state || "",
            postalCode: postcode || "",
            country: country || ""
        };

        await user.save();

        res.status(200).json({
            message: "User location updated successfully",
            address: user.address,
        });

    } catch (error) {
        console.error("Error in userCurrentLocation:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
