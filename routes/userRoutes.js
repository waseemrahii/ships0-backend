

import express from 'express';
import {
  registerUser,
  loginUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateUserPassword,
  updateUserRole
} from '../controllers/userController.js';

const router = express.Router();

// POST /users/register - Register a new user
router.post('/register', registerUser);

// POST /users/login - User login
router.post('/login', loginUser);

// GET /users - Get all users
router.get('/', getAllUsers);

// GET /users/:userId - Get user by ID
router.get('/:userId', getUserById);

// PUT /users/:userId - Update user details
router.put('/:userId', updateUser);

// PUT /users/:userId/password - Update user password
router.put('/:userId/password', updateUserPassword);
router.put('/:userId/role', updateUserRole);

// DELETE /users/:userId - Delete user
router.delete('/:userId', deleteUser);

export default router;
