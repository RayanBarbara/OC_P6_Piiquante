// Imports
const Sauce = require('../models/sauce');
const fs = require('fs');

// Exports routes' business logic

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
    if (req.file) {
        Sauce.findOne({ _id: req.params.id })
            .then(sauce => {
                const filename = sauce.imageUrl.split('/images/')[1];
                console.log(sauce.imageUrl);
                fs.unlinkSync('images/' + filename);
            })
            .catch((error) => {
                res.status(400).json({ error: error });
            })
    };
    const sauceObj = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    }
        : { ...req.body };
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
    if (req.body.like === 1) {
        Sauce.updateOne({ _id: req.params.id }, { $push: { usersLiked: req.body.userId }, $inc: { likes: 1 } })
            .then(() => {
                res.status(200).json({ message: 'Sauce liked successfully!' });
            })
            .catch((error) => {
                res.status(400).json({ error: error });
            });
    } else if (req.body.like === -1) {
        Sauce.updateOne({ _id: req.params.id }, { $push: { usersDisliked: req.body.userId }, $inc: { dislikes: 1 } })
            .then(() => {
                res.status(200).json({ message: 'Sauce disliked successfully!' });
            })
            .catch((error) => {
                res.status(400).json({ error: error });
            });
    } else {
        Sauce.findOne({ _id: req.params.id })
            .then((sauce) => {
                if (sauce.usersLiked.includes(req.body.userId)) {
                    Sauce.updateOne({ _id: req.params.id }, { $pull: { usersLiked: req.body.userId }, $inc: { likes: -1 } })
                        .then(() => {
                            res.status(200).json({ message: 'Like removed successfully!' });
                        })
                        .catch((error) => {
                            res.status(400).json({ error: error });
                        });
                } else {
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