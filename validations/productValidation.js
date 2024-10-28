import Joi from 'joi';

export  const productValidationSchema = Joi.object({
    name: Joi.string().required().messages({
        'string.base': 'Product name should be a string',
        'string.empty': 'Product name is required',
        'any.required': 'Product name is required',
    }),
    description: Joi.string().required().messages({
        'string.base': 'Product description should be a string',
        'string.empty': 'Product description is required',
        'any.required': 'Product description is required',
    }),
    category: Joi.string().required().messages({
        'string.base': 'Category ID should be a string',
        'string.empty': 'Category ID is required',
        'any.required': 'Category ID is required',
    }),

    sku: Joi.string().required().messages({
        'string.base': 'SKU should be a string',
        'string.empty': 'SKU is required',
        'any.required': 'SKU is required',
    }),
    price: Joi.number().required().positive().messages({
        'number.base': 'Price should be a number',
        'number.positive': 'Price should be greater than 0',
        'any.required': 'Price is required',
    }),
    discountAmount: Joi.number().optional().positive(),

    stock: Joi.number().required().positive().messages({
        'number.base': 'Stock should be a number',
        'number.positive': 'Stock should be greater than 0',
        'any.required': 'Stock is required',
    }),

    userId: Joi.string().required().messages({
        'string.base': 'User ID should be a string',
        'string.empty': 'User ID is required',
        'any.required': 'User ID is required',
    }),
    userType: Joi.string().valid('vendor', 'admin').required().messages({
        'string.base': 'User type should be a string',
        'any.only': 'User type should be either "vendor" or "admin"',
        'any.required': 'User type is required',
    }),
    thumbnail: Joi.string().optional(),
    images: Joi.array().items(Joi.string()).optional(),
    status: Joi.string().valid('pending', 'approved', 'rejected').optional(),
});


