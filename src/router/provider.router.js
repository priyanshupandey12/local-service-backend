const express=require("express");
const { createProviderProfile ,updateProviderProfile,getAllProviders,getProviderById,toggleAvailability} = require("../controllers/provider.controller");
const router=express.Router();
const upload=require("../utils/multer");
const {authMiddleware,allowRoles}=require("../middleware/auth.middleware");


router.get("/", getAllProviders);  
router.get("/:id", getProviderById);
router.patch("/availability", authMiddleware, allowRoles("provider"), toggleAvailability);
router.post("/profile", authMiddleware, allowRoles("provider"), upload.single("profilePhoto"), createProviderProfile);
router.patch("/profile", authMiddleware, allowRoles("provider"), upload.single("profilePhoto"), updateProviderProfile);

module.exports=router;