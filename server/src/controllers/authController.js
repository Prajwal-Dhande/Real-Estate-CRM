const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../middleware/auth');

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function generateToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Register a new user
 */
async function register(req, res) {
  try {
    const { name, email, password, role = 'agent', assignedLocalities = [] } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email already exists'
      });
    }

    const passwordHash = await User.hashPassword(password);

    const user = new User({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: ['admin', 'agent'].includes(role) ? role : 'agent',
      assignedLocalities
    });

    await user.save();

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user
    });
  } catch (err) {
    console.error('[Auth Controller] Register error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to register user',
      error: err.message
    });
  }
}

/**
 * Login user
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user
    });
  } catch (err) {
    console.error('[Auth Controller] Login error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to login',
      error: err.message
    });
  }
}

/**
 * Get current authenticated user profile
 */
async function getMe(req, res) {
  return res.status(200).json({
    success: true,
    user: req.user
  });
}

/**
 * Get all active agents (useful for lead assignment and agent lists)
 */
async function getAgents(req, res) {
  try {
    const agents = await User.find({ role: 'agent', isActive: true })
      .select('name email role assignedLocalities activeLeadCount')
      .sort({ name: 1 });

    return res.status(200).json({
      success: true,
      count: agents.length,
      agents
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch agents',
      error: err.message
    });
  }
}

module.exports = {
  register,
  login,
  getMe,
  getAgents
};

