const Request = require('../models/Request');
const Book = require('../models/Book');

/**
 * @desc    Request a book from another user
 * @route   POST /api/requests
 * @access  Private
 */
const requestBook = async (req, res) => {
  try {
    const { bookId } = req.body;

    if (!bookId) {
      return res.status(400).json({
        success: false,
        message: 'Book ID is required'
      });
    }

    // Find the book
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Prevent user from requesting their own book
    if (book.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot request your own book'
      });
    }

    // Check if user already submitted a pending request for this book
    const existingPending = await Request.findOne({
      book: bookId,
      requester: req.user._id,
      status: 'Pending'
    });

    if (existingPending) {
      return res.status(400).json({
        success: false,
        message: 'You have already sent a pending request for this book'
      });
    }

    // Create the request
    const newRequest = await Request.create({
      book: book._id,
      requester: req.user._id,
      owner: book.owner,
      status: 'Pending'
    });

    const populatedRequest = await Request.findById(newRequest._id)
      .populate('book', 'title author category')
      .populate('owner', 'name email')
      .populate('requester', 'name email');

    return res.status(201).json({
      success: true,
      message: 'Book request sent successfully',
      request: populatedRequest
    });
  } catch (error) {
    console.error('Error creating request:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while requesting book',
      error: error.message
    });
  }
};

/**
 * @desc    Get requests made by the logged-in user
 * @route   GET /api/requests/my-requests
 * @access  Private
 */
const getMyRequests = async (req, res) => {
  try {
    const requests = await Request.find({ requester: req.user._id })
      .populate('book', 'title author category')
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (error) {
    console.error('Error fetching requests:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching your requests',
      error: error.message
    });
  }
};

/**
 * @desc    Get requests received by the logged-in user for their books
 * @route   GET /api/requests/received
 * @access  Private
 */
const getReceivedRequests = async (req, res) => {
  try {
    const requests = await Request.find({ owner: req.user._id })
      .populate('book', 'title author category')
      .populate('requester', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (error) {
    console.error('Error fetching received requests:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching received requests',
      error: error.message
    });
  }
};

/**
 * @desc    Update request status (Accept or Reject by book owner)
 * @route   PUT /api/requests/:id/status
 * @access  Private
 */
const updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const requestId = req.params.id;

    if (!['Accepted', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either Accepted or Rejected'
      });
    }

    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // Verify only the book owner can accept or reject
    if (request.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized: Only the book owner can update request status'
      });
    }

    request.status = status;
    await request.save();

    const updated = await Request.findById(requestId)
      .populate('book', 'title author category')
      .populate('requester', 'name email')
      .populate('owner', 'name email');

    return res.status(200).json({
      success: true,
      message: `Request marked as ${status}`,
      request: updated
    });
  } catch (error) {
    console.error('Error updating request status:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating request status',
      error: error.message
    });
  }
};

module.exports = {
  requestBook,
  getMyRequests,
  getReceivedRequests,
  updateRequestStatus
};
