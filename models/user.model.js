import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
    street: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    postalCode: { type: String, default: "" }
}, { _id: false });

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },

    phoneNumber: {
        type: String,
        required: true,
        unique: true,
        maxLength: 13
    },

    address: {
        type: addressSchema,
        default: {}
    },

    DOB: {
        type: Date,
        default: Date.now
    },

    licenseNumber: {
        type: String,
        default: null
    },

    isProvider: {
        type: Boolean,
        default: false
    },

    verificationStatus: {
        type: String,
        enum: ["pending", "confirmed", "rejected"],
        default: "pending"
    },

    aadharNumber: {
        type: String,
        default: null
    },

    isAgent: {
        type: Boolean,
        default: false
    },

    isAdmin: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const User = mongoose.model("User", userSchema);
export default User;
