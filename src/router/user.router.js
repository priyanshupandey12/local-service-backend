const express=require("express");
const { registerUser, loginUser,logoutUser,getCurrentUser } = require("../controllers/user.controller");
const router=express.Router();
const {registrationLimiter,authLimiter}=require("../middleware/ratelimiter.middleware");
const {authMiddleware}=require("../middleware/auth.middleware");


router.post("/register", registrationLimiter, registerUser);
router.get("/me", authMiddleware, getCurrentUser);
router.post("/logout", logoutUser);
router.post("/login", authLimiter, loginUser);


module.exports=router;