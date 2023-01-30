// Imports
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Regular expression which checks if an email is valid
const emailRegExp = new RegExp('[a-z0-9]+@[a-z]+\.[a-z]{2,3}');
// Regular expression limiting to letters and numbers a password
const passwordRegExp = new RegExp(/^[a-zA-Z0-9]*$/);

// Exports routes' business logic

// Allow an user to sign up
exports.signup = (req, res, next) => {
    // Check if the email is valid
    if (!emailRegExp.test(req.body.email)) {
        return res.status(401).json({ error: new Error('Invalid email!') });
    }
    // Check if the password is only made up of letters and numbers
    if (!passwordRegExp.test(req.body.password)) {
        return res.status(401).json({ error: new Error('Only letters and numbers are allowed!') });
    }
    // Call bcrypt hash function on the password and salt the password 12 times
    bcrypt.hash(req.body.password, 12).then((hash) => {
        // Create a new user based on the data schema
        const user = new User({
            email: req.body.email,
            password: hash
        });
        // Save the new user to the MongoDB database
        user.save().then(() => {
            res.status(201).json({ message: 'User added successfully!' });
        })
            .catch((error) => {
                res.status(500).json({ error: error });
            });
    });
};

// Allow an user to login
exports.login = (req, res, next) => {
    // Find and get a specified user from the database
    User.findOne({ email: req.body.email }).then((user) => {
        if (!user) {
            return res.status(401).json({ error: new Error('User not found in the database!') });
        }
        // Call bcrypt compare function to compare the user-entered password with the hash saved in the mongoDB database
        bcrypt.compare(req.body.password, user.password).then((valid) => {
            if (!valid) {
                return res.status(401).json({ error: new Error('Incorrect password!') });
            }
            // Call JWT sign function to encode a new token
            const token = jwt.sign({ userId: user._id }, 'SECRET_TOKEN', { expiresIn: '12h' });
            res.status(200).json({ userId: user._id, token: token });
        })
            .catch((error) => {
                res.status(500).json({ error: error });
            });
    })
        .catch((error) => {
            res.status(500).json({ error: error });
        });
};