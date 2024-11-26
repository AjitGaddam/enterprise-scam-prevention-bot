// testOpenAI.js

import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

async function testOpenAI() {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Hello, how are you?' }],
    });

    console.log('OpenAI response:', response.choices[0].message.content);
  } catch (error) {
    if (error.status) {
      console.error('Error testing OpenAI:', error.status, error.statusText);
      console.error('Error data:', error.data);
    } else {
      console.error('Error testing OpenAI:', error.message);
    }
  }
}

testOpenAI();