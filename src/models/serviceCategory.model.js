const mongoose = require('mongoose');

const serviceCategorySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true,
    unique: true
  },
  description: { 
    type: String, 
    required: true,
    trim: true 
  },
  image: {
  type: String,
  default: null
},
  basePrice: { 
    type: Number, 
    required: true,
    min: 0 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, { timestamps: true })

const ServiceCategory = mongoose.model("ServiceCategory", serviceCategorySchema);

module.exports = ServiceCategory;