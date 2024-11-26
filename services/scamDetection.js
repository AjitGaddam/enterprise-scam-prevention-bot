// services/scamDetection.js
const scamPatterns = require('../data/scamPatterns.json');

function detectScam(transcript) {
  let scores = {
    confidence: 0,
    scamType: null,
    warningSigns: [],
  };

  for (const [type, patterns] of Object.entries(scamPatterns)) {
    // Keyword matching
    const keywordMatches = patterns.keywords.filter(keyword =>
      transcript.toLowerCase().includes(keyword)
    ).length;

    // Regex pattern matching
    const patternMatches = patterns.patterns.filter(pattern =>
      new RegExp(pattern, 'i').test(transcript)
    ).length;

    const typeScore = keywordMatches * 0.3 + patternMatches * 0.7;
    if (typeScore > scores.confidence) {
      scores.confidence = typeScore;
      scores.scamType = type;
    }
  }

  // Additional analysis can be added here

  return scores;
}

module.exports = {
  detectScam,
};
