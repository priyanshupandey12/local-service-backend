const mongoose = require("mongoose");

const providerProfileSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: [true, "User ID is required"]
  },
  bio: { 
    type: String, 
    required: [true, "Bio is required"],
    trim: true,
    maxlength: 500
  },
  category: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "ServiceCategory",
    required: [true, "Category is required"] 
  },
  phone: {
  type: String,
  default: null,
  match: [/^[6-9]\d{9}$/, "Invalid phone number"]
},
  status: {
  type: String,
  enum: ["pending", "approved", "rejected"],
  default: "pending"
},
basePrice: {
  type: Number,
  default: null 
},
  city: { 
    type: String, 
    required: [true, "City is required"],
    trim: true 
  },
  area: { 
    type: String, 
    required: [true, "Area is required"],
    trim: true 
  },
  profilePhoto: { 
    type: String,
    default: null
  },
  isAvailable: { 
    type: Boolean, 
    default: false 
  },
  isApproved: { 
    type: Boolean, 
    default: false 
  },
  avgRating: { 
    type: Number, 
    default: 0,
    min: 0,
    max: 5 
  },
  totalReviews: { 
    type: Number, 
    default: 0 
  }
}, { timestamps: true })

const ProviderProfile = mongoose.model("ProviderProfile", providerProfileSchema);

module.exports = ProviderProfile;