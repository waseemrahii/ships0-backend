// import User from "../models/userModel.js";
// import {
// 	createOne,
// 	deleteOne,
// 	getAll,
// 	getOne,
// 	updateOne,
// } from "./handleFactory.js";

// export const createUser = createOne(User);
// export const getUsers = getAll(User);
// export const getUser = getOne(User);
// export const deleteUser = deleteOne(User);
// export const updateUser = updateOne(User);




import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendSuccessResponse, sendErrorResponse } from '../utils/responseHandler.js';

// Register a new user
export const registerUser = async (req, res) => {
  try {
    const { name, email, phoneNumber, password } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendErrorResponse(res, new Error('Email is already registered'), 400);
    }

    const user = new User({
      name,
      email,
      phoneNumber,
      password,
    });

    const savedUser = await user.save();
    sendSuccessResponse(res, savedUser, 'User registered successfully');
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

// User login
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return sendErrorResponse(res, new Error('User not found'), 404);
    }

    const isPasswordCorrect = await user.correctPassword(password, user.password);
    if (!isPasswordCorrect) {
      return sendErrorResponse(res, new Error('Incorrect email or password'), 401);
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_ACCESS_TIME }
    );

    sendSuccessResponse(res, { user, token }, 'Login successful');
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    sendSuccessResponse(res, users, 'Users fetched successfully');
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

// Get user by ID
export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return sendErrorResponse(res, new Error('User not found'), 404);
    }
    sendSuccessResponse(res, user, 'User fetched successfully');
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

// Update user details
export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const updatedUser = await User.findByIdAndUpdate(userId, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return sendErrorResponse(res, new Error('User not found'), 404);
    }

    sendSuccessResponse(res, updatedUser, 'User updated successfully');
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return sendErrorResponse(res, new Error('User not found'), 404);
    }

    sendSuccessResponse(res, { message: 'User deleted successfully' }, 'User deleted successfully');
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

// Update user password
export const updateUserPassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(userId).select('+password');
    if (!user) {
      return sendErrorResponse(res, new Error('User not found'), 404);
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return sendErrorResponse(res, new Error('Current password is incorrect'), 400);
    }

    user.password = newPassword;
    await user.save();

    sendSuccessResponse(res, null, 'Password updated successfully');
  } catch (error) {
    sendErrorResponse(res, error);
  }
};



// Update user role
export const updateUserRole = async (req, res) => {
	try {
	  const { userId } = req.params;
	  const { role } = req.body;
  
	  // Validate role input
	  if (!role) {
		return sendErrorResponse(res, new Error('Role is required'), 400);
	  }
  
	  const updatedUser = await User.findByIdAndUpdate(
		userId,
		{ role },
		{ new: true, runValidators: true }
	  );
  
	  if (!updatedUser) {
		return sendErrorResponse(res, new Error('User not found'), 404);
	  }
  
	  sendSuccessResponse(res, updatedUser, 'User role updated successfully');
	} catch (error) {
	  sendErrorResponse(res, error);
	}
  };
  