const express=require("express");
const { getProviders, approveProvider,
    getAllCategories, createCategory,
    updateCategory, deleteCategory,
        getAllReviews, toggleReviewVisibility, getStats, getAllBookings
} = require("../controllers/admin.controller");
const router=express.Router();
const upload=require("../utils/multer");
const {authMiddleware,allowRoles}=require("../middleware/auth.middleware");

router.get("/bookings", authMiddleware, allowRoles("admin"), getAllBookings);
router.get("/providers", authMiddleware, allowRoles("admin"), getProviders);
router.patch("/providers/:id/approve", authMiddleware, allowRoles("admin"), approveProvider);
router.get("/categories", authMiddleware, allowRoles("admin"), getAllCategories);
router.post("/categories", authMiddleware, allowRoles("admin"), upload.single("image"), createCategory);
router.patch("/categories/:id", authMiddleware, allowRoles("admin"), upload.single("image"), updateCategory);
router.delete("/categories/:id", authMiddleware, allowRoles("admin"), deleteCategory);
router.get("/reviews", authMiddleware, allowRoles("admin"), getAllReviews);
router.patch("/reviews/:id/visibility", authMiddleware, allowRoles("admin"), toggleReviewVisibility);
router.get("/stats", authMiddleware, allowRoles("admin"), getStats);


module.exports=router;