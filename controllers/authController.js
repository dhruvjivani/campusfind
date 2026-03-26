const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { email, password, full_name } = req.body;

    // Validate required fields
    if (!email || !password || !full_name) {
      return res.status(400).json({ message: 'Email, password, and full name are required' });
    }

    // Check if user exists
    const userExists = await User.findByEmail(email);
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Auto-generate student_id from email or random ID
    const student_id = `S${Date.now()}`;
    
    // Split full_name into first and last name
    const nameParts = full_name.trim().split(/\s+/);
    const first_name = nameParts[0];
    const last_name = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'User';
    
    // Set default campus if not provided
    const campus = req.body.campus || 'Main Campus';
    const program = req.body.program || 'Not Specified';

    // Create user
    const user = await User.create({
      student_id,
      email,
      first_name,
      last_name,
      campus,
      program,
      password
    });

    if (user) {
      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: user.id,
          student_id: user.student_id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          campus: user.campus,
          program: user.program,
          is_verified: user.is_verified,
          role: user.role
        },
        token: generateToken(user.id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findByEmail(email);
    
    if (user && (await User.comparePassword(password, user.password))) {
      res.status(200).json({
        message: 'Login successful',
        user: {
          id: user.id,
          student_id: user.student_id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          campus: user.campus,
          program: user.program,
          is_verified: user.is_verified,
          role: user.role
        },
        token: generateToken(user.id)
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { register, login, getMe };