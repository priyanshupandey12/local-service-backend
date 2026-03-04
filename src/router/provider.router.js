const express=require("express");
const { createProviderProfile ,updateProviderProfile,getAllProviders,getProviderById,toggleAvailability,getProviderProfile} = require("../controllers/provider.controller");
const router=express.Router();
const upload=require("../utils/multer");
const {authMiddleware,allowRoles}=require("../middleware/auth.middleware");



router.get("/profile", authMiddleware, allowRoles("provider"), getProviderProfile);
router.post("/profile", authMiddleware, allowRoles("provider"), upload.single("profilePhoto"), createProviderProfile);
router.patch("/profile", authMiddleware, allowRoles("provider"), upload.single("profilePhoto"), updateProviderProfile);
router.patch("/availability", authMiddleware, allowRoles("provider"), toggleAvailability);
router.get("/", getAllProviders);
router.get("/:id", getProviderById);

module.exports=router;