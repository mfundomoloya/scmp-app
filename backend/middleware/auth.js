const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {
  const token = req.header('x-auth-token');
    if (!token) {
      console.error('Auth middleware: No token provided');
      return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
      console.log('Auth middleware: Raw token:', token.substring(0, 10) + '...');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Auth middleware: Decoded token:', JSON.stringify(decoded, null, 2));
      req.user = decoded.user || decoded;
      console.log('Auth middleware: Set req.user:', JSON.stringify(req.user, null, 2));
      if (!req.user.id) {
        console.error('Auth middleware: Missing user ID in token');
        return res.status(401).json({ msg: 'Invalid token structure: missing user ID' });
      }
      if (!/^[0-9a-fA-F]{24}$/.test(req.user.id)) {
        console.error('Auth middleware: Invalid user ID format:', req.user.id);
        return res.status(401).json({ msg: 'Invalid user ID format in token' });
      }
      next();
    } catch (err) {
      console.error('Auth middleware error:', {
        message: err.message,
        token: token.substring(0, 10) + '...',
      });
      res.status(401).json({ msg: 'Token is not valid' });
    }
};