// Imports
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Export authenticator
module.exports = (req, res, next) => {
  try {
    // Extract the token from the incoming request's Authorization header
    const token = req.headers.authorization.split(' ')[1];
    // Call JWT verify function to decode the token
    const decodedToken = jwt.verify(token, process.env.TOKEN);
    // Extract the user ID from the token
    const userId = decodedToken.userId;
    // Compare user ID from the request's body with the one previously extracted
    if (req.body.userId && req.body.userId !== userId) {
      throw 'Invalid user ID';
    } else {
      // Pass execution along
      next();
    }
  } catch {
    res.status(401).json({
      error: new Error('Invalid request!')
    });
  }
};