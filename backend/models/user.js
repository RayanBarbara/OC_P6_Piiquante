// Imports
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

// Create an user data schema for the MongoDB database
const userSchema = mongoose.Schema({
    // Email is an unique identifier for the user
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

// Ensure that no two users can share the same email address
userSchema.plugin(uniqueValidator);

// Export User data schema
module.exports = mongoose.model('User', userSchema);