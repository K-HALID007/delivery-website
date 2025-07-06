import Partner from '../models/partner.model.js';
import jwt from 'jsonwebtoken';

// Generate JWT token
const generateToken = (partnerId) => {
  return jwt.sign({ partnerId, type: 'partner' }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// Simplified Partner Registration for debugging
export const registerPartnerSimple = async (req, res) => {
  try {
    console.log('🔍 SIMPLE Partner registration started');
    console.log('Request body keys:', Object.keys(req.body));
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    // Basic validation
    const requiredFields = ['name', 'email', 'password', 'phone', 'vehicleType', 'vehicleNumber', 'licenseNumber', 'workingHours'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      console.log('❌ Missing required fields:', missingFields);
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    const {
      name, email, password, phone, address, city, state, postalCode, country,
      vehicleType, vehicleNumber, licenseNumber, experience, workingHours
    } = req.body;

    console.log('✅ All required fields present');

    // Check if partner already exists
    console.log('🔍 Checking for existing partner...');
    const existingPartner = await Partner.findOne({ email });
    if (existingPartner) {
      console.log('❌ Partner already exists with email:', email);
      return res.status(400).json({
        success: false,
        message: 'Partner with this email already exists'
      });
    }

    console.log('✅ Email is unique');

    // Check if vehicle number already exists
    console.log('🔍 Checking for existing vehicle...');
    const existingVehicle = await Partner.findOne({ vehicleNumber: vehicleNumber?.toUpperCase() });
    if (existingVehicle) {
      console.log('❌ Vehicle already exists:', vehicleNumber);
      return res.status(400).json({
        success: false,
        message: 'Partner with this vehicle number already exists'
      });
    }

    console.log('✅ Vehicle number is unique');

    // Create partner data
    console.log('🔍 Creating partner data...');
    const partnerData = {
      name,
      email,
      password,
      phone,
      address: {
        street: address || 'Not provided',
        city: city || 'Not provided',
        state: state || 'Not provided',
        postalCode: postalCode || '000000',
        country: country || 'India'
      },
      vehicleType,
      vehicleNumber: vehicleNumber.toUpperCase(),
      licenseNumber,
      experience: experience || '0-1',
      workingHours,
      status: 'pending'
    };

    console.log('Partner data prepared:', JSON.stringify(partnerData, null, 2));

    // Create new partner
    console.log('🔍 Creating Partner instance...');
    const partner = new Partner(partnerData);

    console.log('🔍 Saving partner to database...');
    await partner.save();

    console.log('✅ Partner saved successfully!');
    console.log('Partner ID:', partner._id);

    res.status(201).json({
      success: true,
      message: 'Partner registration successful! Please wait for admin approval.',
      partner: {
        id: partner._id,
        name: partner.name,
        email: partner.email,
        status: partner.status
      }
    });

  } catch (error) {
    console.error('❌ SIMPLE Partner registration error:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    
    if (error.errors) {
      console.error('Validation errors:');
      Object.keys(error.errors).forEach(field => {
        console.error(`  - ${field}: ${error.errors[field].message}`);
        console.error(`    Value: ${error.errors[field].value}`);
        console.error(`    Kind: ${error.errors[field].kind}`);
      });
    }
    
    if (error.code === 11000) {
      console.error('Duplicate key error:', error.keyPattern, error.keyValue);
      return res.status(400).json({
        success: false,
        message: 'Duplicate data: Email or vehicle number already exists'
      });
    }

    // Return detailed error for debugging
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.',
      error: error.message,
      errorName: error.name,
      errorCode: error.code,
      validationErrors: error.errors ? Object.keys(error.errors).map(field => ({
        field,
        message: error.errors[field].message,
        value: error.errors[field].value
      })) : null
    });
  }
};