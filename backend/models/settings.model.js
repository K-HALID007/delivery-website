import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  // General Settings
  siteName: {
    type: String,
    default: 'Courier Tracker'
  },
  siteDescription: {
    type: String,
    default: 'Professional courier and package tracking system'
  },
  contactEmail: {
    type: String,
    default: 'admin@couriertracker.com'
  },
  supportPhone: {
    type: String,
    default: '+1 (555) 123-4567'
  },
  companyAddress: {
    type: String,
    default: '123 Business St, City, State 12345'
  },
  
  // Notification Settings
  emailNotifications: {
    type: Boolean,
    default: true
  },
  smsNotifications: {
    type: Boolean,
    default: false
  },
  pushNotifications: {
    type: Boolean,
    default: true
  },
  notificationEmail: {
    type: String,
    default: 'notifications@couriertracker.com'
  },
  
  // Security Settings
  twoFactorAuth: {
    type: Boolean,
    default: false
  },
  sessionTimeout: {
    type: Number,
    default: 30 // minutes
  },
  passwordExpiry: {
    type: Number,
    default: 90 // days
  },
  maxLoginAttempts: {
    type: Number,
    default: 5
  },
  requirePasswordChange: {
    type: Boolean,
    default: false
  },
  
  // System Settings
  maintenanceMode: {
    type: Boolean,
    default: false
  },
  maintenanceMessage: {
    type: String,
    default: 'System is under maintenance. Please check back later.'
  },
  debugMode: {
    type: Boolean,
    default: false
  },
  autoBackup: {
    type: Boolean,
    default: true
  },
  backupFrequency: {
    type: String,
    enum: ['hourly', 'daily', 'weekly', 'monthly'],
    default: 'daily'
  },
  
  // Business Settings
  defaultShippingRate: {
    type: Number,
    default: 15.99
  },
  expressShippingRate: {
    type: Number,
    default: 29.99
  },
  overnightShippingRate: {
    type: Number,
    default: 49.99
  },
  freeShippingThreshold: {
    type: Number,
    default: 100
  },
  currency: {
    type: String,
    enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
    default: 'USD'
  },
  timezone: {
    type: String,
    default: 'America/New_York'
  },
  businessHours: {
    start: {
      type: String,
      default: '09:00'
    },
    end: {
      type: String,
      default: '17:00'
    }
  },
  
  // UI Settings
  darkMode: {
    type: Boolean,
    default: false
  },
  compactView: {
    type: Boolean,
    default: false
  },
  showWelcomeMessage: {
    type: Boolean,
    default: true
  },
  itemsPerPage: {
    type: Number,
    enum: [10, 20, 50, 100],
    default: 20
  },
  primaryColor: {
    type: String,
    default: '#f59e0b' // amber-500
  },
  secondaryColor: {
    type: String,
    default: '#6b7280' // gray-500
  },
  
  // Email Settings
  smtpHost: {
    type: String,
    default: ''
  },
  smtpPort: {
    type: Number,
    default: 587
  },
  smtpUser: {
    type: String,
    default: ''
  },
  smtpPassword: {
    type: String,
    default: ''
  },
  smtpSecure: {
    type: Boolean,
    default: true
  },
  
  // SMS Settings
  smsProvider: {
    type: String,
    enum: ['twilio', 'nexmo', 'aws'],
    default: 'twilio'
  },
  smsApiKey: {
    type: String,
    default: ''
  },
  smsApiSecret: {
    type: String,
    default: ''
  },
  
  // Analytics Settings
  googleAnalyticsId: {
    type: String,
    default: ''
  },
  enableAnalytics: {
    type: Boolean,
    default: false
  },
  
  // Feature Flags
  enableUserRegistration: {
    type: Boolean,
    default: true
  },
  enableGuestTracking: {
    type: Boolean,
    default: true
  },
  enableRealTimeUpdates: {
    type: Boolean,
    default: true
  },
  enableFileUploads: {
    type: Boolean,
    default: true
  },
  maxFileSize: {
    type: Number,
    default: 10 // MB
  }
}, {
  timestamps: true
});

// Ensure only one settings document exists
settingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

settingsSchema.statics.updateSettings = async function(updates) {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create(updates);
  } else {
    Object.assign(settings, updates);
    await settings.save();
  }
  return settings;
};

export default mongoose.model('Settings', settingsSchema);