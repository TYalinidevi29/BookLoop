const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const router = express.Router();

router.post('/register', async (req, res) => {

  try {

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Please fill all fields'
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: 'Email already registered'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword
    });

    await user.save();

    res.status(201).json({
      message: 'Registration successful'
    });

  } catch (error) {

    console.log('REGISTER ERROR:', error);

    res.status(500).json({
      message: 'Registration failed'
    });

  }

});


router.post('/login', async (req, res) => {

  try {

    console.log('LOGIN REQUEST:', req.body);

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Please enter email and password'
      });
    }

    const user = await User.findOne({ email });

    console.log('USER FOUND:', user);

    if (!user) {
      return res.status(400).json({
        message: 'User not found'
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    console.log('PASSWORD MATCH:', passwordMatch);

    if (!passwordMatch) {
      return res.status(400).json({
        message: 'Invalid password'
      });
    }

    res.json({
      message: 'Login successful',

      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email
      }

    });

  } catch (error) {

    console.log('LOGIN ERROR:', error);

    res.status(500).json({
      message: 'Login failed'
    });

  }

});


module.exports = router;