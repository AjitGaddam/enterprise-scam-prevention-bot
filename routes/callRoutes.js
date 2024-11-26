// routes/callRoutes.js
const express = require('express');
const router = express.Router();
const twilioService = require('../services/twilioService');

router.post('/incoming-call', twilioService.handleIncomingCall);
router.post('/process-speech', twilioService.processSpeech);

module.exports = router;