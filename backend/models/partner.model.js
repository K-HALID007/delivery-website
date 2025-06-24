import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const partnerSchema = new mongoose.Schema({
  // Personal Information
  name: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    minlength: [10, 'Phone number must be at least 10 characters long']
  },
  
  // Address Information
  address: {
    street: {
      type: String,
      required: [true, 'Street address is required'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true
    },
    postalCode: {
      type: String,
      required: [true, 'Postal code is required'],
      trim: true
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
      default: 'India'
    }
  },

  // Vehicle Information
  vehicleType: {
    type: String,
    required: [true, 'Vehicle type is required'],
    enum: ['bike', 'scooter', 'car', 'van', 'truck'],
    lowercase: true
  },
  vehicleNumber: {
    type: String,
    required: [true, 'Vehicle number is required'],
    trim: true,
    uppercase: true
  },
  licenseNumber: {
    type: String,
    required: [true, 'License number is required'],
    trim: true
  },
  
  // Work Preferences
  experience: {
    type: String,
    enum: ['0-1', '1-3', '3-5', '5+'],
    default: '0-1'
  },
  workingHours: {
    type: String,
    required: [true, 'Working hours preference is required'],
    enum: ['morning', 'afternoon', 'evening', 'flexible']
  },
  preferredZones: {
    type: String,
    trim: true
  },

  // Partner Status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'suspended', 'inactive'],
    default: 'pending'
  },
  isActive: {
    type: Boolean,
    default: false
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  
  // Performance Metrics
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalDeliveries: {
    type: Number,
    default: 0
  },
  completedDeliveries: {
    type: Number,
    default: 0
  },
  cancelledDeliveries: {
    type: Number,
    default: 0
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  
  // Current Location (for real-time tracking)
  currentLocation: {
    latitude: {
      type: Number
    },
    longitude: {
      type: Number
    },
    lastUpdated: {
      type: Date
    }
  },

  // Documents (file paths will be stored)
  documents: {
    aadharCard: String,
    drivingLicense: String,
    vehicleRC: String,
    bankPassbook: String,
    photo: String
  },

  // Bank Details
  bankDetails: {
    accountNumber: String,
    ifscCode: String,
    accountHolderName: String
  },

  // Emergency Contact
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },

  // Admin Notes
  adminNotes: [{
    note: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Verification
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedAt: Date,
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },

  // Timestamps
  lastLogin: Date,
  lastLocationUpdate: Date,
  
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for completion rate
partnerSchema.virtual('completionRate').get(function() {
  if (this.totalDeliveries === 0) return 0;
  return ((this.completedDeliveries / this.totalDeliveries) * 100).toFixed(1);
});

// Virtual for full address
partnerSchema.virtual('fullAddress').get(function() {
  const addr = this.address;
  return `${addr.street}, ${addr.city}, ${addr.state} ${addr.postalCode}, ${addr.country}`;
});

// Hash password before saving
partnerSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
partnerSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Method to update location
partnerSchema.methods.updateLocation = function(latitude, longitude) {
  this.currentLocation = {
    latitude,
    longitude,
    lastUpdated: new Date()
  };
  this.lastLocationUpdate = new Date();
  return this.save();
};

// Method to calculate earnings for a delivery
partnerSchema.methods.addEarnings = function(amount) {
  this.totalEarnings += amount;
  return this.save();
};

// Method to update delivery stats
partnerSchema.methods.updateDeliveryStats = function(status) {
  this.totalDeliveries += 1;
  if (status === 'completed') {
    this.completedDeliveries += 1;
  } else if (status === 'cancelled') {
    this.cancelledDeliveries += 1;
  }
  return this.save();
};

// Index for location-based queries
partnerSchema.index({ 'currentLocation.latitude': 1, 'currentLocation.longitude': 1 });
partnerSchema.index({ status: 1, isActive: 1 });
partnerSchema.index({ email: 1 });
partnerSchema.index({ vehicleNumber: 1 });

const Partner = mongoose.model('Partner', partnerSchema);

export default Partner;