
import Order from '../models/orderModel.js';
import Stripe from 'stripe';
import Product from '../models/ProductModels.js';
import User from '../models/userModel.js';

const stripe = new Stripe('sk_test_51Pwpi4023TaI0bKzl1dal6jK7njGYiTgT3Qr7Nt184Qr3wCyrr5pS5BP18NXj9GQAyeb9260jYQuCHN500GRv0kb00cRGQqW18'); // Replace with your Stripe secret key

// Create a new order

export const createOrder = async (req, res) => {
    try {
    
      const { userId, products, totalPrice, shippingAddress, paymentMethod } = req.body;
      console.log('Received Data:', { userId, products, totalPrice, shippingAddress, paymentMethod });
  
      if (!userId || !products || !totalPrice || !shippingAddress || !paymentMethod) {
        throw new Error('Missing required fields.');
      }
  
      // Check if user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(400).json({ error: 'User not found' });
      }
  
      // If payment method is Cash on Delivery, create the order directly without Stripe
      if (paymentMethod === 'COD') {
        const order = await Order.create({
          user: userId,
          products: products.map(p => ({ product: p.productId, quantity: p.quantity })),
          totalPrice,
          stripeSessionId: null, // No Stripe session for COD
          shippingAddress,
          status: 'Pending', // Set initial status to Pending
        });
  
        return res.status(201).json({ message: 'Order created successfully', orderId: order._id });
      }
  
      // Otherwise, create a Stripe checkout session for card payments
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
  
      // Save the order with the Stripe session ID
      const order = await Order.create({
        user: userId,
        products: products.map(p => ({ product: p.productId, quantity: p.quantity })),
        totalPrice,
        stripeSessionId: session.id,
        shippingAddress,
        status: 'Pending',
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

