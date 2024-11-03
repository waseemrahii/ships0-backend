import Product from '../models/ProductModels.js';
import cloudinary from '../config/cloudinaryConfig.js';
import {
    sendErrorResponse,
    sendSuccessResponse
} from '../utils/responseHandler.js';
import {
    validateProductDependencies
} from '../utils/validation.js';
import {
    populateProductDetails,
} from '../utils/productHelper.js';
import { productValidationSchema } from '../validations/productValidation.js'; // Import Joi schema
import Customer from '../models/customerModel.js';
import {
    buildFilterQuery,
    buildSortOptions
} from '../utils/filterHelper.js';
import Category from '../models/categoryModel.js';


const uploadToCloudinary = async (base64Data, folderName) => {
  try {
     // Ensure base64 data is correctly prefixed
     if (!base64Data.startsWith('data:image')) {
        base64Data = `data:image/jpeg;base64,${base64Data}`; // or png, based on your data
      }
    const result = await cloudinary.uploader.upload(base64Data, { folder: folderName });
    return result.secure_url;
  } catch (error) {
    console.error(`Cloudinary upload error for ${folderName}:`, error);
    throw new Error('Image upload failed');
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, description, category, sku, unit, tags, price, stock, userId, userType, thumbnail, images } = req.body;

    const categoryObj = await Category.findById(category);
    if (!categoryObj) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }

    const thumbnailUrl = thumbnail ? await uploadToCloudinary(thumbnail, 'products') : null;

    const imageUrls = [];
    for (const base64Image of images) {
      const imageUrl = await uploadToCloudinary(base64Image, 'products');
      imageUrls.push(imageUrl);
    }

    const newProduct = new Product({
      name,
      description,
      category: categoryObj._id,
      sku,
      unit,
      tags,
      price,
      stock,
      userId,
      userType,
      thumbnail: thumbnailUrl,
      images: imageUrls,
      status: 'pending',
    });

    await newProduct.save();
    sendSuccessResponse(res, newProduct, 'Product created successfully');
  } catch (error) {
    console.error('Error creating product:', error);
    sendErrorResponse(res, error);
  }
};

// Update product images
export const updateProductImages = async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        product.images = req.files ? req.files.map(file => file.path) : [];
        await product.save();
        sendSuccessResponse(res, product, 'Product images updated successfully');
    } catch (error) {
        sendErrorResponse(res, error);
    }
};

// Get product by ID
export const getProductById = async (req, res) => {
    try {
        const productId = req.params.id;
        
        // Fetch from database
        const product = await populateProductDetails(Product.findById(productId));
        
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        sendSuccessResponse(res, product, 200);
    } catch (error) {
        sendErrorResponse(res, error);
    }
};

// Delete a product
export const deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await Product.findByIdAndDelete(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        sendSuccessResponse(res, product, 'Product deleted successfully');
    } catch (error) {
        sendErrorResponse(res, error);
    }
};

// Add a new review to a product
export const addReview = async (req, res) => {
    try {
        const productId = req.params.productId;
        const { customerId, reviewText, rating } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const customer = await Customer.findById(customerId);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        product.reviews.push({
            customer: customerId,
            reviewText,
            rating,
            createdAt: new Date()
        });

        await product.save();
        sendSuccessResponse(res, product, "Product Created Successfully");
    } catch (error) {
        sendErrorResponse(res, error);
    }
};

// Update product status
export const updateProductStatus = async (req, res) => {
    try {
        const productId = req.params.id;
        const { status } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        product.status = status;
        await product.save();
        sendSuccessResponse(res, product, 200);
    } catch (error) {
        sendErrorResponse(res, error);
    }
};


// Get top-rated products
export const getTopRatedProducts = async (req, res) => {
    try {
        const topRatedProducts = await Product.aggregate([
            { $match: { status: 'active' } },
            { $unwind: '$reviews' },
            {
                $group: {
                    _id: '$_id',
                    name: { $first: '$name' },
                    averageRating: { $avg: '$reviews.rating' }
                }
            },
            { $sort: { averageRating: -1 } },
            { $limit: 10 }
        ]);

        sendSuccessResponse(res, topRatedProducts, 200);
    } catch (error) {
        sendErrorResponse(res, error);
    }
};



