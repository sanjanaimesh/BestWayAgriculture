const Order = require('../models/Orders');
const { successResponse, errorResponse } = require('../utils/response');

class OrderController {
  // Create new order
  static async createOrder(req, res) {
    try {
      const {
        orderNumber,
        customerInfo,
        items,
        subtotal,
        shipping,
        total,
        status = 'pending'
      } = req.body;

      // Validate required fields
      if (!orderNumber || !customerInfo || !items || items.length === 0) {
        return errorResponse(res, "Order number, customer info, and items are required", null, 400);
      }

      // Create order instance
      const orderData = {
        order_number: orderNumber,
        customer_first_name: customerInfo.firstName,
        customer_last_name: customerInfo.lastName,
        customer_email: customerInfo.email,
        customer_phone: customerInfo.phone,
        shipping_address: customerInfo.address,
        shipping_city: customerInfo.city,
        shipping_postal_code: customerInfo.postalCode,
        shipping_province: customerInfo.province,
        subtotal: subtotal,
        shipping_cost: shipping,
        total: total,
        status: status,
        items: items
      };

      const order = new Order(orderData);

      // Validate order data
      const validationErrors = order.validate();
      if (validationErrors.length > 0) {
        return errorResponse(res, "Validation failed", validationErrors, 400);
      }

      const savedOrder = await order.save();
      return successResponse(res, "Order created successfully", savedOrder, 201);

    } catch (error) {
      console.error('Error in createOrder:', error);
      return errorResponse(res, "Error creating order", error.message, 500);
    }
  }

  // Update entire order - ADDED THIS METHOD
  static async updateOrder(req, res) {
    try {
      const orderId = parseInt(req.params.id);
      const {
        orderNumber,
        customerInfo,
        items,
        subtotal,
        shipping,
        total,
        status
      } = req.body;

      if (isNaN(orderId)) {
        return errorResponse(res, "Invalid order ID", null, 400);
      }

      // Check if order exists first
      const existingOrder = await Order.findById(orderId);
      if (!existingOrder) {
        return errorResponse(res, "Order not found", null, 404);
      }

      // Update order data
      existingOrder.order_number = orderNumber || existingOrder.order_number;
      existingOrder.customer_first_name = customerInfo?.firstName || existingOrder.customer_first_name;
      existingOrder.customer_last_name = customerInfo?.lastName || existingOrder.customer_last_name;
      existingOrder.customer_email = customerInfo?.email || existingOrder.customer_email;
      existingOrder.customer_phone = customerInfo?.phone || existingOrder.customer_phone;
      existingOrder.shipping_address = customerInfo?.address || existingOrder.shipping_address;
      existingOrder.shipping_city = customerInfo?.city || existingOrder.shipping_city;
      existingOrder.shipping_postal_code = customerInfo?.postalCode || existingOrder.shipping_postal_code;
      existingOrder.shipping_province = customerInfo?.province || existingOrder.shipping_province;
      existingOrder.subtotal = subtotal !== undefined ? subtotal : existingOrder.subtotal;
      existingOrder.shipping_cost = shipping !== undefined ? shipping : existingOrder.shipping_cost;
      existingOrder.total = total !== undefined ? total : existingOrder.total;
      existingOrder.status = status || existingOrder.status;
      existingOrder.items = items || existingOrder.items;

      // Validate updated order data
      const validationErrors = existingOrder.validate();
      if (validationErrors.length > 0) {
        return errorResponse(res, "Validation failed", validationErrors, 400);
      }

      const updatedOrder = await existingOrder.update();
      return successResponse(res, "Order updated successfully", updatedOrder);

    } catch (error) {
      console.error('Error in updateOrder:', error);
      return errorResponse(res, "Error updating order", error.message, 500);
    }
  }

  // Get all orders
  static async getAllOrders(req, res) {
    try {
      const orders = await Order.findAll();
      return successResponse(res, "Orders retrieved successfully", orders);

    } catch (error) {
      console.error('Error in getAllOrders:', error);
      return errorResponse(res, "Error fetching orders", error.message, 500);
    }
  }

  // Get order by ID
  static async getOrderById(req, res) {
    try {
      const orderId = parseInt(req.params.id);
      
      if (isNaN(orderId)) {
        return errorResponse(res, "Invalid order ID", null, 400);
      }

      const order = await Order.findById(orderId);

      if (!order) {
        return errorResponse(res, "Order not found", null, 404);
      }

      return successResponse(res, "Order retrieved successfully", order);

    } catch (error) {
      console.error('Error in getOrderById:', error);
      return errorResponse(res, "Error fetching order", error.message, 500);
    }
  }

