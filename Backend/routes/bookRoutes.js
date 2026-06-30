const express = require("express");
const router = express.Router();

const {
  addBook,
  getAllBooks,
  getBookById,
  updateBook,
  deleteBook,
} = require("../controllers/bookController");

const protect = require("../middleware/authMiddleware");

// Public Routes
router.get("/", getAllBooks);
router.get("/:id", getBookById);

// Protected Routes
router.post("/", protect, addBook);
router.put("/:id", protect, updateBook);
router.delete("/:id", protect, deleteBook);

module.exports = router;