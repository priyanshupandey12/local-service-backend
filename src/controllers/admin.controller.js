const Review = require("../models/review.model");
const ProviderProfile = require("../models/provider.model");
const ServiceCategory = require("../models/serviceCategory.model");


const getPendingProviders = async (req, res) => {
  try {
    const providers = await ProviderProfile.find({ isApproved: false })
      .populate("userId", "name email")
      .populate("category", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, providers });

  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
}

const approveProvider = async (req, res) => {
  const { isApproved } = req.body;

  try {
    const profile = await ProviderProfile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Provider not found" });
    }

    profile.isApproved = isApproved;
    await profile.save();

    res.status(200).json({ 
      success: true, 
      message: `Provider ${isApproved ? "approved" : "rejected"} successfully`,
      profile 
    });

  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
}

const getAllCategories = async (req, res) => {
  try {
    const categories = await ServiceCategory.find().sort({ createdAt: -1 }).select("name basePrice isActive");

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
     if(!Number.isFinite(basePrice) || basePrice <= 0 || typeof basePrice !== "number"){
      return res.status(400).json({ success: false, message: "Base price must be a positive number and Greater than zero" });
     }

    const existingCategory = await ServiceCategory.findOne({ name: { $regex: `^${name}$`, $options: "i" } });
    if (existingCategory) {
      return res.status(400).json({ success: false, message: "Category already exists" });
    }

    const category = await ServiceCategory.create({ name, description, basePrice });

    res.status(201).json({ success: true, message: "Category created successfully", category });

  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
}


const updateCategory = async (req, res) => {
  const { name, description, basePrice, isActive } = req.body;

  try {

       if(!Number.isFinite(basePrice) || basePrice <= 0 || typeof basePrice !== "number"){
      return res.status(400).json({ success: false, message: "Base price must be a positive number and Greater than zero" });
     }
    const category = await ServiceCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    const updatedCategory = await ServiceCategory.findByIdAndUpdate(
      req.params.id,
      { name, description, basePrice, isActive },
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
      .sort({ createdAt: -1 }).select("-__v");

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

module.exports = {
    getPendingProviders,
    approveProvider,
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getAllReviews,
    toggleReviewVisibility
}