import axios from 'axios';

// Smart URL resolver: Automatically targets production Render backend on deployed sites (e.g. Vercel)
const getBaseApiUrl = () => {
  let url = import.meta.env.VITE_COMPILER_API_URL;

  // If on a remote deployment (e.g. *.vercel.app) or no env provided, default to live cloud backend
  const isBrowser = typeof window !== 'undefined';
  const isLocalHost = isBrowser && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  );

  if (!url || (!isLocalHost && url.includes('localhost'))) {
    if (!isLocalHost) {
      url = 'https://leetcompiler.onrender.com/api/compiler';
    } else {
      url = url || 'http://localhost:5001/api/compiler';
    }
  }

  url = url.trim().replace(/\/+$/, '');
  if (!url.endsWith('/api/compiler') && !url.endsWith('/api')) {
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
