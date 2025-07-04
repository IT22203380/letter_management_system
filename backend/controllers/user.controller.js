const jwt = require("jsonwebtoken");
require("dotenv").config();
const path = require('path');
const { activityLogger, systemLogger, securityLogger } = require("../utils/logger");
const createToken = require("../utils/token.creator.util");
const db = require("../models");

const bcrypt = require("bcryptjs");
const { User } = require('../models');

// JWT credentials
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const saltRounds = 10;

exports.Login = async (req, res) => {
  try {
    const { nic, password } = req.body;

    // Basic validation
    if (!nic || !password) {
      return res.status(400).json({
        status: false,
        message: "NIC and password are required"
      });
    }

    // Find user by NIC
    const user = await User.findOne({
      where: { nic }
    });

    // Always return the same error message for security
    const invalidCredentials = () => {
      securityLogger.security(`Failed login attempt - Invalid credentials for NIC: ${nic}`);
      return res.status(401).json({ 
        status: false,
        message: "Invalid NIC or password" 
      });
    };

    if (!user) {
      return invalidCredentials();
    }

    // Check if password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return invalidCredentials();
    }

    // Create tokens
    const accessToken = jwt.sign(
      {
        id: user.id,
        nic: user.nic,
        role: user.role
      },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    // Log successful login
    activityLogger.info(`User logged in: ${user.nic}`);

    // Return user data and access token
    const userResponse = {
      id: user.id,
      nic: user.nic,
      username: user.username,
      role: user.role
    };

    res.status(200).json({
      status: true,
      message: "Login successful",
      data: {
        user: userResponse,
        accessToken,
        role: user.role 
      }
    });

  } catch (error) {
    systemLogger.error(`Login error: ${error.message}`, { error });
    res.status(500).json({
      status: false,
      message: 'An error occurred during login'
    });
  }
};


exports.Refresh = async (req, res) => {
const token = req.cookies.refreshToken;
if (!token) {
  securityLogger.security("Refresh token attempt - No token provided");
  return res.sendStatus(401);
}

try {
  const payload = jwt.verify(token, REFRESH_SECRET);

  // Find user by ID from refresh token
  const user = await User.findOne({
    where: { id: payload.id },
    include: [
      {
        model: Role,
        as: "roles",
        attributes: ["role_name"],
        required: false,
      },
    ],
  });

  if (!user) {
    securityLogger.security(`Refresh token attempt - User not found for token: ${token.substring(0, 20)}...`);
    return res.status(403).json({ 
      status: false,
      message: "User not found" 
    });
  }

  // Generate new access token
  const { accessToken } = createToken(user);

  securityLogger.security(
    `Token refreshed for user: ${user.nic}`
  );

  res.json({ 
    status: true,
    accessToken 
  });
} catch (error) {
  securityLogger.security(`Invalid refresh token attempt: ${error.message}`);
  return res.status(403).json({
    status: false,
    message: "Invalid or expired refresh token"
  });
}
};

