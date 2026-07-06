const express = require("express");
const router = express.Router();

const {
  addBook,
  getAllBooks,
  getBookById,
  updateBook,
  deleteBook,
  searchBooks,
  getOrganizerBooks,
  createBookReview,
  deleteBookReview
} = require("../controllers/bookController");
const { protect, organizer, admin } = require("../middleware/authMiddleware");

// Public Routes
router.get("/", getAllBooks);
router.get("/search", searchBooks);
router.get("/:id", getBookById);

// Protected Routes
router.get("/organizer", protect, organizer, getOrganizerBooks);
router.post("/", protect, organizer, addBook);
router.put("/:id", protect, organizer, updateBook);
router.delete("/:id", protect, organizer, deleteBook);
router.post("/:id/reviews", protect, createBookReview);
router.delete("/:id/reviews/:reviewId", protect, admin, deleteBookReview);

module.exports = router;