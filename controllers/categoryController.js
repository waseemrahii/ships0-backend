// import Category from "../models/categoryModel.js";
// import cloudinary from "../config/cloudinaryConfig.js"; // Import Cloudinary config
// import { sendErrorResponse, sendSuccessResponse } from "../utils/responseHandler.js";
// import slugify from "slugify";

// // Create a new category
// export const createCategory = async (req, res) => {
//     try {
//         const { name,logo} = req.body;
//         const slug = slugify(name, { lower: true });

//         const category = new Category({ name, logo, slug });
//         await category.save();

//         sendSuccessResponse(res, category, "Category created successfully", 201);
//     } catch (error) {
//         sendErrorResponse(res, error.message);
//     }
// };

// // Get all categories with optional search functionality
// export const getCategories = async (req, res) => {
//     try {
//         const { search } = req.query; 
//         const query = search ? { name: { $regex: search, $options: 'i' } } : {};

//         const categories = await Category.find(query);

//         sendSuccessResponse(res, categories, "Categories fetched successfully");
//     } catch (error) {
//         sendErrorResponse(res, error.message);
//     }
// };

// // Get a single category by ID
// export const getCategoryById = async (req, res) => {
//     try {
//         const categoryId = req.params.id;
//         const category = await Category.findById(categoryId);
        
//         if (!category) {
//             return sendErrorResponse(res, "Category not found", 404);
//         }

//         sendSuccessResponse(res, category, "Category fetched successfully");
//     } catch (error) {
//         sendErrorResponse(res, error.message);
//     }
// };

// // Update a category by ID
// export const updateCategory = async (req, res) => {
//     try {
//         const { name } = req.body;
//         const logo = req.file ? req.file.filename : req.body.logo;
//         const slug = slugify(name, { lower: true });

//         const category = await Category.findByIdAndUpdate(req.params.id, { name, logo, slug }, {
//             new: true,
//             runValidators: true,
//         });

//         if (!category) {
//             return sendErrorResponse(res, "Category not found", 404);
//         }

//         sendSuccessResponse(res, category, "Category updated successfully");
//     } catch (error) {
//         sendErrorResponse(res, error.message);
//     }
// };

// // Delete a category by ID
// export const deleteCategory = async (req, res) => {
//     try {
//         const category = await Category.findByIdAndDelete(req.params.id);
//         if (!category) {
//             return sendErrorResponse(res, "Category not found", 404);
//         }

//         if (category.logo) {
//             fs.unlinkSync(path.join("uploads", category.logo));
//         }

//         sendSuccessResponse(res, category, "Category deleted successfully");
//     } catch (error) {
//         sendErrorResponse(res, error.message);
//     }
// };

// // Get category by slug
// export const getCategoryBySlug = async (req, res) => {
//     try {
//         const slug = req.params.slug;
//         const category = await Category.findOne({ slug });

//         if (!category) {
//             return sendErrorResponse(res, "Category not found", 404);
//         }

//         sendSuccessResponse(res, category, "Category fetched successfully");
//     } catch (error) {
//         sendErrorResponse(res, error.message);
//     }
// };




import Category from "../models/categoryModel.js";
import cloudinary from "../config/cloudinaryConfig.js";
import { sendErrorResponse, sendSuccessResponse } from "../utils/responseHandler.js";
import slugify from "slugify";

// Helper function for Cloudinary upload
const uploadToCloudinary = async (base64Data) => {
  try {
    // console.log("base64data of category ", base64Data)
    const result = await cloudinary.uploader.upload(base64Data, {
      folder: "categories",
    });
    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Image upload failed");
  }
};

// Create a new category
export const createCategory = async (req, res) => {
  try {
    const { name, logo } = req.body;
    const slug = slugify(name, { lower: true });

    // Upload logo to Cloudinary if provided
    let logoUrl = null;
    if (logo) {
      logoUrl = await uploadToCloudinary(logo);
    }

    const category = new Category({ name, logo: logoUrl, slug });
    await category.save();

    sendSuccessResponse(res, category, "Category created successfully", 201);
  } catch (error) {
    sendErrorResponse(res, error.message);
  }
};

// Get all categories
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    sendSuccessResponse(res, categories, "Categories fetched successfully");
  } catch (error) {
    sendErrorResponse(res, error.message);
  }
};

// Get category by ID
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
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
    const { name, logo } = req.body;
    const slug = slugify(name, { lower: true });

    // Upload new logo if provided
    let logoUrl = logo || req.body.logo;
    if (logo) {
      logoUrl = await uploadToCloudinary(logo);
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, logo: logoUrl, slug },
      { new: true, runValidators: true }
    );

    if (!category) {
      return sendErrorResponse(res, "Category not found", 404);
    }

    sendSuccessResponse(res, category, "Category updated successfully");
  } catch (error) {
    sendErrorResponse(res, error.message);
  }
};

// Delete a category
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return sendErrorResponse(res, "Category not found", 404);
    }
    sendSuccessResponse(res, category, "Category deleted successfully");
  } catch (error) {
    sendErrorResponse(res, error.message);
  }
};