// Register new user
exports.Register = async (req, res) => {
  try {
    const { nic, username, password, role = 'user' } = req.body;

    // Check if user already exists by NIC
    const existingUserByNIC = await User.findOne({ where: { nic } });
    if (existingUserByNIC) {
      return res.status(400).json({
        status: false,
        message: "User with this NIC already exists"
      });
    }

    // Check if user already exists by username
    const existingUserByUsername = await User.findOne({ where: { username } });
    if (existingUserByUsername) {
      return res.status(400).json({
        status: false,
        message: "Username already exists"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await User.create({
      nic,
      username,
      password: hashedPassword,
      role: role.toLowerCase() // Ensure role is lowercase
    });

    // Remove sensitive data from response
    const userResponse = user.toJSON();
    delete userResponse.password;

    // Log registration
    securityLogger.security(`New user registered: ${user.nic}, Username: ${user.username}, Role: ${user.role}`);

    res.status(201).json({
      status: true,
      message: "User registered successfully",
      data: {
        user: userResponse
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    systemLogger.error(`Registration error: ${error.message}`);
    res.status(500).json({
      status: false,
      message: "An error occurred during registration",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Add this after your Login and Refresh exports
exports.CreateUser = async (req, res) => {
try {
  const { nic, password, name, email } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ where: { nic } });
  if (existingUser) {
    return res.status(400).json({
      status: false,
      message: "User with this NIC already exists"
    });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Create user
  const user = await User.create({
    nic,
    password: hashedPassword,
    name,
    email,
    status: 'ACTIVE' // or 'PENDING' if you need email verification
  });

  // Assign default role (optional)
  await user.addRole(1); // Assuming 1 is the ID of a default role

  // Generate tokens
  const { accessToken, refreshToken } = createToken(user);

  // Remove sensitive data from response
  const userResponse = user.toJSON();
  delete userResponse.password;

  // Set refresh token in HTTP-only cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 10 * 60 * 60 * 1000, // 10 hours
  });

  // Log registration
  securityLogger.security(`New user registered: ${user.nic}`);

  res.status(201).json({
    status: true,
    message: "User registered successfully",
    data: {
      user: userResponse,
      accessToken
    }
  });

} catch (error) {
  systemLogger.error(`Registration error: ${error.message}`);
  res.status(500).json({
    status: false,
    message: "An error occurred during registration",
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
}
};

// Add this after CreateUser
exports.getUserProfile = async (req, res) => {
try {
  // req.user is set by the authenticate middleware
  const user = await User.findByPk(req.user.id, {
    attributes: { exclude: ['password'] }, // Don't send password hash
    include: [{
      model: Role,
      as: "roles",
      attributes: ["role_name"],
      through: { attributes: [] } // Exclude junction table attributes
    }]
  });
  
  if (!user) {
    return res.status(404).json({ 
      status: false,
      message: 'User not found' 
    });
  }
  
  res.status(200).json({
    status: true,
    data: user
  });
} catch (error) {
  systemLogger.error(`Profile fetch error: ${error.message}`);
  res.status(500).json({
    status: false,
    message: 'Error fetching user profile',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
}
};

exports.RegisterActive = async (req, res) => {
  try {
    const { nic, username, password, role = 'user' } = req.body;

    // Check if user already exists by NIC
    const existingUserByNIC = await User.findOne({ where: { nic } });
    if (existingUserByNIC) {
      return res.status(400).json({
        status: false,
        message: "User with this NIC already exists"
      });
    }

    // Check if username is already taken
    const existingUserByUsername = await User.findOne({ where: { username } });
    if (existingUserByUsername) {
      return res.status(400).json({
        status: false,
        message: "Username already exists"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user with active status
    const user = await User.create({
      nic,
      username,
      password: hashedPassword,
      role: role.toLowerCase(),
      status: 'active' // Explicitly set status to active
    });

    // Remove sensitive data from response
    const userResponse = user.toJSON();
    delete userResponse.password;

    // Log registration
    securityLogger.security(`New active user registered: ${user.nic}, Username: ${user.username}, Role: ${user.role}`);

    res.status(201).json({
      status: true,
      message: "Active user registered successfully",
      data: {
        user: userResponse
      }
    });

  } catch (error) {
    console.error('Active user registration error:', error);
    systemLogger.error(`Active user registration error: ${error.message}`);
    res.status(500).json({
      status: false,
      message: "An error occurred during registration",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.Logout = async (req, res) => {
try {
  // In a stateless JWT system, the client should remove the token
  // This endpoint can be used to perform any server-side cleanup if needed
  
  // If you're using refresh tokens, you might want to invalidate them here
  // For example, by adding them to a blacklist
  
  securityLogger.info(`User logged out successfully`);
  
  return res.status(200).json({
    status: true,
    message: 'Logged out successfully',
    data: null
  });
} catch (error) {
  securityLogger.error(`Logout error: ${error.message}`);
  return res.status(500).json({
    status: false,
    message: 'Error during logout',
    error: error.message
  });
}
};

// ... (keep your existing exports)