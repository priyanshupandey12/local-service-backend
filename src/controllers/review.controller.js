const Review = require("../models/review.model");
const Booking = require("../models/booking.model");
const ProviderProfile = require("../models/provider.model");

const createReview = async (req, res) => {
  const { rating, comment } = req.body;

  try {
    if (!rating || !comment) {
      return res.status(400).json({ success: false, message: "Rating and comment are required" });
    }

    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

 
    if (booking.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

  
    if (booking.status !== "completed") {
      return res.status(400).json({ success: false, message: "Can only review a completed booking" });
    }

 
    const existingReview = await Review.findOne({ bookingId: req.params.bookingId });
    if (existingReview) {
      return res.status(400).json({ success: false, message: "Review already submitted for this booking" });
    }

    const review = await Review.create({
      bookingId: req.params.bookingId,
      customerId: req.user._id,
      providerId: booking.providerId,
      rating,
      comment
    });


    const allReviews = await Review.find({ providerId: booking.providerId, isVisible: true });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await ProviderProfile.findOneAndUpdate(
      { userId: booking.providerId },
      { avgRating: avgRating.toFixed(1), totalReviews: allReviews.length }
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