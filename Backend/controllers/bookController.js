const Book = require("../models/Book");

// Add Book
const addBook = async (req, res) => {
  try {
    const bookData = { ...req.body, organizer: req.user.id };
    const book = await Book.create(bookData);

    res.status(201).json({
      success: true,
      message: "Book Added Successfully",
      book,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Books
const getAllBooks = async (req, res) => {
  try {
    const books = await Book.find().lean();

    res.status(200).json({
      success: true,
      count: books.length,
      books,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Book By ID
const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).lean();

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    res.status(200).json({
      success: true,
      book,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Book
const updateBook = async (req, res) => {
  try {
    let book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    if (book.organizer.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({ success: false, message: "Not authorized to update this book" });
    }

    book = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Book Updated Successfully",
      book,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Book
const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    if (book.organizer.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({ success: false, message: "Not authorized to delete this book" });
    }

    await book.deleteOne();

    res.status(200).json({
      success: true,
      message: "Book Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//Search Books
const searchBooks = async (req, res) => {
    try {

        const keyword = req.query.keyword || "";

        const books = await Book.find({
            $or: [
                {
                    title: {
                        $regex: keyword,
                        $options: "i"
                    }
                },
                {
                    author: {
                        $regex: keyword,
                        $options: "i"
                    }
                }
            ]
        }).lean();

        res.status(200).json({
            success: true,
            count: books.length,
            books
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

// Get Organizer Books
const getOrganizerBooks = async (req, res) => {
  try {
    const books = await Book.find({ organizer: req.user.id }).lean();
    res.status(200).json({ success: true, count: books.length, books });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create Book Review
const createBookReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ success: false, message: "Book not found" });
    }

    // Check if user has already reviewed
    const alreadyReviewed = book.reviews.find(
      (r) => r.user.toString() === req.user.id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: "You have already reviewed this book" });
    }

    // Check if user has purchased the book
    const Order = require("../models/Order");
    const userOrders = await Order.find({ user: req.user.id });
    const hasPurchased = userOrders.some((order) =>
      order.orderItems.some((item) => item.book.toString() === book._id.toString())
    );

    if (!hasPurchased) {
      return res.status(400).json({
        success: false,
        message: "You can only review books you have purchased."
      });
    }

    const review = {
      name: req.user.name || "Anonymous User",
      rating: Number(rating),
      comment,
      user: req.user.id,
    };

    book.reviews.push(review);
    book.numReviews = book.reviews.length;
    book.rating =
      book.reviews.reduce((acc, item) => item.rating + acc, 0) /
      book.reviews.length;

    await book.save();

    res.status(201).json({
      success: true,
      message: "Review added successfully",
      rating: book.rating,
      numReviews: book.numReviews,
      reviews: book.reviews
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Book Review (Admin only)
const deleteBookReview = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ success: false, message: "Book not found" });
    }

    const reviewId = req.params.reviewId;
    const reviewExists = book.reviews.some((r) => r._id.toString() === reviewId.toString());

    if (!reviewExists) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    book.reviews = book.reviews.filter((r) => r._id.toString() !== reviewId.toString());
    book.numReviews = book.reviews.length;
    
    if (book.reviews.length > 0) {
      book.rating = book.reviews.reduce((acc, item) => item.rating + acc, 0) / book.reviews.length;
    } else {
      book.rating = 0;
    }

    await book.save();

    res.json({
      success: true,
      message: "Review deleted successfully",
      rating: book.rating,
      numReviews: book.numReviews,
      reviews: book.reviews
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  addBook,
  getAllBooks,
  getBookById,
  updateBook,
  deleteBook,
  searchBooks,
  getOrganizerBooks,
  createBookReview,
  deleteBookReview,
};