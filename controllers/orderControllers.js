

// // controllers/orderController.js
// import Order from '../models/orderModel.js';
// import Stripe from 'stripe';
// import Product from '../models/ProductModels.js';
// import User from '../models/userModel.js'
// const stripe = new Stripe('sk_test_51Pwpi4023TaI0bKzl1dal6jK7njGYiTgT3Qr7Nt184Qr3wCyrr5pS5BP18NXj9GQAyeb9260jYQuCHN500GRv0kb00cRGQqW18'); // Replace with your Stripe secret key


// export const createOrder = async (req, res) => {
//     try {
//         const { userId, products, totalPrice, shippingAddress } = req.body;

//         console.log('Received Data:', { userId, products, totalPrice, shippingAddress }); // Log request data

//         // Validate request data
//         if (!userId || !products || !totalPrice || !shippingAddress) {
//             throw new Error('Missing required fields.');
//         }

//         const session = await stripe.checkout.sessions.create({
//             payment_method_types: ['card'],
//             line_items: products.map(product => ({
//                 price_data: {
//                     currency: 'usd',
//                     product_data: {
//                         name: product.name,
//                     },
//                     unit_amount: product.price * 100, // Stripe expects amount in cents
//                 },
//                 quantity: product.quantity,
//             })),
//             mode: 'payment',
//             // success_url: `http://localhost:${process.env.PORT || 5173}/success`,
//             // cancel_url: `http://localhost:${process.env.PORT || 5173}/cancel`,
//             success_url: `http://localhost:5173/success`,
//             cancel_url: `http://localhost:5173/cancel`,
//         });

    
//         console.log('Stripe Session:', session);

//         // Save the order with the Stripe session ID and shipping address
//         const order = await Order.create({
//             user: userId,
//             products: products.map(p => ({ product: p.productId, quantity: p.quantity })),
//             totalPrice,
//             stripeSessionId: session.id,
//             shippingAddress
//         });

//         res.json({ sessionId: session.id });
//     } catch (error) {
//         console.error('Error creating order:', error.message); // Log error message
//         res.status(500).json({ error: error.message });
//     }
// };
// export const getOrder = async (req, res) => {
//     try {
//         const { id } = req.params;

//         // Find order by ID
//         const order = await Order.findById(id)
//             .populate('user', 'name email') // Populate user details if needed
//             .populate('products.product', 'name price') // Populate product details if needed
//             .exec();

//         if (!order) {
//             return res.status(404).json({ error: 'Order not found' });
//         }

//         res.json(order);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };


// export const getAllOrders = async (req, res) => {
//     try {
//         // Fetch all orders
//         const orders = await Order.find()
//             // .populate('user', 'name email') // Populate user details if needed
//             .populate('products.product', 'name price') // Populate product details if needed
//             .exec();

//         res.json(orders);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

 

import Order from '../models/orderModel.js';
import Stripe from 'stripe';
import Product from '../models/ProductModels.js';
import User from '../models/userModel.js';

const stripe = new Stripe('sk_test_51Pwpi4023TaI0bKzl1dal6jK7njGYiTgT3Qr7Nt184Qr3wCyrr5pS5BP18NXj9GQAyeb9260jYQuCHN500GRv0kb00cRGQqW18'); // Replace with your Stripe secret key

// Create a new order
export const createOrder = async (req, res) => {
    try {
        const { userId, products, totalPrice, shippingAddress } = req.body;

        console.log('Received Data:', { userId, products, totalPrice, shippingAddress });

        if (!userId || !products || !totalPrice || !shippingAddress) {
            throw new Error('Missing required fields.');
        }
        console.log("user id ============", userId)
 // Check if user exists
 const user = await User.findById(userId);
 if (!user) {
     return res.status(400).json({ error: 'User not found' });
 }
        // Create a Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: products.map(product => ({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: product.name,
                    },
                    unit_amount: product.price * 100, // Stripe expects amount in cents
                },
                quantity: product.quantity,
            })),
            mode: 'payment',
            success_url: `http://localhost:5173/success`,
            cancel_url: `http://localhost:5173/cancel`,
        });

        // console.log('Stripe Session:', session);

        // Save the order with the Stripe session ID
        const order = await Order.create({
            user: userId,
            products: products.map(p => ({ product: p.productId, quantity: p.quantity })),
            totalPrice,
            stripeSessionId: session.id,
            shippingAddress
        });

        res.json({ sessionId: session.id });
    } catch (error) {
        console.error('Error creating order:', error.message);
        res.status(500).json({ error: error.message });
    }
};

// Get an order by ID with full product population (including thumbnail, userId, userType)
export const getOrder = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findById(id)
            .populate('user', 'name email')  // Populate user details
            .populate({
                path: 'products.product',
                select: 'name price sku thumbnail userId userType category',  // Populate product fields including thumbnail, userId, userType
                populate: {
                    path: 'category',
                    select: 'name' // Populate category name within product
                }
            })
            .exec();

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json(order);
    } catch (error) {
        console.error('Error fetching order:', error.message);
        res.status(500).json({ error: error.message });
    }
};

// Get all orders with full product population (including thumbnail, userId, userType)
export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('user', 'name email')  // Populate user details
            .populate({
                path: 'products.product',
                select: 'name price sku thumbnail userId userType category',  // Populate product fields including thumbnail, userId, userType
                populate: {
                    path: 'category',
                    select: 'name'  // Populate category within product
                }
            })
            .exec();

        res.json(orders);
    } catch (error) {
        console.error('Error fetching all orders:', error.message);
        res.status(500).json({ error: error.message });
    }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        order.status = status;
        await order.save();

        res.json({ message: 'Order status updated successfully', order });
    } catch (error) {
        console.error('Error updating order status:', error.message);
        res.status(500).json({ error: error.message });
    }
};

// Delete an order
export const deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        await order.remove();

        res.json({ message: 'Order deleted successfully' });
    } catch (error) {
        console.error('Error deleting order:', error.message);
        res.status(500).json({ error: error.message });
    }
};
