const Booking = require('../models/booking.model');
const ProviderProfile = require('../models/provider.model');
const { uploadMedia } = require('../utils/cloudinary');
const fs = require('fs');

const createBooking = async (req, res) => {
  const { providerId, categoryId, address, scheduledDate, scheduledTime, problemDescription } = req.body;

  try {
    if ([providerId, categoryId, address, scheduledDate, scheduledTime, problemDescription].some(field => !field || field.trim() === "")) {
      return res.status(400).json({ success: false, message: "All fields are required and cannot be empty" });
    }


    const providerProfile = await ProviderProfile.findOne({ userId: providerId });
    if (!providerProfile || !providerProfile.isApproved || !providerProfile.isAvailable) {
      return res.status(400).json({ success: false, message: "Provider not available" });
    }

    let customerImageUrl = null;
    if (req.file) {
      const result = await uploadMedia(req.file.path);
      customerImageUrl = result.secure_url;
      fs.unlinkSync(req.file.path);
    }

    const booking = await Booking.create({
      customerId: req.user._id,
      providerId,
      categoryId,
      address,
      scheduledDate,
      scheduledTime,
      problemDescription,
      customerImage: customerImageUrl,
      status: "requested"
    });

    res.status(201).json({ success: true, message: "Booking created successfully", booking });

  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
}

const getCustomerBookings = async (req, res) => {
  try {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

const bookings = await Booking.find({ customerId: req.user._id })
  .select("-problemDescription -customerImage -beforeImages -afterImages -jobNotes -__v -updatedAt -createdAt")
  .populate("providerId", "name")
  .populate("categoryId", "name basePrice")
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit);

const total = await Booking.countDocuments({ customerId: req.user._id });

res.status(200).json({
  success: true,
  total,
  page,
  totalPages: Math.ceil(total / limit),
  bookings
});

  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
}

const getProviderBookings = async (req, res) => {
  try {
      const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
    const bookings = await Booking.find({ providerId: req.user._id })
    .select("-problemDescription -customerImage -beforeImages -afterImages -jobNotes -__v -updatedAt -createdAt")
  .populate("customerId", "name")
  .populate("categoryId", "name basePrice")
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit);

   const total = await Booking.countDocuments({ providerId: req.user._id });

res.status(200).json({
  success: true,
  total,
  page,
  totalPages: Math.ceil(total / limit),
  bookings
});

  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
}


const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .select("-__v -updatedAt -createdAt")
      .populate("customerId", "name")
      .populate("providerId", "name")
      .populate("categoryId", "name basePrice");

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (
      booking.customerId._id.toString() !== req.user._id.toString() &&
      booking.providerId._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    res.status(200).json({ success: true, booking });

  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
}


const updateBookingStatus = async (req, res) => {
  const { status, jobNotes } = req.body;

  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.providerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }


    const allowedTransitions = {
      "requested": ["confirmed", "cancelled"],
      "confirmed": ["in-progress"],
      "in-progress": ["completed"]
    };

    if (!allowedTransitions[booking.status]?.includes(status)) {
      return res.status(400).json({ success: false, message: `Cannot transition from ${booking.status} to ${status}` });
    }

 

         booking.status = status;
         if (jobNotes) booking.jobNotes = jobNotes;
        await booking.save();

    res.status(200).json({ success: true, message: "Status updated successfully", booking });

  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
}

const updateBookingImages = async (req, res) => {
  const { jobNotes } = req.body;

  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.providerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

  
    if (booking.status !== "completed") {
      return res.status(400).json({ success: false, message: "Can only update images for completed booking" });
    }

    if (!req.files?.beforeImages || !req.files?.afterImages) {
      return res.status(400).json({ success: false, message: "Before and after images are required" });
    }

    const beforeImages = await Promise.all(
      req.files.beforeImages.map(async (file) => {
        const result = await uploadMedia(file.path);
        fs.unlinkSync(file.path);
        return result.secure_url;
      })
    );

    const afterImages = await Promise.all(
      req.files.afterImages.map(async (file) => {
        const result = await uploadMedia(file.path);
        fs.unlinkSync(file.path);
        return result.secure_url;
      })
    );

    booking.beforeImages = beforeImages;
    booking.afterImages = afterImages;
    if (jobNotes) booking.jobNotes = jobNotes;
    await booking.save();

    res.status(200).json({ success: true, message: "Images updated successfully", booking });

  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
}


const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    
    if (booking.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

   
    if (!["requested", "confirmed"].includes(booking.status)) {
      return res.status(400).json({ success: false, message: `Booking cannot be cancelled at ${booking.status} stage` });
    }

    booking.status = "cancelled";
    await booking.save();

    res.status(200).json({ success: true, message: "Booking cancelled successfully", booking });

  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
}

const rescheduleBooking = async (req, res) => {
  const { scheduledDate, scheduledTime } = req.body;

  try {
    if (!scheduledDate || !scheduledTime) {
      return res.status(400).json({ success: false, message: "New date and time are required" });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

 
    if (booking.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

   
    if (!["requested", "confirmed"].includes(booking.status)) {
      return res.status(400).json({ success: false, message: `Booking cannot be rescheduled at ${booking.status} stage` });
    }

    booking.scheduledDate = scheduledDate;
    booking.scheduledTime = scheduledTime;
    await booking.save();

    res.status(200).json({ success: true, message: "Booking rescheduled successfully", booking });

  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
}

module.exports = {
    createBooking,
    getCustomerBookings,
    getProviderBookings,
    getBookingById,
    updateBookingStatus,
    cancelBooking,
    rescheduleBooking,
    updateBookingImages

}