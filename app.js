// app.js
const express = require('express');
const bodyParser = require('body-parser');
const callRoutes = require('./routes/callRoutes');
const path = require('path');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

// Serve static audio files
app.use('/audio', express.static(path.join(__dirname, 'audio')));

// Routes
app.use('/', callRoutes);

module.exports = app;