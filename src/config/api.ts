export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'https://roc-backend.vercel.app/api',
  TIMEOUT: 10000,
  HEADERS: {
    'Content-Type': 'application/json',
  },
};

export const getAuthHeaders = () => {
  const token = localStorage.getItem('roc_token');
  return {
    ...API_CONFIG.HEADERS,
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const getMultipartHeaders = () => {
  const token = localStorage.getItem('roc_token');
  return {
    ...(token && { Authorization: `Bearer ${token}` }),
    // Don't set Content-Type for FormData, let browser handle it
  };
}; 