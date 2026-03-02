const express=require("express");
const { getPendingProviders, approveProvider,
    getAllCategories, createCategory,
    updateCategory, deleteCategory,
        getAllReviews, toggleReviewVisibility
} = require("../controllers/admin.controller");
const router=express.Router();
const {authMiddleware,allowRoles}=require("../middleware/auth.middleware");


router.get("/providers/pending", authMiddleware, allowRoles("admin"), getPendingProviders);
router.patch("/providers/:id/approve", authMiddleware, allowRoles("admin"), approveProvider);
router.get("/categories", authMiddleware, allowRoles("admin"), getAllCategories);
router.post("/categories", authMiddleware, allowRoles("admin"), createCategory);
router.patch("/categories/:id", authMiddleware, allowRoles("admin"), updateCategory);
router.delete("/categories/:id", authMiddleware, allowRoles("admin"), deleteCategory);
router.get("/reviews", authMiddleware, allowRoles("admin"), getAllReviews);
router.patch("/reviews/:id/visibility", authMiddleware, allowRoles("admin"), toggleReviewVisibility);

module.exports=router;