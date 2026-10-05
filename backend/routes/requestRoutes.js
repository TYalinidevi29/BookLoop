const express = require('express');
const router = express.Router();
const {
  requestBook,
  getMyRequests,
  getReceivedRequests,
  updateRequestStatus
} = require('../controllers/requestController');
const { protect } = require('../middleware/authMiddleware');

// All request operations require authentication
router.use(protect);

// Request a book from another user
router.post('/', requestBook);

// Get requests sent by the logged-in user
router.get('/my-requests', getMyRequests);

// Get requests received for books owned by logged-in user
router.get('/received', getReceivedRequests);

// Update status of a request (Accept / Reject)
router.put('/:id/status', updateRequestStatus);

module.exports = router;
