// U: mongodb+srv://barbaraRayan:<password>@cluster0.qrecskw.mongodb.net/?retryWrites=true&w=majority
// PW: barbaraDatabase001
const express = require('express');
const mongoose = require('mongoose');
const app = express();

mongoose.connect('mongodb+srv://barbaraRayan:barbaraDatabase001@cluster0.qrecskw.mongodb.net/?retryWrites=true&w=majority')
  .then(() => {
    console.log('Successfully connected to MongoDB Atlas!');
  })
  .catch((error) => {
    console.log('Unable to connect to MongoDB Atlas!');
    console.error(error);
  });

app.use((req, res) => {
   res.json({ message: 'Your 4th request was successful!' }); 
});



module.exports = app;