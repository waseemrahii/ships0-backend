import Vendor from '../models/vendorModel.js';
import cloudinary from "../config/cloudinaryConfig.js";
import { sendSuccessResponse, sendErrorResponse } from '../utils/responseHandler.js';
import { validateVendorInput, applyVendorSearchFilters } from '../validations/vendorUtils.js';
import jwt from 'jsonwebtoken';

// Helper function for Cloudinary upload
const uploadToCloudinary = async (base64Data, folderName) => {
  try {
  
    const result = await cloudinary.uploader.upload(base64Data, { folder: folderName });
    return result.secure_url;
  } catch (error) {
    console.error(`Cloudinary upload error for ${folderName}:`, error);
    throw new Error("Image upload failed");
  }
};

// Separate functions for uploading each type of image
const uploadVendorImage = async (vendorImage) => {
  if (vendorImage) {
    return await uploadToCloudinary(vendorImage, 'categories');
  }
  return null;
};

const uploadLogo = async (logo) => {
  if (logo) {
    return await uploadToCloudinary(logo, 'categories');
  }
  return null;
};

const uploadBanner = async (banner) => {
  if (banner) {
    return await uploadToCloudinary(banner, 'categories');
  }
  return null;
};


// Create a new vendor with Cloudinary uploads
export const createVendor = async (req, res) => {
  try {

    const { firstName, lastName, phoneNumber, email, password, shopName, address, vendorImage, logo, banner } = req.body;

    // Upload images and get URLs
    const vendorImageUrl = await uploadVendorImage(vendorImage);
    console.log("Vendor image uploaded:", vendorImageUrl);

    const logoUrl = await uploadLogo(logo);
    console.log("Logo uploaded:", logoUrl);

    const bannerUrl = await uploadBanner(banner);
    console.log("Banner uploaded:", bannerUrl);

    // Create vendor object
    const vendor = new Vendor({
      firstName,
      lastName,
      phoneNumber,
      email,
      password,
      shopName,
      address,
      vendorImage: vendorImageUrl,
      logo: logoUrl,
      banner: bannerUrl,
      status: 'pending', // Default status
    });

    // Save vendor to the database
    const savedVendor = await vendor.save();
    console.log("Vendor saved:", savedVendor);

    if (savedVendor) {
      sendSuccessResponse(res, savedVendor, 'Vendor added successfully');
    } else {
      throw new Error('Vendor could not be created');
    }
  } catch (error) {
    console.error("Error creating vendor:", error);
    sendErrorResponse(res, error);
  }
};

// Vendor registration (similar to createVendor)
export const registerVendor = async (req, res) => {
  try {
    const { firstName, lastName, phoneNumber, email, password, shopName, address } = req.body;
    const { isValid, errors } = validateVendorInput(req.body);
    console.log("req bode ", req.body)
    if (!isValid) {
      return sendErrorResponse(res, new Error(errors.join(', ')), 400);
    }

    const vendorImage = req.files['vendorImage']
      ? await uploadToCloudinary(req.files['vendorImage'][0].path, 'vendors/vendorImages')
      : null;
    const logo = req.files['logo']
      ? await uploadToCloudinary(req.files['logo'][0].path, 'vendors/logos')
      : null;
    const banner = req.files['banner']
      ? await uploadToCloudinary(req.files['banner'][0].path, 'vendors/banners')
      : null;

    const newVendor = new Vendor({
      firstName,
      lastName,
      phoneNumber,
      email,
      password,
      shopName,
      address,
      vendorImage,
      logo,
      banner,
      status: 'pending',
    });

    const savedVendor = await newVendor.save();
    if (savedVendor) {
      sendSuccessResponse(res, savedVendor, 'Vendor registered successfully');
    } else {
      throw new Error('Vendor could not be registered');
    }
  } catch (error) {
    sendErrorResponse(res, error);
  }
};


// Vendor login
export const loginVendor = async (req, res) => {
  const { email, password } = req.body;

  try {

    // Fetch the vendor with the password explicitly selected
    const vendor = await Vendor.findOne({ email }).select('+password');
    console.log("vendor found:", vendor);

    if (!vendor) {
      return sendErrorResponse(res, new Error('Vendor not found'), 404);
    }

    // Compare the provided password with the hashed password
    const isPasswordCorrect = await vendor.comparePassword(password);
    if (!isPasswordCorrect) {
      return sendErrorResponse(res, new Error('Invalid credentials'), 400);
    }

    // Generate a token
    const token = jwt.sign(
      { email: vendor.email, id: vendor._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_ACCESS_TIME }
    );

    sendSuccessResponse(res, { vendor, token }, 'Login successful');
  } catch (error) {
    console.error("Error during vendor login:", error);
    sendErrorResponse(res, error);
  }
};


// Update vendor status
export const updateVendorStatus = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { status } = req.body;

    const updatedVendor = await Vendor.findByIdAndUpdate(vendorId, { status }, { new: true });

    if (!updatedVendor) {
      return sendErrorResponse(res, new Error('Vendor not found'), 404);
    }

    sendSuccessResponse(res, updatedVendor, 'Vendor status updated successfully');
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

// Get all vendors with search functionality
export const getAllVendors = async (req, res) => {
  try {
    const filters = req.query;
    const query = applyVendorSearchFilters(filters);
    const vendors = await Vendor.find(query);

    sendSuccessResponse(res, vendors, 'Vendors fetched successfully');
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

// Get vendor by ID
export const getVendorById = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return sendErrorResponse(res, new Error('Vendor not found'), 404);
    }

    sendSuccessResponse(res, vendor, 'Vendor fetched successfully');
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

// Delete vendor by ID
export const deleteVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const deletedVendor = await Vendor.findByIdAndDelete(vendorId);

    if (!deletedVendor) {
      return sendErrorResponse(res, new Error('Vendor not found'), 404);
    }

    sendSuccessResponse(res, { message: 'Vendor deleted successfully' }, 'Vendor deleted successfully');
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

// Update vendor password
export const updateVendorPassword = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { currentPassword, newPassword } = req.body;

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return sendErrorResponse(res, new Error('Vendor not found'), 404);
    }

    // Compare the current password with the hashed password in the database
    const isMatch = await vendor.comparePassword(currentPassword);
    if (!isMatch) {
      return sendErrorResponse(res, new Error('Current password is incorrect'), 400);
    }

    // Set the new password and save the vendor
    vendor.password = newPassword; // Hashing is handled in the model's pre-save hook
    await vendor.save();

    sendSuccessResponse(res, null, 'Password updated successfully');
  } catch (error) {
    sendErrorResponse(res, error);
  }
};
