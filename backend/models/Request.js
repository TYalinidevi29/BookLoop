const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({

  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },

  bookTitle: {
    type: String,
    required: true
  },

  requesterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  status: {
    type: String,
    default: 'Pending'
  }

});

module.exports = mongoose.model('Request', requestSchema);