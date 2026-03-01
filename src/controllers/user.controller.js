const User= require('../models/user.model');
const ProviderProfile = require('../models/provider.models');
const { generateToken } = require('../utils/token.utils');

const registerUser = async (req, res) => {
     const  { name, email, password , role} = req.body;
      try {
        if([name, email, password].some(field => field.trim() === "")) {
            return res.status(400).json({success: false, message: "All fields are required and cannot be empty" });
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({success: false, message: "Email already in use" });
        }

        const newUser= await User.create({ name, email, password, role });

        
         generateToken(res, newUser._id, "User registered successfully");


      } catch (error) {
        res.status(500).json({success: false, message: "Internal server error", error: error.message });
      }
}

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
    if (!email || !password) {
    return res.status(400).json({ success: false, message: "All fields are required" });
        }

    const user = await User.findOne({ email: email.toLowerCase() }).select(
     "+password"
    );

 
    if(!user || !(await user.comparePassword(password))) {
    return res.status(401).json({success: false, message: "Invalid email or password" });
    }
          
    if (user.role === "provider") {
    const providerProfile = await ProviderProfile.findOne({ userId: user._id });
    if (!providerProfile || providerProfile.isApproved === false) {
        return res.status(403).json({ success: false, message: "Your account is pending admin approval" });
            }
            }

    generateToken(res, user._id, "User logged in successfully");
    
     } catch (error) {
        res.status(500).json({success: false, message: "Internal server error", error: error.message });
     }
}


const logoutUser = (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
    });
    res.status(200).json({ success: true, message: "User logged out successfully" });
}


const getCurrentUser = async (req, res) => {

      try {
        const user = await User.findById(req.user._id)
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.status(200).json({ success: true, user });
      } catch (error) {
        
      }
}



module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser
}