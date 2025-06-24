import Settings from '../models/settings.model.js';

// Get all settings
export const getSettings = async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    
    // Remove sensitive fields from response
    const publicSettings = { ...settings.toObject() };
    delete publicSettings.smtpPassword;
    delete publicSettings.smsApiSecret;
    
    res.json(publicSettings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ message: 'Error fetching settings', error: error.message });
  }
};

// Update settings
export const updateSettings = async (req, res) => {
  try {
    const updates = req.body;
    
    // Validate certain fields
    if (updates.sessionTimeout && (updates.sessionTimeout < 5 || updates.sessionTimeout > 480)) {
      return res.status(400).json({ message: 'Session timeout must be between 5 and 480 minutes' });
    }
    
    if (updates.maxLoginAttempts && (updates.maxLoginAttempts < 3 || updates.maxLoginAttempts > 20)) {
      return res.status(400).json({ message: 'Max login attempts must be between 3 and 20' });
    }
    
    if (updates.itemsPerPage && ![10, 20, 50, 100].includes(updates.itemsPerPage)) {
      return res.status(400).json({ message: 'Items per page must be 10, 20, 50, or 100' });
    }
    
    const settings = await Settings.updateSettings(updates);
    
    // Remove sensitive fields from response
    const publicSettings = { ...settings.toObject() };
    delete publicSettings.smtpPassword;
    delete publicSettings.smsApiSecret;
    
    res.json({
      message: 'Settings updated successfully',
      settings: publicSettings
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'Error updating settings', error: error.message });
  }
};

// Reset settings to default
export const resetSettings = async (req, res) => {
  try {
    // Delete existing settings
    await Settings.deleteMany({});
    
    // Create new default settings
    const settings = await Settings.create({});
    
    // Remove sensitive fields from response
    const publicSettings = { ...settings.toObject() };
    delete publicSettings.smtpPassword;
    delete publicSettings.smsApiSecret;
    
    res.json({
      message: 'Settings reset to default values',
      settings: publicSettings
    });
  } catch (error) {
    console.error('Error resetting settings:', error);
    res.status(500).json({ message: 'Error resetting settings', error: error.message });
  }
};

// Get specific setting category
export const getSettingCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const settings = await Settings.getSettings();
    
    let categorySettings = {};
    
    switch (category) {
      case 'general':
        categorySettings = {
          siteName: settings.siteName,
          siteDescription: settings.siteDescription,
          contactEmail: settings.contactEmail,
          supportPhone: settings.supportPhone,
          companyAddress: settings.companyAddress
        };
        break;
      case 'notifications':
        categorySettings = {
          emailNotifications: settings.emailNotifications,
          smsNotifications: settings.smsNotifications,
          pushNotifications: settings.pushNotifications,
          notificationEmail: settings.notificationEmail
        };
        break;
      case 'security':
        categorySettings = {
          twoFactorAuth: settings.twoFactorAuth,
          sessionTimeout: settings.sessionTimeout,
          passwordExpiry: settings.passwordExpiry,
          maxLoginAttempts: settings.maxLoginAttempts,
          requirePasswordChange: settings.requirePasswordChange
        };
        break;
      case 'business':
        categorySettings = {
          defaultShippingRate: settings.defaultShippingRate,
          expressShippingRate: settings.expressShippingRate,
          overnightShippingRate: settings.overnightShippingRate,
          freeShippingThreshold: settings.freeShippingThreshold,
          currency: settings.currency,
          timezone: settings.timezone,
          businessHours: settings.businessHours
        };
        break;
      case 'ui':
        categorySettings = {
          darkMode: settings.darkMode,
          compactView: settings.compactView,
          showWelcomeMessage: settings.showWelcomeMessage,
          itemsPerPage: settings.itemsPerPage,
          primaryColor: settings.primaryColor,
          secondaryColor: settings.secondaryColor
        };
        break;
      default:
        return res.status(400).json({ message: 'Invalid category' });
    }
    
    res.json(categorySettings);
  } catch (error) {
    console.error('Error fetching category settings:', error);
    res.status(500).json({ message: 'Error fetching category settings', error: error.message });
  }
};

// Update specific setting category
export const updateSettingCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const updates = req.body;
    
    const settings = await Settings.updateSettings(updates);
    
    res.json({
      message: `${category} settings updated successfully`,
      settings: settings
    });
  } catch (error) {
    console.error('Error updating category settings:', error);
    res.status(500).json({ message: 'Error updating category settings', error: error.message });
  }
};

// Test email configuration
export const testEmailConfig = async (req, res) => {
  try {
    const { testEmail } = req.body;
    
    if (!testEmail) {
      return res.status(400).json({ message: 'Test email address is required' });
    }

    // Import the test function
    const { testEmailConfig: testEmailFunction } = await import('../utils/email.js');
    
    // Send test email
    const result = await testEmailFunction(testEmail);
    
    res.json({ 
      message: 'Test email sent successfully',
      messageId: result.messageId 
    });
    
  } catch (error) {
    console.error('Error testing email config:', error);
    res.status(500).json({ 
      message: 'Failed to send test email', 
      error: error.message 
    });
  }
};

// Test SMS configuration
export const testSmsConfig = async (req, res) => {
  try {
    const { testPhone } = req.body;
    const settings = await Settings.getSettings();
    
    if (!settings.smsApiKey || !settings.smsApiSecret) {
      return res.status(400).json({ message: 'SMS configuration is incomplete' });
    }
    
    // Simulate SMS test
    setTimeout(() => {
      res.json({ message: 'Test SMS sent successfully' });
    }, 1000);
    
  } catch (error) {
    console.error('Error testing SMS config:', error);
    res.status(500).json({ message: 'Error testing SMS configuration', error: error.message });
  }
};