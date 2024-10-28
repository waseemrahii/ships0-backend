import Category from "../models/categoryModel.js";
import { sendErrorResponse, sendSuccessResponse } from "../utils/responseHandler.js";
import fs from "fs";
import path from "path";
import slugify from "slugify";

// Create a new category
export const createCategory = async (req, res) => {
    try {
        const { name} = req.body;
        const logo = req.file ? req.file.filename : null;
        const slug = slugify(name, { lower: true });

        const category = new Category({ name, logo, slug });
        await category.save();

        sendSuccessResponse(res, category, "Category created successfully", 201);
    } catch (error) {
        sendErrorResponse(res, error.message);
    }
};

// Get all categories with optional search functionality
export const getCategories = async (req, res) => {
    try {
        const { search } = req.query; 
        const query = search ? { name: { $regex: search, $options: 'i' } } : {};

        const categories = await Category.find(query);

        sendSuccessResponse(res, categories, "Categories fetched successfully");
    } catch (error) {
        sendErrorResponse(res, error.message);
    }
};

// Get a single category by ID
export const getCategoryById = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const category = await Category.findById(categoryId);
        
        if (!category) {
            return sendErrorResponse(res, "Category not found", 404);
        }

        sendSuccessResponse(res, category, "Category fetched successfully");
    } catch (error) {
        sendErrorResponse(res, error.message);
    }
};

// Update a category by ID
export const updateCategory = async (req, res) => {
    try {
        const { name } = req.body;
        const logo = req.file ? req.file.filename : req.body.logo;
        const slug = slugify(name, { lower: true });

        const category = await Category.findByIdAndUpdate(req.params.id, { name, logo, slug }, {
            new: true,
            runValidators: true,
        });

        if (!category) {
            return sendErrorResponse(res, "Category not found", 404);
        }

        sendSuccessResponse(res, category, "Category updated successfully");
    } catch (error) {
        sendErrorResponse(res, error.message);
    }
};

// Delete a category by ID
export const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) {
            return sendErrorResponse(res, "Category not found", 404);
        }

        if (category.logo) {
            fs.unlinkSync(path.join("uploads", category.logo));
        }

        sendSuccessResponse(res, category, "Category deleted successfully");
    } catch (error) {
        sendErrorResponse(res, error.message);
    }
};

// Get category by slug
export const getCategoryBySlug = async (req, res) => {
    try {
        const slug = req.params.slug;
        const category = await Category.findOne({ slug });

        if (!category) {
            return sendErrorResponse(res, "Category not found", 404);
        }

        sendSuccessResponse(res, category, "Category fetched successfully");
    } catch (error) {
        sendErrorResponse(res, error.message);
    }
};
