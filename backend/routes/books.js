const express = require('express');
const Book = require('../models/Book');

const router = express.Router();


// Get books
router.get('/', async (req, res) => {

  try {

    const { ownerId } = req.query;

    let books;

    if (ownerId) {
      books = await Book.find({ ownerId: ownerId });
    } else {
      books = await Book.find();
    }

    res.json(books);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: 'Failed to get books'
    });

  }

});


// Add a book
router.post('/', async (req, res) => {

  try {

    const {
      title,
      author,
      category,
      ownerId
    } = req.body;

    if (!title || !author || !category || !ownerId) {

      return res.status(400).json({
        message: 'Please fill all fields'
      });

    }

    const book = new Book({
      title,
      author,
      category,
      ownerId
    });

    await book.save();

    res.status(201).json({
      message: 'Book added successfully',
      book
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: 'Failed to add book'
    });

  }

});


// Delete a book
router.delete('/:id', async (req, res) => {

  try {

    await Book.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Book deleted successfully'
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: 'Failed to delete book'
    });

  }

});


module.exports = router;