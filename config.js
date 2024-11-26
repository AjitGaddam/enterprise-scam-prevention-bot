// config.js

import dotenv from 'dotenv';
dotenv.config();

export default {
  port: process.env.PORT || 3000,
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER,
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-4',
  },
  azure: {
    speechKey: process.env.AZURE_SPEECH_KEY,
    speechRegion: process.env.AZURE_SPEECH_REGION,
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
};