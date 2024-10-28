
// // routes/orderRoutes.js
// import express from 'express';
// import {
//     createOrder,
//     getAllOrders,
  
  
// } from '../controllers/orderControllers.js';

// const router = express.Router();

// router.post('/', createOrder);

// router.get('/', getAllOrders);

// export default router;



import express from 'express';
import {
    createOrder,
    getOrder,
    getAllOrders,
    updateOrderStatus,
    deleteOrder
} from '../controllers/orderControllers.js';


const router = express.Router();

// Route to create a new order
router.post('/', createOrder);

// Route to get all orders
router.get('/', getAllOrders);

// Route to get a specific order by ID
router.get('/:id', getOrder);

// Route to update order status by ID
router.put('/:id/status', updateOrderStatus);

// Route to delete an order by ID
router.delete('/:id', deleteOrder);

export default router;
