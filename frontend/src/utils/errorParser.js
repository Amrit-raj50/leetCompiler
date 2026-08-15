/**
 * Frontend Error Parser & Diagnostic Helper
 * Parses server errors and network exceptions into structured human-readable cards.
 */

export const parseFrontendError = (error, language = 'javascript', userCode = '') => {
  if (!error) return null;

  // 1. Axios HTTP Errors
  if (error.response) {
    const status = error.response.status;
    const serverData = error.response.data || {};

    if (serverData.diagnostics) {
      return serverData.diagnostics;
    }

    if (status === 404) {
      return {
        type: 'Endpoint Route 404',
        category: 'Network Route Mismatch',
        badgeColor: '#dc2626',
        icon: '🔍',
        message: 'The compiler endpoint requested was not found (404).',
        explanation: 'The frontend tried to reach an API URL that does not match the server routes.',
        suggestions: [
          'Verify that your frontend .env has `VITE_COMPILER_API_URL=https://leetcompiler.onrender.com/api/compiler`.',
          'Make sure the latest backend with `/api/compiler` and `/run` routes is deployed on Render.'
        ],
        raw: `HTTP 404: ${JSON.stringify(serverData)}`
      };
    }

    if (status === 500) {
      return {
        type: 'Compiler Internal Server Error (500)',
        category: 'Server Alert',
        badgeColor: '#dc2626',
        icon: '⚠️',
        message: serverData.error || serverData.message || 'The server encountered an error processing your code execution request.',
        explanation: 'This usually indicates a compilation/sandbox crash or database timeout on the backend.',
        suggestions: [
          'Review your code for invalid memory access, recursion depth, or excessive resource usage.',
          'Check the backend server logs for the full trace.'
        ],
        raw: JSON.stringify(serverData, null, 2)
      };
    }

    if (status === 401 || status === 403) {
      return {
        type: 'Authentication Required (401)',
        category: 'Security Alert',
        badgeColor: '#d97706',
        icon: '🔐',
        message: 'JWT token is missing, expired, or invalid for Integrated Mode.',
        explanation: 'Integrated Mode requires a valid user token to save revision status to MongoDB.',
        suggestions: [
          'Click "Switch Mode / Logout" in the top bar to re-enter a valid token.',
          'Or switch to "Standalone Mode" to execute code freely without credentials.'
        ],
        raw: `HTTP ${status}: ${serverData.error || 'Unauthorized'}`
      };
    }
  }

  // 2. Network offline / Cold start timeout
  if (error.code === 'ECONNABORTED' || error.message?.includes('Network Error') || error.message?.includes('Failed to fetch')) {
    return {
      type: 'Server Connecting / Free Tier Cold Start',
      category: 'Network Connection',
      badgeColor: '#d97706',
      icon: '⏳',
      message: 'Unable to reach the compiler backend server.',
      explanation: 'On free cloud tiers (like Render), inactive servers enter sleep mode and take ~30-50 seconds to spin back up on the first request.',
      suggestions: [
        'Please wait ~30 seconds for the backend instance to spin up, then click "Run" again.',
        'Check if your device has an active internet connection.'
      ],
      raw: error.message || String(error)
    };
  }

  // 3. String / Generic error
  const rawMsg = error.response?.data?.error || error.message || String(error);
  return {
    type: 'Execution Diagnostic',
    category: 'Runtime Notice',
    badgeColor: '#dc2626',
    icon: '🛑',
    message: rawMsg,
    explanation: 'An issue occurred during code execution.',
    suggestions: [
      'Inspect the error details and trace below to fix the issue.',
      'Test your code with smaller inputs in Standalone mode.'
    ],
    raw: rawMsg
  };
};
