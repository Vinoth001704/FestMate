import mongoose from "mongoose";

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true, // Ensure email is unique
    },
    password: {
        type: String,
        required: true,
    },
    context: {
        type: Number,   
        required: true,
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        default: 'Other',
    },
    role: {
        type: String,
        enum: ['Student', 'Admin', 'Coordinator'],
        default: 'Student',
    },
    createdAt: {
        type: Date,
        default: Date.now, // Automatically set creation date
    },
    updatedAt: {
        type: Date,
        default: Date.now, // Automatically set update date
    },
}, { timestamps: true });

export const User = mongoose.model("users", schema);