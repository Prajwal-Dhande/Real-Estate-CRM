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

/**
 * Switch to a demo account instantly (Admin or Agent)
 */
async function demoSwitch(req, res) {
  try {
    const { email } = req.body;
    const targetEmail = (email || 'admin@estateiq.com').toLowerCase();

    let user = await User.findOne({ email: targetEmail });

    // Fallback if database hasn't been seeded yet
    if (!user) {
      const passwordHash = await User.hashPassword('Password123!');
      if (targetEmail.includes('rahul')) {
        user = new User({
          name: 'Rahul Sharma',
          email: 'rahul.sharma@estateiq.com',
          passwordHash,
          role: 'agent',
          assignedLocalities: ['Vasudev Nagar', 'Dharampeth'],
          activeLeadCount: 5,
          isActive: true
        });
        await user.save();
      } else if (targetEmail.includes('sneha')) {
        user = new User({
          name: 'Sneha Deshmukh',
          email: 'sneha@estateiq.com',
          passwordHash,
          role: 'agent',
          assignedLocalities: ['MIHAN', 'Manish Nagar', 'Trimurti Nagar'],
          activeLeadCount: 7,
          isActive: true
        });
        await user.save();
      } else {
        user = new User({
          name: 'Prajwal Dhande',
          email: 'admin@estateiq.com',
          passwordHash,
          role: 'admin',
          assignedLocalities: ['Civil Lines', 'Dharampeth', 'Vasudev Nagar', 'MIHAN', 'Manish Nagar', 'Trimurti Nagar', 'Sadar'],
          activeLeadCount: 0,
          isActive: true
        });
        await user.save();
      }
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: `Switched session to ${user.name} (${user.role})`,
      token,
      user
    });
  } catch (err) {
    console.error('[Auth Controller] Demo switch error:', err);
    return res.status(500).json({
      success: false,
      message: 'Demo switch failed',
      error: err.message
    });
  }
}

module.exports = {
  register,
  login,
  getMe,
  getAgents,
  demoSwitch
};

