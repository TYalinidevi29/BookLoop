const Book = require('../models/Book');
const Request = require('../models/Request');

/**
 * @desc    Get all books (with optional search by title or author)
 * @route   GET /api/books
 * @access  Public
 */
const getAllBooks = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query = {
        $or: [
          { title: searchRegex },
          { author: searchRegex },
          { category: searchRegex }
        ]
      };
    }

    // Find books and populate owner details (name and email)
    const books = await Book.find(query)
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: books.length,
      books
    });
  } catch (error) {
    console.error('Error fetching books:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching books',
      error: error.message
    });
  }
};

/**
 * @desc    Get books added by logged-in user
 * @route   GET /api/books/my-books
 * @access  Private
 */
const getMyBooks = async (req, res) => {
  try {
    const books = await Book.find({ owner: req.user._id })
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: books.length,
      books
    });
  } catch (error) {
    console.error('Error fetching user books:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching your books',
      error: error.message
    });
  }
};

/**
 * @desc    Add a new book
 * @route   POST /api/books
 * @access  Private
 */
const addBook = async (req, res) => {
  try {
    const { title, author, category } = req.body;

    // Validate inputs
    if (!title || !author || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, author, and category'
      });
    }

    const book = await Book.create({
      title: title.trim(),
      author: author.trim(),
      category: category.trim(),
      owner: req.user._id
    });

    const populatedBook = await Book.findById(book._id).populate('owner', 'name email');

    return res.status(201).json({
      success: true,
      message: 'Book added successfully',
      book: populatedBook
    });
  } catch (error) {
    console.error('Error adding book:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while adding book',
      error: error.message
    });
  }
};

/**
 * @desc    Delete own book
 * @route   DELETE /api/books/:id
 * @access  Private
 */
const deleteBook = async (req, res) => {
  try {
    const bookId = req.params.id;

    // Check if book exists
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Verify ownership: users cannot delete books belonging to other users
    if (book.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized: You can only delete your own books'
      });
    }

    // Clean up any requests related to this book
    await Request.deleteMany({ book: book._id });

    // Delete the book
    await book.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Book deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting book:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting book',
      error: error.message
    });
  }
};

module.exports = {
  getAllBooks,
  getMyBooks,
  addBook,
  deleteBook
};
