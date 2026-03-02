const express=require("express");
const { createReview, getProviderReviews
} = require("../controllers/review.controller");
const router=express.Router();
const {authMiddleware,allowRoles}=require("../middleware/auth.middleware");


router.post("/:bookingId", authMiddleware, allowRoles("customer"), createReview);
router.get("/provider/:providerId", authMiddleware, getProviderReviews);


module.exports=router;