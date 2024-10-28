import Vendor from '../models/vendorModel.js';
import { sendSuccessResponse, sendErrorResponse } from '../utils/responseHandler.js';
import { validateVendorInput, applyVendorSearchFilters } from '../validations/vendorUtils.js';
import jwt from 'jsonwebtoken';

// Create a new vendor
export const createVendor = async (req, res) => {
  try {
    const { firstName, lastName, phoneNumber, email, password, shopName, address } = req.body;
    const { isValid, errors } = validateVendorInput(req.body);

    if (!isValid) {
      return sendErrorResponse(res, new Error(errors.join(', ')), 400);
    }

    const vendorImage = req.files['vendorImage'] ? req.files['vendorImage'][0].path : null;
    const logo = req.files['logo'] ? req.files['logo'][0].path : null;
    const banner = req.files['banner'] ? req.files['banner'][0].path : null;

    const vendor = new Vendor({
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
      status: 'pending', // Set default status to pending
    });

    const savedVendor = await vendor.save();
    if (savedVendor) {
      sendSuccessResponse(res, savedVendor, 'Vendor added successfully');
    } else {
      throw new Error('Vendor could not be created');
    }
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

// Vendor registration (similar to createVendor but may have different logic)
export const registerVendor = async (req, res) => {
  try {
    const { firstName, lastName, phoneNumber, email, password, shopName, address } = req.body;
    const { isValid, errors } = validateVendorInput(req.body);

    if (!isValid) {
      return sendErrorResponse(res, new Error(errors.join(', ')), 400);
    }

    const vendorImage = req.files['vendorImage'] ? req.files['vendorImage'][0].path : null;
    const logo = req.files['logo'] ? req.files['logo'][0].path : null;
    const banner = req.files['banner'] ? req.files['banner'][0].path : null;

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
    const vendor = await Vendor.findOne({ email });

    if (!vendor) {
      return sendErrorResponse(res, new Error('Vendor not found'), 404);
    }

    const isPasswordCorrect = password === vendor.password;
    if (!isPasswordCorrect) {
      return sendErrorResponse(res, new Error('Invalid credentials'), 400);
    }

    const token = jwt.sign(
      { email: vendor.email, id: vendor._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_ACCESS_TIME }
    );

    sendSuccessResponse(res, { result: vendor, token }, 'Login successful');
  } catch (error) {
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
