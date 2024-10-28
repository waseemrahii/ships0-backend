
import Product from '../models/ProductModels.js';

// Populate product details with related fields
export const populateProductDetails = (query) => {
    return query
        .populate('category', 'name',)
    
        .populate({
            path: 'reviews.customer', 
            select: 'firstName', 
            model: 'Customer' 
        });
    };

// // Format the product response
// export const formatProductResponse = (product) => {
//     const formattedProduct = {
//         id: product._id,
//         name: product.name,
//         description: product.description,
//         category: product.category ? product.category.name : null,
//         sku: product.sku,
//         unit: product.unit,
//         tags: product.tags,
//         price: product.price,
//         discountAmount: product.discountAmount,
//         minimumOrderQty: product.minimumOrderQty,
//         shippingCost: product.shippingCost,
//         stock: product.stock,
//         colors: product.colors ? product.colors.map(color => color.name) : [],
//         attributes: product.attributes ? product.attributes.map(attr => attr.name) : [],
//         size: product.size,
//         userId: product.vendor ? product.vendor : product.createdBy,
//         userType: product.vendor ? 'vendor' : 'admin',
//         thumbnail: product.thumbnail,
//         images: product.images,
//         status: product.status,
//         createdAt: product.createdAt,
//         updatedAt: product.updatedAt,
//         reviews: product.reviews.map(review => ({
//             id: review._id,
//             customer: review.customer,
//             reviewText: review.reviewText,
//             rating: review.rating,
//             status: review.status,
//             createdAt: review.createdAt,
//             updatedAt: review.updatedAt
//         })),
//         averageRating: product.averageRating
//     };

//     return formattedProduct;
// };
