// utils/helperFunctions.js

function calculateScammerPatience(state) {
    // Example function to calculate scammer patience level
    return state.scammerPatience - state.warningSignsDetected * 10;
  }
  
  module.exports = {
    calculateScammerPatience,
  };
  