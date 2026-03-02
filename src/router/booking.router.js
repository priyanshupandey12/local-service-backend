const express=require("express");
const { createBooking,getCustomerBookings,
    getProviderBookings,getBookingById,
    updateBookingStatus,cancelBooking,
    rescheduleBooking,updateBookingImages
} = require("../controllers/booking.controller");
const router=express.Router();
const upload=require("../utils/multer");
const {authMiddleware,allowRoles}=require("../middleware/auth.middleware");

router.post("/", authMiddleware, allowRoles("customer"), createBooking);

router.get("/customer", authMiddleware, allowRoles("customer"), getCustomerBookings);
router.get("/provider", authMiddleware, allowRoles("provider"), getProviderBookings);

router.get("/:id", authMiddleware, allowRoles("customer", "provider"), getBookingById);

router.patch(
  "/:id/status",
  authMiddleware,
  allowRoles("provider"),
  updateBookingStatus
);

router.patch(
  "/:id/images",
  authMiddleware,
  allowRoles("provider"),
  upload.fields([
    { name: "beforeImages", maxCount: 3 },
    { name: "afterImages", maxCount: 3 }
  ]),
  updateBookingImages
);

router.patch("/:id/reschedule", authMiddleware, allowRoles("customer"), rescheduleBooking);
router.patch("/:id/cancel", authMiddleware, allowRoles("customer"), cancelBooking);


module.exports=router;