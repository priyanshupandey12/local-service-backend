const Review = require("../models/review.model");
const Booking = require("../models/booking.model");
const ProviderProfile = require("../models/provider.model");

const createReview = async (req, res) => {
   const { providerId, rating, comment, bookingId } = req.body;
  try{
     const isProvider=await ProviderProfile.findOne({userId:providerId}) 
      if(!isProvider) {
              return res.status(404).json({ success: false, message: "Provider not found" });
      }
  const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.status !== "completed") {
      return res.status(400).json({ success: false, message: "Can only review completed bookings" });
    }


    if (booking.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

 
    const existingReview = await Review.findOne({ bookingId });
    if (existingReview) {
      return res.status(400).json({ success: false, message: "You have already reviewed this booking" });
    }

    const review = await Review.create({
      customerId: req.user._id,
      providerId,
      bookingId,
      rating,
      comment
    });


    const allReviews = await Review.find({ providerId });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await ProviderProfile.findOneAndUpdate(
      { userId: providerId },
      { avgRating: Math.round(avgRating * 10) / 10, totalReviews: allReviews.length }
    );

    res.status(201).json({ success: true, message: "Review submitted successfully", review });


  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
}

const getProviderReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ 
      providerId: req.params.providerId,
      isVisible: true 
    })
      .populate("customerId", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, reviews });

  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
}

module.exports = {
    createReview,
    getProviderReviews
}