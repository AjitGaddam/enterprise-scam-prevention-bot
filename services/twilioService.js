// services/twilioService.js

import twilio from 'twilio';
import config from '../config.js';
import { generateCharacterResponse } from './gpt4Service.js';
import { synthesizeSpeech } from './azureSpeechService.js';
import ConversationState from './conversationState.js';

// Initialize Twilio client
const accountSid = config.twilio.accountSid;
const authToken = config.twilio.authToken;
const client = twilio(accountSid, authToken);

// Import VoiceResponse from Twilio
const { VoiceResponse } = twilio.twiml;

/**
 * Handles incoming calls to your Twilio number.
 */
export async function handleIncomingCall(req, res) {
  const twiml = new VoiceResponse();

  try {
    // Extract CallSid and From number
    const callSid = req.body.CallSid;
    const callerNumber = req.body.From;

    // Map CallSid to Caller Number
    ConversationState.mapCallSidToCallerNumber(callSid, callerNumber);

    // Synthesize AI Granny's greeting
    const greetingText =
      "Hi there! This is AI Granny speaking. How can I assist you today?";
    const audioUrl = await synthesizeSpeech(greetingText);

    // Play the synthesized greeting and gather input
    const gather = twiml.gather({
      input: 'speech',
      action: '/process_speech',
      method: 'POST',
      timeout: 10,
      language: 'en-US',
      speechTimeout: 'auto',
      profanityFilter: false,
    });

    gather.play(audioUrl);

    // If no speech input is received, prompt again
    twiml.redirect('/no_input');

    // Send the response back to Twilio
    res.type('text/xml');
    res.send(twiml.toString());
  } catch (error) {
    console.error('Error handling incoming call:', error);

    // Respond with an error message to the caller
    const errorTwiml = new VoiceResponse();
    errorTwiml.say('Sorry, an error occurred. Please try again later.');
    res.type('text/xml');
    res.status(500).send(errorTwiml.toString());
  }
}

/**
 * Handles cases where no input is received.
 */
export async function handleNoInput(req, res) {
  const twiml = new VoiceResponse();

  twiml.say("I'm sorry, I didn't hear anything.");
  twiml.pause({ length: 1 });

  // Redirect back to the previous step or end the call after multiple attempts
  const attempts = req.session?.attempts || 0;

  if (attempts < 2) {
    if (req.session) {
      req.session.attempts = attempts + 1;
    }
    twiml.redirect('/handle_incoming_call');
  } else {
    twiml.say('Please call back if you need anything. Goodbye!');
    twiml.hangup();
  }

  res.type('text/xml');
  res.send(twiml.toString());
}

/**
 * Processes the caller's speech input and generates AI Granny's response.
 */
export async function processSpeech(req, res) {
  const callerNumber = req.body.From;
  const callSid = req.body.CallSid; // Extract CallSid
  const userMessage = req.body.SpeechResult;

  try {
    if (!userMessage) {
      // Handle cases where no speech input was received
      const twiml = new VoiceResponse();
      twiml.say("I'm sorry, I didn't catch that. Could you please repeat?");
      twiml.redirect('/handle_incoming_call');

      res.type('text/xml');
      res.send(twiml.toString());
      return;
    }

    // Retrieve the conversation history
    const conversationHistory = await ConversationState.getConversationHistory(
      callerNumber
    );

    // Update conversation history with user's message
    conversationHistory.push({
      role: 'user',
      content: userMessage,
      callSid: callSid, // Track CallSid in history
    });

    // Check for maximum interaction count (e.g., 10 turns)
    if (conversationHistory.length > 20) { // Each turn includes user and assistant
      const twiml = new VoiceResponse();
      twiml.say("It seems like we've been talking for a while. Let's end the call here. Goodbye!");
      twiml.hangup();

      // Clear conversation history
      ConversationState.clearConversationHistory(callerNumber);

      res.type('text/xml');
      res.send(twiml.toString());
      return;
    }

    // Generate AI Granny's response
    const characterResponse = await generateCharacterResponse(conversationHistory);

    // Update conversation history with AI Granny's response
    conversationHistory.push({
      role: 'assistant',
      content: characterResponse,
      callSid: callSid, // Track CallSid in history
    });

    // Save conversation history asynchronously
    ConversationState.saveConversationHistory(callerNumber, conversationHistory);

    // Synthesize AI Granny's response
    const audioUrl = await synthesizeSpeech(characterResponse);

    // Prepare TwiML response
    const twiml = new VoiceResponse();
    const gather = twiml.gather({
      input: 'speech',
      action: '/process_speech',
      method: 'POST',
      timeout: 10,
      language: 'en-US',
      speechTimeout: 'auto',
      profanityFilter: false,
    });

    // Play AI Granny's response
    gather.play(audioUrl);

    // If no speech input is received, prompt again
    twiml.redirect('/no_input');

    // Send the response back to Twilio
    res.type('text/xml');
    res.send(twiml.toString());
  } catch (error) {
    console.error('Error processing speech:', error);

    // Respond with an error message to the caller
    const errorTwiml = new VoiceResponse();
    errorTwiml.say(
      'Sorry, an error occurred while processing your request. Please try again later.'
    );
    errorTwiml.hangup();

    res.type('text/xml');
    res.status(500).send(errorTwiml.toString());
  }
}

/**
 * Handles call status updates from Twilio.
 */
export async function handleCallStatus(req, res) {
  const callSid = req.body.CallSid;
  const callStatus = req.body.CallStatus;

  console.log(`Call SID: ${callSid}, Status: ${callStatus}`);

  // Perform cleanup based on call status
  if (
    callStatus === 'completed' ||
    callStatus === 'failed' ||
    callStatus === 'busy' ||
    callStatus === 'no-answer'
  ) {
    // Retrieve caller number using CallSid
    const callerNumber = ConversationState.getCallerNumberByCallSid(callSid);

    if (callerNumber) {
      // Clear conversation history
      ConversationState.clearConversationHistory(callerNumber);
      console.log(`Cleared conversation history for caller: ${callerNumber}`);
    } else {
      console.log(`No matching conversation history found for Call SID: ${callSid}`);
    }
  }

  // Respond with empty TwiML to acknowledge receipt
  res.type('text/xml');
  res.send('<Response></Response>');
}