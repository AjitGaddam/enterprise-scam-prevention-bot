// services/conversationState.js

const conversationHistories = {};
const callSidToCallerNumber = {};

/**
 * Retrieves the conversation history for a given caller.
 * @param {string} callerNumber - The caller's phone number.
 * @returns {Promise<Array>} - The conversation history.
 */
async function getConversationHistory(callerNumber) {
  if (!conversationHistories[callerNumber]) {
    conversationHistories[callerNumber] = [];
  }
  return conversationHistories[callerNumber];
}

/**
 * Saves the conversation history for a given caller.
 * @param {string} callerNumber - The caller's phone number.
 * @param {Array} conversationHistory - The conversation history to save.
 */
async function saveConversationHistory(callerNumber, conversationHistory) {
  conversationHistories[callerNumber] = conversationHistory;
}

/**
 * Maps CallSid to Caller Number.
 * @param {string} callSid - The unique identifier for the call.
 * @param {string} callerNumber - The caller's phone number.
 */
function mapCallSidToCallerNumber(callSid, callerNumber) {
  callSidToCallerNumber[callSid] = callerNumber;
}

/**
 * Retrieves Caller Number by CallSid.
 * @param {string} callSid - The unique identifier for the call.
 * @returns {string|null} - The caller's phone number or null if not found.
 */
function getCallerNumberByCallSid(callSid) {
  return callSidToCallerNumber[callSid] || null;
}

/**
 * Clears the conversation history for a given caller.
 * @param {string} callerNumber - The caller's phone number.
 */
function clearConversationHistory(callerNumber) {
  delete conversationHistories[callerNumber];
  // Also remove any CallSid mappings
  for (const [callSid, number] of Object.entries(callSidToCallerNumber)) {
    if (number === callerNumber) {
      delete callSidToCallerNumber[callSid];
    }
  }
}

/**
 * Retrieves all conversation histories.
 * @returns {Object} - All conversation histories.
 */
function getAllConversationHistories() {
  return conversationHistories;
}

export default {
  getConversationHistory,
  saveConversationHistory,
  mapCallSidToCallerNumber,
  getCallerNumberByCallSid,
  clearConversationHistory,
  getAllConversationHistories,
};