// Get product reviews
export const getProductReviews = async (req, res) => {
    try {
        const productId = req.params.productId;

        const product = await Product.findById(productId).populate('reviews.customer', 'name');
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        sendSuccessResponse(res, product.reviews, 200);
    } catch (error) {
        sendErrorResponse(res, error);
    }
};

// Update review status
export const updateReviewStatus = async (req, res) => {
    try {
        const { productId, reviewId } = req.params;
        const { status } = req.body;

        const validStatuses = ['Active', 'Inactive'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const review = product.reviews.id(reviewId);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        review.status = status;
        await product.save();

        sendSuccessResponse(res, review, 'Review status updated successfully');
    } catch (error) {
        sendErrorResponse(res, error);
    }
};

// Delete a review
export const deleteReview = async (req, res) => {
    try {
        const { productId, reviewId } = req.params;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const review = product.reviews.id(reviewId);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        review.remove();
        await product.save();

        sendSuccessResponse(res, review, 'Review deleted successfully');
    } catch (error) {
        sendErrorResponse(res, error);
    }
};

export const getAllProducts = async (req, res) => {
    try {
        const { priceRange, sort, order = 'asc', page = 1, limit = 100  } = req.query;

        // Build the filter query from request parameters
        let query = buildFilterQuery(req.query);

        // Add price range filtering if specified
        if (priceRange) {
            const [minPrice, maxPrice] = priceRange.split('-').map(Number);
            query.price = { $gte: minPrice, $lte: maxPrice };
        }

        // Build sorting options
        let sortOptions = buildSortOptions(sort, order);

        // Calculate pagination parameters
        const skip = (page - 1) * limit;

        // Fetch products from the database
        const products = await Product.find(query)
            .populate('category', 'name')
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit));

        // Get the total count of documents matching the query
        const totalDocs = await Product.countDocuments(query);

        // Prepare the response with pagination details
        const response = {
            products,
            totalDocs,
            limit: parseInt(limit),
            totalPages: Math.ceil(totalDocs / limit),
            page: parseInt(page),
            pagingCounter: skip + 1,
            hasPrevPage: page > 1,
            hasNextPage: page * limit < totalDocs,
            prevPage: page > 1 ? page - 1 : null,
            nextPage: page * limit < totalDocs ? page + 1 : null,
        };

        // Return the response
        sendSuccessResponse(res, response, 200);
    } catch (error) {
        // Log the error (optional) and send an error response
        console.error('Error fetching products:', error);
        sendErrorResponse(res, error);
    }
};



export const updateProduct = async (req, res) => {
    try {
        const productId = req.params.id;

        // Validate input using Joi schema
        const { error } = productValidationSchema.validate(req.body, { abortEarly: false });
        if (error) {
            return res.status(400).json({ message: error.details.map(err => err.message).join(', ') });
        }

        // Find the product by ID
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const {
            name, description, category, sku, price, stock, userId, userType
        } = req.body;

        // Validate and update category
        if (category) {
            const categoryObj = await Category.findById(category);
            if (!categoryObj) {
                return res.status(400).json({ message: 'Invalid category ID' });
            }
            product.category = categoryObj._id;
        }

        // Update product details
        product.name = name || product.name;
        product.description = description || product.description;
        // Only update category if valid
        product.category = categoryObj ? categoryObj._id : product.category;
        product.sku = sku || product.sku;
        product.price = price || product.price;
        product.stock = stock || product.stock;
        product.userId = userId || product.userId;
        product.userType = userType || product.userType;

        // Handle file uploads
        if (req.files['thumbnail']) {
            product.thumbnail = req.files['thumbnail'][0].path;
        }
        if (req.files['images']) {
            product.images = req.files['images'].map(file => file.path);
        }

        // Save updated product
        await product.save();

        // Send success response
        sendSuccessResponse(res, product, 'Product updated successfully');
    } catch (error) {
        // Send error response
        sendErrorResponse(res, error);
    }
};
