const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user');
const User = require('../models/user');
const checkAuth = require('../middleware/check-auth');

// Signup Route
router.post('/signup', UserController.user_signup);

// Login Route
router.post('/login', UserController.user_login);

// Delete User Route
router.delete('/:userID', checkAuth, UserController.user_delete);

module.exports = router;
