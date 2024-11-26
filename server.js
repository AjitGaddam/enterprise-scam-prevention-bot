// server.js

import express from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import config from './config.js';

// Import the Twilio service handlers
import {
  handleIncomingCall,
  processSpeech,
  handleNoInput,
  handleCallStatus, // New handler
} from './services/twilioService.js';

// Create an instance of Express
const app = express();

// Use body-parser middleware to parse incoming request bodies
app.use(bodyParser.urlencoded({ extended: false }));

// Use session middleware
app.use(
  session({
    secret: 'your-secret-key', // Replace with a secure key
    resave: false,
    saveUninitialized: true,
  })
);

// Serve static files
app.use(express.static('public'));

// Routes
app.post('/handle_incoming_call', handleIncomingCall);
app.post('/process_speech', processSpeech);
app.post('/no_input', handleNoInput);
app.post('/call_status', handleCallStatus); // New route

// Start the server
const PORT = config.port || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});