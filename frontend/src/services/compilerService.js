import axios from 'axios';

// Smart URL normalization to handle any trailing slash or base URL variations
const getBaseApiUrl = () => {
  let url = import.meta.env.VITE_COMPILER_API_URL || 'http://localhost:5001/api/compiler';
  url = url.trim().replace(/\/+$/, ''); // Remove trailing slashes
  if (!url.endsWith('/api/compiler')) {
    url = `${url}/api/compiler`;
  }
  return url;
};

const API_URL = getBaseApiUrl();

export const runCodeApi = async ({ code, language, questionSlug = 'two-sum', testCases = [] }) => {
  const token = localStorage.getItem('token') || '';
  
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await axios.post(
    `${API_URL}/run`,
    {
      code,
      language,
      questionSlug,
      testCases,
    },
    { headers }
  );

  return response.data;
};

export const saveCodeApi = async ({
  code,
  language,
  questionSlug = 'scratchpad',
  executionTimeMs,
  memoryMb,
  allPassed,
  notes = '',
}) => {
  const token = localStorage.getItem('token') || '';

  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await axios.post(
    `${API_URL}/save`,
    {
      code,
      language,
      questionSlug,
      executionTimeMs,
      memoryMb,
      allPassed,
      notes,
    },
    { headers }
  );

  return response.data;
};

export const getSavedCodeApi = async (questionSlug) => {
  const token = localStorage.getItem('token') || '';

  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = questionSlug ? `${API_URL}/saved/${questionSlug}` : `${API_URL}/saved`;
  const response = await axios.get(url, { headers });
  return response.data;
};
