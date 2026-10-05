const express = require('express');
const router = express.Router();
const {
  getAllBooks,
  getMyBooks,
  addBook,
  deleteBook
} = require('../controllers/bookController');
const { protect } = require('../middleware/authMiddleware');

// Public route: Get all books (with search query param)
router.get('/', getAllBooks);

// Protected routes: Operations requiring user authentication
router.get('/my-books', protect, getMyBooks);
router.post('/', protect, addBook);
router.delete('/:id', protect, deleteBook);

module.exports = router;
