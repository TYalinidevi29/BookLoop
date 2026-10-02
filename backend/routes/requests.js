const express = require('express');
const Request = require('../models/Request');

const router = express.Router();

router.get('/', async (req, res) => {

  try {

    const { requesterId } = req.query;

    let requests;

    if (requesterId) {

      requests = await Request.find({
        requesterId: requesterId
      });

    } else {

      requests = await Request.find();

    }

    res.json(requests);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: 'Failed to load requests'
    });

  }

});


router.post('/', async (req, res) => {

  try {

    const {
      bookId,
      bookTitle,
      requesterId
    } = req.body;

    if (!bookId || !bookTitle || !requesterId) {

      return res.status(400).json({
        message: 'Book details and user ID are required'
      });

    }

    const newRequest = new Request({
      bookId,
      bookTitle,
      requesterId,
      status: 'Pending'
    });

    await newRequest.save();

    res.status(201).json({
      message: 'Book request sent successfully'
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: 'Failed to send book request'
    });

  }

});

module.exports = router;