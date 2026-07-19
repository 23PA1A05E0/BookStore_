const Order = require("../models/Order");
const Book = require("../models/Book");

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    const { orderItems, totalPrice } = req.body;

    if (orderItems && orderItems.length === 0) {
      return res.status(400).json({ message: "No order items" });
    }

    // Verify stock and update it (basic implementation)
    for (let i = 0; i < orderItems.length; i++) {
      const item = orderItems[i];
      const book = await Book.findById(item.book);
      if (!book) {
        return res.status(404).json({ message: `Book not found: ${item.book}` });
      }
      if (book.stock < item.quantity) {
        return res.status(400).json({ message: `Not enough stock for ${book.title}` });
      }
      book.stock -= item.quantity;
      await book.save();
    }

    const order = new Order({
      user: req.user.id,
      orderItems,
      totalPrice,
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).populate("orderItems.book", "title image price");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("user", "id name email")
      .populate("orderItems.book", "title image price");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Get organizer's book orders
// @route   GET /api/orders/organizer
// @access  Private/Organizer
const getOrganizerOrders = async (req, res) => {
  try {
    const books = await Book.find({ organizer: req.user.id });
    const bookIds = books.map((b) => b._id.toString());

    const orders = await Order.find({
      "orderItems.book": { $in: bookIds },
    })
      .populate("user", "id name email")
      .populate("orderItems.book", "title image price organizer")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin or Organizer
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (req.user.role !== "admin") {
      const books = await Book.find({ organizer: req.user.id });
      const bookIds = books.map((b) => b._id.toString());
      const ownsBookInOrder = order.orderItems.some((item) =>
        bookIds.includes(item.book.toString())
      );
      if (!ownsBookInOrder) {
        return res.status(401).json({ message: "Not authorized to update status of this order" });
      }
    }

    order.status = status || order.status;
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private/Admin
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    await order.deleteOne();
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Submit overall experience rating for an order
// @route   PUT /api/orders/:id/experience
// @access  Private
const rateExperience = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.user.toString() !== req.user.id.toString()) {
      return res.status(401).json({ message: "Not authorized to review this order" });
    }

    order.experienceRating = Number(rating);
    order.experienceComment = comment;

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrders,
  getOrganizerOrders,
  updateOrderStatus,
  deleteOrder,
  rateExperience,
};
