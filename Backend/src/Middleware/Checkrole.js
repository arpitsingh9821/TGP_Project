const jwt = require('jsonwebtoken'); // Make sure to import jwt

function checkRole(allowedRoles) {
  return (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(403).json({ message: 'Access denied: No token provided' });
    }

    try {
      // Check if JWT_SECRET is set in environment variables
      if (!process.env.JWT_SECRET) {
        return res.status(500).json({ message: 'Server error: Missing JWT secret key' });
      }

      // Verify JWT token and extract user info
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      // Check if the user's role is allowed to access this route
      if (allowedRoles.includes(req.user.role)) {
        return next();
      } else {
        return res.status(403).json({ message: 'Access denied: Insufficient role permissions' });
      }
    } catch (err) {
      console.error("JWT Verification Error: ", err); // Log error for debugging
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  };
}

module.exports = checkRole;
