const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
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
  categoryId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "ServiceCategory",
    required: true 
  },
  address: { 
    type: String, 
    required: true,
    trim: true 
  },
  scheduledDate: { 
    type: Date, 
    required: true 
  },
  scheduledTime: { 
    type: String, 
    required: true 
  },
  problemDescription: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 500
  },
  customerImage: { 
    type: String, 
    default: null 
  },
  status: { 
    type: String, 
    enum: ["requested", "confirmed", "in-progress", "completed", "cancelled"],
    default: "requested" 
  },
  jobNotes: { 
    type: String, 
    default: null 
  },
  beforeImages: { 
    type: [String], 
    default: [] 
  },
  afterImages: { 
    type: [String], 
    default: [] 
  }
}, { timestamps: true })


const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;