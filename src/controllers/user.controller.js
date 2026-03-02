const User= require('../models/user.model');
const generateToken  = require('../utils/generateToken');

const registerUser = async (req, res) => {
     const  { name, email, password , role} = req.body;
      try {
        if([name, email, password].some(field => !field || field.trim() === "")) {
            return res.status(400).json({success: false, message: "All fields are required and cannot be empty" });
        }
        if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 6 characters"
           });
         }
          if (!["customer", "provider"].includes(role)) {
           return res.status(400).json({ message: "Invalid role" });
                }
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({success: false, message: "Email already in use" });
        }

        const newUser= await User.create({ name, email, password, role });

        
         generateToken(res, newUser, "User registered successfully");


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
          


generateToken(res, user, `Welcome back, ${user.name}! You have logged in successfully`);
    
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
        const user = await User.findById(req.user._id ).select("-__v -createdAt -updatedAt");
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