// services/azureSpeechService.js

import sdk from 'microsoft-cognitiveservices-speech-sdk';
import config from '../config.js';
import fs from 'fs';
import path from 'path';

/**
 * Synthesizes speech from text using Azure Cognitive Services.
 * @param {string} text - The text to synthesize.
 * @returns {Promise<string>} - The URL or path to the synthesized audio file.
 */
export async function synthesizeSpeech(text) {
  return new Promise((resolve, reject) => {
    const speechConfig = sdk.SpeechConfig.fromSubscription(
      config.azure.speechKey,
      config.azure.speechRegion
    );

    // Choose an appropriate voice for Daisy
    const voiceName = 'en-US-LolaMultilingualNeural'; // You can try 'en-US-ElizabethNeural' or another suitable voice. en-US-RyanMultilingualNeural for 30 year old male; en-US-AvaMultilingualNeural for 8 year old girl

    speechConfig.speechSynthesisVoiceName = voiceName;
    speechConfig.speechSynthesisOutputFormat =
      sdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3;

    const fileName = `output_${Date.now()}.mp3`;
    const audioDir = path.join('public', 'audio');
    const filePath = path.join(audioDir, fileName);

    // Ensure the audio directory exists
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true });
    }

    const audioConfig = sdk.AudioConfig.fromAudioFileOutput(filePath);
    const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

    // Adjust pitch and rate to simulate an older voice
    const ssml = `<speak version="1.0" xml:lang="en-US">
      <voice name="${voiceName}">
        <prosody pitch="0%" rate="0%">
          ${text}
        </prosody>
      </voice>
    </speak>`;

    synthesizer.speakSsmlAsync(
      ssml,
      (result) => {
        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
          console.log('Speech synthesized for text:', text);
          resolve(`/audio/${fileName}`);
        } else {
          console.error('Speech synthesis canceled:', result.errorDetails);
          reject(result.errorDetails);
        }
        synthesizer.close();
      },
      (error) => {
        console.error('Error synthesizing speech:', error);
        synthesizer.close();
        reject(error);
      }
    );
  });
}