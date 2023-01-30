// Imports
const express = require('express');
const userCtrl = require('../controllers/user');

// Create separate routers for each main route in the app
const router = express.Router();

// Routes
router.post('/signup', userCtrl.signup);
router.post('/login', userCtrl.login);

// Export routes
module.exports = router;