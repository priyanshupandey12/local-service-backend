const ProviderProfile = require("../models/provider.model");
const ServiceCategory = require("../models/serviceCategory.model");
const Review = require("../models/review.model");
const { uploadMedia ,deleteMediaFromCloudinary} = require("../utils/cloudinary");
const fs = require("fs");

const createProviderProfile = async (req, res) => {
  const { bio, category, city, area } = req.body;

  try {
    
     if(![bio, category, city, area].every(field => field && field.trim())) {
      return res.status(400).json({ success: false, message: "All fields are required and cannot be empty" });
    }
    const existingProfile = await ProviderProfile.findOne({ userId: req.user._id });
    if (existingProfile) {
      return res.status(400).json({ success: false, message: "Profile already exists" });
    }
    let profilePhotoUrl = null;
    if (req.file) {
      const result = await uploadMedia(req.file.path);
      profilePhotoUrl = result.secure_url;
      fs.unlinkSync(req.file.path);
    }

    const profile = await ProviderProfile.create({
      userId: req.user._id,
      bio,
      category,
      city,
      area,
       profilePhoto: profilePhotoUrl
    });

    res.status(201).json({ success: true, message: "Profile created successfully", profile });

  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
}

const updateProviderProfile = async (req, res) => {
  const { bio, category, city, area } = req.body;

  try {
    const profile = await ProviderProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }


    let profilePhotoUrl = profile.profilePhoto; 
    if (req.file) {

      if (profile.profilePhoto) {
        const publicId = profile.profilePhoto.split("/").pop().split(".")[0];
        await deleteMediaFromCloudinary(publicId);
      }
      const result = await uploadMedia(req.file.path);
      profilePhotoUrl = result.secure_url;
      fs.unlinkSync(req.file.path);
    }

    const updatedProfile = await ProviderProfile.findOneAndUpdate(
      { userId: req.user._id },
      { bio, category, city, area, profilePhoto: profilePhotoUrl },
      { new: true, runValidators: true }
    );
    res.status(200).json({ success: true, message: "Profile updated successfully", profile: updatedProfile });

  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
}

const getProviderProfile = async (req, res) => {
  try {
    const profile = await ProviderProfile.findOne({ userId: req.user._id })
      .populate("category", "name basePrice")
      .populate("userId", "name role");
    
    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }

    res.status(200).json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};


const toggleAvailability = async (req, res) => {
  try {
    const profile = await ProviderProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }

    if(!profile.isApproved){
      return res.status(403).json({ success: false, message: "Your profile is pending approval. You cannot change availability until approved by admin." });
    }

    const updatedProfile = await ProviderProfile.findOneAndUpdate(
      { userId: req.user._id },
      { isAvailable: !profile.isAvailable },
      { new: true }
    );

    res.status(200).json({ 
      success: true, 
      message: `You are now ${updatedProfile.isAvailable ? "available" : "unavailable"}`,
      isAvailable: updatedProfile.isAvailable 
    });

  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
}


const getAllProviders = async (req, res) => {
  const {  location, category, minPrice, maxPrice, rating, page = 1, limit = 10 } = req.query;

  try {
    const filter = {
      isApproved: true,
      isAvailable: true,
    };

        if (location) {
      filter.$or = [
        { city: { $regex: location, $options: "i" } },
        { area: { $regex: location, $options: "i" } },
      ];
    }
       if (rating) filter.avgRating = { $gte: Number(rating) };
      if (category) {
      const categoryDoc = await ServiceCategory.findOne({ 
        name: { $regex: category, $options: "i" } 
      });
      if (categoryDoc) filter.category = categoryDoc._id;
    }

    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;

     let providers = await ProviderProfile.find(filter)
      .select("-__v -createdAt -updatedAt -isApproved -isAvailable")
      .populate("userId", "name email")
      .populate("category", "name basePrice")
      .sort({ createdAt: -1 });

   
    if (minPrice || maxPrice) {
      providers = providers.filter((p) => {
        const price = p.category?.basePrice || 0;
        if (minPrice && maxPrice) return price >= Number(minPrice) && price <= Number(maxPrice);
        if (minPrice) return price >= Number(minPrice);
        if (maxPrice) return price <= Number(maxPrice);
        return true;
      });
    }

    const totalProviders = providers.length;
    const paginatedProviders = providers.slice(skip, skip + pageSize);

    res.status(200).json({
      success: true,
      pagination: {
        total: totalProviders,
        currentPage: pageNumber,
        totalPages: Math.ceil(totalProviders / pageSize),
        pageSize,
      },
      providers: paginatedProviders,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getProviderById = async (req, res) => {
  try {
    const profile = await ProviderProfile.findById(req.params.id)
      .select("-__v -createdAt -updatedAt")
      .populate("userId", "name email")
      .populate("category", "name basePrice");


      if(!profile.isApproved){
        return res.status(403).json({ success: false, message: "This provider profile is pending approval. You cannot view details until approved by admin." });
      }

    if (!profile) {
      return res.status(404).json({ success: false, message: "Provider not found" });
    }

    const reviews = await Review.find({ providerId: profile.userId, isVisible: true });

    res.status(200).json({ success: true, profile, reviews });

  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
}

module.exports = {
    createProviderProfile,
    updateProviderProfile,
    toggleAvailability,
    getAllProviders,
    getProviderById,
    getProviderProfile
}