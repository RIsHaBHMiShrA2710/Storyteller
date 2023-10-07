const jwt = require('jsonwebtoken');

const isAuthenticated = (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  console.log(token);
  jwt.verify(token, 'your-secret-key', (err, user) => {
    if (err) {
      console.log(err);
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user; // Set the authenticated user in the request object
    next();
  });
};

module.exports = isAuthenticated;