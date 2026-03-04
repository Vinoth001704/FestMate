import { User } from "../models/users.js";
import bcrypt from"bcrypt";
import jwt from"jsonwebtoken";
import sendMail from "../middleware/sendMail.js";
import mongoose from "mongoose";

export const registerUser=async(req,res)=>{ 
    try {
        const {name, email, password, context, role, gender} = req.body;

        // --- Data Transformation & Validation ---
        // Normalize role input (accept string or object with `name`)
        let roleName = null;
        if (typeof role === 'string' && role.trim()) {
            const r = role.trim();
            roleName = r.charAt(0).toUpperCase() + r.slice(1);
        } else if (role && typeof role === 'object' && role.name) {
            const r = String(role.name).trim();
            if (r) roleName = r.charAt(0).toUpperCase() + r.slice(1);
        }

        // Normalize gender (if provided)
        let genderName = null;
        if (gender !== undefined && gender !== null) {
            const g = String(gender).trim();
            if (g) genderName = g.charAt(0).toUpperCase() + g.slice(1);
        }

        // Normalize context and ensure it's a valid number
        let contextNumber = null;
        if (context !== undefined && context !== null && context !== '') {
            const num = Number(context);
            contextNumber = Number.isNaN(num) ? null : num;
        }

        // Validate required fields and return early with missing list
        const missing = [];
        if (!name) missing.push('name');
        if (!email) missing.push('email');
        if (!password) missing.push('password');
        if (contextNumber === null) missing.push('context');
        if (!roleName) missing.push('role');
        if (missing.length) {
            return res.status(400).json({
                message: `Missing required fields: ${missing.join(', ')}`,
            });
        }

        const allowedGenders = ['Male', 'Female', 'Other'];
        if (genderName && !allowedGenders.includes(genderName)) {
            return res.status(400).json({ message: 'Invalid gender value' });
        }

        // Prevent duplicate emails
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(409).json({ message: 'Email already registered' });
        }

        // Hash password before saving
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create an activation OTP and token instead of directly creating the user
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        const activationPayload = {
            user: {
                name,
                email,
                password: hashedPassword,
                context: contextNumber,
                role: roleName,
                gender: genderName,
            },
            otp,
        };

        console.log(otp);
        const activationToken = jwt.sign(activationPayload, process.env.ACTIVATION_SECRET, { expiresIn: '10m' });

        // Send OTP to user's email
        const subject = 'Account Activation - OTP';
        const text = `Your account activation OTP is: ${otp}. It expires in 10 minutes.`;
        await sendMail(email, subject, text);

        return res.status(200).json({ message: 'OTP sent to email', activationToken });

    } catch (error) {
        return res.status(500).json({
            message:error.message,error
        })
        
    }
}
export const verifyData=async (req,res) => {
    try {
        const {otp,activationToken}=req.body;
        const verify=jwt.verify(activationToken,process.env.ACTIVATION_SECRET);
        
        if(!verify){
        return res.json({
            message:"OTP Expired",
        })
        }
        if(verify.otp!=otp){
            return res.json({
                message:"Wrong OTP",
            });
        }

        const newUser = await User.create({
            name: verify.user.name,
            email: verify.user.email,
            password: verify.user.password,
            context: verify.user.context,
            role: verify.user.role,
            gender: verify.user.gender,
        });

        // Send registration success email
        const subject = 'Registration Successful - FestMate';
        const text = `Hi ${newUser.name},\n\nYou have successfully registered your account on FestMate.\n\nWelcome aboard!`;
        await sendMail(newUser.email, subject, text);

        return res.status(200).json({
            message:"Created Success",
        })


    } catch (error) {
        return res.status(500).json({
            message:error.message,
        })
        
    }
}
export const loginUser=async(req,res)=>{
    try {
        const {email,password}=req.body;
        const user=await User.findOne({email});
        if(!user){
            return res.status(400).json({
                message:"Invaild Credential",
            })
        }
        const matchPassword=await bcrypt.compare(password,user.password);
        if(!matchPassword){
            return res.status(400).json({
                message:"password missmaching",
            });
        }
        const token=jwt.sign({_id:user.id},process.env.JWT_SECRET);

        // Send login notification email with timestamp
        const loginTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        const subject = 'Login Alert - FestMate';
        const text = `Hi ${user.name},\n\nYou logged in at ${loginTime}.\n\nIf this wasn't you, please secure your account immediately.`;
        sendMail(user.email, subject, text).catch(err => console.error('Login mail failed:', err.message));

        const {password:userPassword,...userDetails}=user.toObject();
        return res.status(200).json({
            message:`Login Successfully`,
            token,
            user:userDetails,
        })
    } catch (error) {
        return res.status(400).json({
            message:error.message,
        })
    }
}
export const myprofile=async(req,res)=>{
    try {
        const user=await User.findById(req.user._id).select("-password");
        return res.status(200).json({
            user,
        })
    } catch (error) {
        return res.status(500).json({
            message:error.message,
        })
    }
}
export const profile=async(req,res)=>{
   try {
           let id=req.params.id;
           if(!mongoose.Types.ObjectId.isValid(id)){
               return res.status(400).json({
                   message:"Invalid user ID"
               })
           }
           const user=await User.findById(id).select("-password");
           if(!user){
               return res.status(403).json({
                   message:"invalid user Details",
               })
           }
           return res.status(200).json({
               user,
           })
           
       } catch (error) {
           return res.status(400).json({
               message:error.message
           })
       }
}

export const userdetails=async(req,res)=>{
    try {
       let id=req.params.id;
        const user=await User.findById(id).select("-password");
        user.password=undefined;

        return res.status(200).json({
           user,
        })
        
    } catch (error) {
        return res.status(400).json({
            message:error.message
        })
    }
}

export const listUser=async(req,res)=>{
    try {
        const users=await User.find().select("-password");

        return res.status(200).json({
           users,
        })
        
    } catch (error) {
        return res.status(400).json({
            message:error.message
        })
    }
}
export const deleteUser = async (req, res) => {
    try {
        const id = req.params.id;
        
        // Validate the user ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid user ID",
            });
        }

        // Find and delete the user
        const user = await User.findByIdAndDelete(id);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        // Notify the user about account deletion via email
        const subject = 'Account Removed - FestMate';
        const text = `Dear ${user.name},\n\nWe regret to inform you that your FestMate account associated with this email has been removed by the administrator due to insufficient or suspicious activity on your account. This action was taken to maintain the integrity and safety of our platform.\n\nIf you believe this was done in error, or if you have any questions regarding this decision, please do not hesitate to reach out to our admin team at ${process.env.GMAIL}.\n\nWe appreciate your understanding.\n\nRegards,\nFestMate Admin Team`;
        sendMail(user.email, subject, text).catch(err => console.error('Delete notification mail failed:', err.message));

        return res.status(200).json({
            message: "User deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
        });
    }
};