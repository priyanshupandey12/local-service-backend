const jwt=require("jsonwebtoken");
const User = require("../models/user.model");


const authMiddleware = async (req, res, next) => {

    const  token=req.cookies.token ||req.header("Authorization")?.replace("Bearer ", "");
    try {
        if (!token) {
           
            return res.status(401).json({ success: false, message: "Unauthorized access" });
        }
        const decoded = await jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById({ _id: decoded.userId });
        if (!user) {
            return res.status(401).json({ success: false, message: "User not found" });
        }
        req.user = user;
        next();
    } catch (error) {
        if(error.name === "JsonWebTokenError"){
            return res.status(401).json({ success: false, message: "Invalid token" });
        }
        if(error.name === "TokenExpiredError"){
            return res.status(401).json({ success: false, message: "Token expired" });
        }
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
}


const allowRoles = (...roles) => {
     return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ success: false, message: "Forbidden: You don't have permission to access this resource" });
        }
        next();
     }
}


module.exports = {
    authMiddleware,
    allowRoles
}