  // Get order by order number
  static async getOrderByNumber(req, res) {
    try {
      const orderNumber = req.params.orderNumber;
      
      if (!orderNumber || orderNumber.trim() === '') {
        return errorResponse(res, "Order number is required", null, 400);
      }

      const order = await Order.findByOrderNumber(orderNumber);

      if (!order) {
        return errorResponse(res, "Order not found", null, 404);
      }

      return successResponse(res, "Order retrieved successfully", order);

    } catch (error) {
      console.error('Error in getOrderByNumber:', error);
      return errorResponse(res, "Error fetching order", error.message, 500);
    }
  }

  // Update order status - FIXED THIS METHOD
  static async updateOrderStatus(req, res) {
    try {
      const orderId = parseInt(req.params.id);
      const { status } = req.body;

      console.log('UpdateOrderStatus called with:', { orderId, status });

      if (isNaN(orderId)) {
        return errorResponse(res, "Invalid order ID", null, 400);
      }

      if (!status || status.trim() === '') {
        return errorResponse(res, "Status is required", null, 400);
      }

      // Validate status
      const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status.toLowerCase())) {
        return errorResponse(res, "Invalid status", { validStatuses }, 400);
      }

      // Check if order exists first
      const existingOrder = await Order.findById(orderId);
      console.log('Found order:', existingOrder ? 'Yes' : 'No');
      
      if (!existingOrder) {
        return errorResponse(res, "Order not found", null, 404);
      }

      console.log('Order data before update:', {
        id: existingOrder.id,
        order_number: existingOrder.order_number,
        customer_first_name: existingOrder.customer_first_name,
        customer_last_name: existingOrder.customer_last_name,
        customer_email: existingOrder.customer_email,
        items_count: existingOrder.items ? existingOrder.items.length : 0
      });

      // Use the instance method to update status
      const updatedOrder = await existingOrder.updateStatus(status.toLowerCase());
      
      return successResponse(res, "Order status updated successfully", updatedOrder);

    } catch (error) {
      console.error('Error in updateOrderStatus:', error);
      return errorResponse(res, "Error updating order status", error.message, 500);
    }
  }

  // Delete order
  static async deleteOrder(req, res) {
    try {
      const orderId = parseInt(req.params.id);
      
      if (isNaN(orderId)) {
        return errorResponse(res, "Invalid order ID", null, 400);
      }

      const order = await Order.findById(orderId);
      if (!order) {
        return errorResponse(res, "Order not found", null, 404);
      }

      // Check if order can be deleted (optional business logic)
      if (order.status === 'shipped' || order.status === 'delivered') {
        return errorResponse(res, "Cannot delete shipped or delivered orders", null, 400);
      }

      const deleted = await Order.deleteById(orderId);
      if (!deleted) {
        return errorResponse(res, "Failed to delete order", null, 500);
      }

      return successResponse(res, "Order deleted successfully", { orderId });

    } catch (error) {
      console.error('Error in deleteOrder:', error);
      return errorResponse(res, "Error deleting order", error.message, 500);
    }
  }

  // Get orders by customer email
  static async getOrdersByCustomer(req, res) {
    try {
      const { email } = req.query;
      
      if (!email || email.trim() === '') {
        return errorResponse(res, "Customer email is required", null, 400);
      }

      const orders = await Order.findByCustomerEmail(email);
      return successResponse(res, "Customer orders retrieved successfully", orders);

    } catch (error) {
      console.error('Error in getOrdersByCustomer:', error);
      return errorResponse(res, "Error fetching customer orders", error.message, 500);
    }
  }

  // Get orders by status
  static async getOrdersByStatus(req, res) {
    try {
      const status = req.params.status;
      
      if (!status || status.trim() === '') {
        return errorResponse(res, "Status is required", null, 400);
      }

      const orders = await Order.findByStatus(status.toLowerCase());
      return successResponse(res, `Orders with status '${status}' retrieved successfully`, orders);

    } catch (error) {
      console.error('Error in getOrdersByStatus:', error);
      return errorResponse(res, "Error fetching orders by status", error.message, 500);
    }
  }

  // Get order statistics
  static async getOrderStatistics(req, res) {
    try {
      const stats = await Order.getStatistics();
      return successResponse(res, "Order statistics retrieved successfully", stats);

    } catch (error) {
      console.error('Error in getOrderStatistics:', error);
      return errorResponse(res, "Error fetching order statistics", error.message, 500);
    }
  }

  // Generate order number
  static async generateOrderNumber(req, res) {
    try {
      const orderNumber = Order.generateOrderNumber();
      return successResponse(res, "Order number generated successfully", { orderNumber });

    } catch (error) {
      console.error('Error in generateOrderNumber:', error);
      return errorResponse(res, "Error generating order number", error.message, 500);
    }
  }
}

module.exports = OrderController;