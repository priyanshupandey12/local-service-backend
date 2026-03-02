const express=require("express");
const { registerUser, loginUser,logoutUser,getCurrentUser } = require("../controllers/user.controller");
const router=express.Router();
const {authMiddleware}=require("../middleware/auth.middleware");


router.post("/register", registerUser);
router.get("/me", authMiddleware, getCurrentUser);
router.post("/logout", logoutUser);
router.post("/login", loginUser);


module.exports=router;