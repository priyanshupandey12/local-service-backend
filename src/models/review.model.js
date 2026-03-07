const mongoose = require('mongoose');


const reviewSchema = new mongoose.Schema({
  bookingId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Booking",
    required: true ,
    unique:true
  },
  customerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true 
  },
  providerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true 
  },
  rating: { 
    type: Number, 
    required: true,
    min: 1,
    max: 5 
  },
  comment: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 500
  },
  isVisible: { 
    type: Boolean, 
    default: false
  }
}, { timestamps: true })

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;