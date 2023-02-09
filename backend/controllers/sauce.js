// Imports
const Sauce = require('../models/sauce');
const fs = require('fs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Get all sauces from the database
exports.getAllSauces = (req, res, next) => {
    // Find and get all sauces from the database
    Sauce.find()
        .then((sauces) => {
            res.status(200).json(sauces);
        }).catch((error) => {
            res.status(400).json({ error: error });
        });
};

// Get one particular sauce from the database
exports.getOneSauce = (req, res, next) => {
    // Find and get a specified sauce from the database
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            res.status(200).json(sauce);
        })
        .catch((error) => {
            res.status(404).json({ error: error });
        });
};

// Create a sauce
exports.createSauce = (req, res, next) => {
    // Parse into JSON format the form-data request sent by the front-end
    const sauceObj = JSON.parse(req.body.sauce);
    // Delete Mongoose's default ID
    delete sauceObj._id;
    // Create a new sauce based on the data schema 
    const sauce = new Sauce({
        // Get request's body
        ...sauceObj,
        // Reconstruct the full URL of the picture file
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: []
    });
    // Save the new sauce to the MongoDB database
    sauce.save()
        .then(() => {
            res.status(201).json({ message: 'Sauce registered successfully!' });
        })
        .catch((error) => {
            res.status(400).json({ error: error });
        });
};

// Modify a sauce
exports.updateSauce = (req, res, next) => {
    // Check if there is a file in the request
    if (req.file) {
        // Use the ID as a parameter to access the corresponding sauce in the database
        Sauce.findOne({ _id: req.params.id })
            .then((sauce) => {
                // Separate the picture's filename
                const filename = sauce.imageUrl.split('/images/')[1];
                // Call fs unlinkSync function to delete the picture from the images folders
                fs.unlinkSync('images/' + filename);
            })
            .catch((error) => {
                res.status(400).json({ error: error });
            })
    };
    // Check if the request sent a new picture
    const sauceObj = req.file ? {
        // Get and parse into JSON format the form-data (picture) request's body sent by the front-end
        ...JSON.parse(req.body.sauce),
        // Add sauce new picture
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    }
        // Get request's body without parsing it in case there is no new picture
        : { ...req.body };
    // Use the ID as a parameter to access and update the corresponding sauce in the database
    Sauce.updateOne({ _id: req.params.id }, { ...sauceObj, _id: req.params.id })
        .then(() => {
            res.status(200).json({ message: 'Sauce updated successfully!' });
        })
        .catch((error) => {
            res.status(400).json({ error: error });
        });
};

// Delete a sauce
exports.deleteSauce = (req, res, next) => {
    // Use the ID as a parameter to access the corresponding sauce in the database
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            // Separate the file name
            const filename = sauce.imageUrl.split('/images/')[1];
            // Call fs unlink function to delete the picture file
            fs.unlink('images/' + filename, () => {
                // Delete the corresponding sauce in the database
                Sauce.deleteOne({ _id: req.params.id })
                    .then(() => {
                        res.status(200).json({ message: 'Sauce deleted successfully!' });
                    })
                    .catch((error) => {
                        res.status(400).json({ error: error });
                    })
            });
        })
        .catch((error) => {
            res.status(400).json({ error: error });
        });
};

// Rate a sauce
exports.rateSauce = (req, res, next) => {
    // Check if the number of like/dislike in the request are correct
    if (req.body.like > 1 || req.body.like < -1) {
        res.status(400).json({ message: 'The number of dislike/like are not correct!' });
    }
    // Check if the user liked the sauce
    if (req.body.like === 1) {
        Sauce.findOne({ _id: req.params.id })
            .then((sauce) => {
                // Get the user token from the request headers
                const token = req.headers.authorization.split(' ')[1];
                let bool = false;
                // Check if the user did not already liked this sauce by looping trough usersLiked array
                for (let i = 0; i < sauce.usersLiked.length; i++) {
                    if (sauce.usersLiked[i] === jwt.verify(token, process.env.TOKEN).userId) {
                        bool = true;
                        break;
                    } else {
                        bool = false;
                    }
                }
                if (bool) {
                    res.status(400).json({ message: 'The user already liked this sauce!' });
                } else {
                    // Use the ID as a parameter to access and update the corresponding sauce in the database
                    Sauce.updateOne({ _id: req.params.id }, { $push: { usersLiked: req.body.userId }, $inc: { likes: 1 } })
                        .then(() => {
                            res.status(200).json({ message: 'Sauce liked successfully!' });
                        })
                        .catch((error) => {
                            res.status(400).json({ error: error });
                        });
                }
            })
            .catch((error) => {
                res.status(400).json({ error: error });
            });
    }
    // Check if the user disliked the sauce
    else if (req.body.like === -1) {
        Sauce.findOne({ _id: req.params.id })
            .then((sauce) => {
                // Get the user token from the request headers
                const token = req.headers.authorization.split(' ')[1];
                let bool = false;
                // Check if the user did not already disliked this sauce by looping trough usersDisliked array
                for (let i = 0; i < sauce.usersDisliked.length; i++) {
                    if (sauce.usersDisliked[i] === jwt.verify(token, process.env.TOKEN).userId) {
                        bool = true;
                        break;
                    } else {
                        bool = false;
                    }
                }
                if (bool) {
                    res.status(400).json({ message: 'The user already disliked this sauce!' });
                } else {
                    // Use the ID as a parameter to access and update the corresponding sauce in the database
                    Sauce.updateOne({ _id: req.params.id }, { $push: { usersDisliked: req.body.userId }, $inc: { dislikes: 1 } })
                        .then(() => {
                            res.status(200).json({ message: 'Sauce disliked successfully!' });
                        })
                        .catch((error) => {
                            res.status(400).json({ error: error });
                        });
                }
            })
            .catch((error) => {
                res.status(400).json({ error: error });
            });
    }
    // Check if the user took back his like or dislike
    else {
        // Use the ID as a parameter to access the corresponding sauce in the database
        Sauce.findOne({ _id: req.params.id })
            .then((sauce) => {
                // Check if the user took back his like
                if (sauce.usersLiked.includes(req.body.userId)) {
                    // Use the ID as a parameter to access and update the corresponding sauce in the database
                    Sauce.updateOne({ _id: req.params.id }, { $pull: { usersLiked: req.body.userId }, $inc: { likes: -1 } })
                        .then(() => {
                            res.status(200).json({ message: 'Like removed successfully!' });
                        })
                        .catch((error) => {
                            res.status(400).json({ error: error });
                        });
                }
                // Check if the user took back his dislike
                else {
                    // Use the ID as a parameter to access and update the corresponding sauce in the database
                    Sauce.updateOne({ _id: req.params.id }, { $pull: { usersDisliked: req.body.userId }, $inc: { dislikes: -1 } })
                        .then(() => {
                            res.status(200).json({ message: 'Dislike removed successfully!' });
                        })
                        .catch((error) => {
                            res.status(400).json({ error: error });
                        });
                }
            })
            .catch((error) => {
                res.status(400).json({ error: error });
            });
    }
};