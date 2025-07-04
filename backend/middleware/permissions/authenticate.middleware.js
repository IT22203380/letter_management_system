const jwt = require('jsonwebtoken');
const { securityLogger } = require('../../utils/logger');

const authenticate = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      securityLogger.warn('Authentication failed: No token provided');
      return res.status(401).json({
        status: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Extract token
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      securityLogger.warn('Authentication failed: No token provided');
      return res.status(401).json({
        status: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user from payload to request object
    req.user = decoded;
    
    // Continue to the next middleware/route handler
    next();
  } catch (error) {
    securityLogger.error(`Authentication error: ${error.message}`);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: false,
        message: 'Session expired. Please log in again.'
      });
    }
    
    return res.status(401).json({
      status: false,
      message: 'Invalid token.'
    });
  }
};

module.exports = authenticate;
