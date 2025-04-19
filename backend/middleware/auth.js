const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

  try {
    console.log('Verifying token');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    console.log('Token verified:', { user: req.user });
    next();
  } catch (err) {
    console.error('Token verification error:', err);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};