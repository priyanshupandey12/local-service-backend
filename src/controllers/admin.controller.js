const Review = require("../models/review.model");
const User = require("../models/user.model");
const ProviderProfile = require("../models/provider.model");
const ServiceCategory = require("../models/serviceCategory.model");
const Booking = require("../models/booking.model");
const { uploadMedia ,deleteMediaFromCloudinary} = require("../utils/cloudinary");
const fs = require("fs");

const getProviders = async (req, res) => {
  try {
    const providers = await ProviderProfile.find()
      .populate("userId", "name email")
      .populate("category", "name basePrice")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, providers });

  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
}

const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("customerId", "name")
      .populate("providerId", "name")
      .populate("categoryId", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

const approveProvider = async (req, res) => {
  const { isApproved } = req.body;

  try {
    const profile = await ProviderProfile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Provider not found" });
    }
     profile.isApproved = isApproved;
     profile.status = isApproved ? "approved" : "rejected";
     await profile.save();

    res.status(200).json({ 
      success: true, 
      message: `Provider ${isApproved ? "approved" : "rejected"} `,
      profile 
    });

  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
}

const getAllCategories = async (req, res) => {
  try {
    const categories = await ServiceCategory.find().sort({ createdAt: -1 }).select("name basePrice isActive image description");

    res.status(200).json({ success: true, categories });

  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
}

const getPublicCategories = async (req, res) => {
  try {
    const categories = await ServiceCategory.find({isActive:true}).sort({ createdAt: -1 }).select("name basePrice isActive image description");

    res.status(200).json({ success: true, categories });

  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
}

const createCategory = async (req, res) => {
  const { name, description, basePrice } = req.body;

  try {
    if (!name || !description || basePrice === undefined) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }
       const price = Number(basePrice);
        if (!Number.isFinite(price) || price <= 0) {
      return res.status(400).json({
        success: false,
        message: "Base price must be a positive number and greater than zero"
      });
    }

    const existingCategory = await ServiceCategory.findOne({ name: { $regex: `^${name}$`, $options: "i" } });
    if (existingCategory) {
      return res.status(400).json({ success: false, message: "Category already exists" });
    }
       let imageUrl = null;
    if (req.file) {
      const result = await uploadMedia(req.file.path);
      imageUrl = result.secure_url;
      fs.unlinkSync(req.file.path);
    }

    const category = await ServiceCategory.create({ name, description, basePrice: price, image: imageUrl });

    res.status(201).json({ success: true, message: "Category created successfully", category });

  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
}


const updateCategory = async (req, res) => {
  const { name, description, basePrice, isActive } = req.body;

  try {

          const price = Number(basePrice);
        if (!Number.isFinite(price) || price <= 0) {
      return res.status(400).json({
        success: false,
        message: "Base price must be a positive number and greater than zero"
      });
    }
    const category = await ServiceCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
     let imageUrl = category.image; 
    if (req.file) {
    
      if (category.image) {
        const publicId = category.image.split("/").pop().split(".")[0];
        await deleteMediaFromCloudinary(publicId);
      }
      const result = await uploadMedia(req.file.path);
      imageUrl = result.secure_url;
      fs.unlinkSync(req.file.path);
    }

    const updatedCategory = await ServiceCategory.findByIdAndUpdate(
      req.params.id,
      { name, description, basePrice: price, isActive , image: imageUrl},
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, message: "Category updated successfully", category: updatedCategory });

  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
}

const deleteCategory = async (req, res) => {
  try {
    const category = await ServiceCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    await ServiceCategory.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: "Category deleted successfully" });

  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
}

const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("customerId", "name")
      .populate("providerId", "name")
      .populate("bookingId")
      .sort({ createdAt: -1 }).select("-__v -updatedAt -createdAt ");

    res.status(200).json({ success: true, reviews });

  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
}

const toggleReviewVisibility = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    review.isVisible = !review.isVisible;
    await review.save();

    res.status(200).json({ 
      success: true, 
      message: `Review ${review.isVisible ? "visible" : "hidden"} successfully`,
      review 
    });

  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
}

const deleteProvider = async (req, res) => {
  try {
    const provider = await ProviderProfile.findById(req.params.id);
    if (!provider) {
      return res.status(404).json({ success: false, message: "Provider not found" });
    }

    const userId = provider.userId;

    await Booking.deleteMany({ providerId: userId });
    await Review.deleteMany({ providerId: userId });
    await ProviderProfile.findByIdAndDelete(req.params.id);
    await User.findByIdAndDelete(userId);

    res.status(200).json({ success: true, message: "Provider and related data deleted successfully" });

  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    const providerId = review.providerId;
    await Review.findByIdAndDelete(req.params.id);

    const remainingReviews = await Review.find({ providerId });
    const avgRating = remainingReviews.length > 0
      ? remainingReviews.reduce((sum, r) => sum + r.rating, 0) / remainingReviews.length
      : 0;

    await ProviderProfile.findOneAndUpdate(
      { userId: providerId },
      { avgRating: Math.round(avgRating * 10) / 10, totalReviews: remainingReviews.length }
    );

    res.status(200).json({ success: true, message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getStats = async (req, res) => {
  try {
    const totalCustomers = await User.countDocuments({ role: "customer" });
    const totalProviders = await User.countDocuments({ role: "provider" });
    const pendingApprovals = await ProviderProfile.countDocuments({ isApproved: false });
    const totalReviews = await Review.countDocuments();
    const totalBookings = await Booking.countDocuments();

    res.status(200).json({
      success: true,
      stats: {
        totalCustomers,
        totalProviders,
        pendingApprovals,
        totalReviews,
        totalBookings,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

module.exports = {
    getProviders,
    approveProvider,
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getAllReviews,
    toggleReviewVisibility,
    getStats,
    getAllBookings,
    deleteProvider,
    deleteReview,
    getPublicCategories
}