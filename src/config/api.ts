export const API_CONFIG = {
  BASE_URL: ' http://localhost:5000/api',
  TIMEOUT: 10000,
  HEADERS: {
    'Content-Type': 'application/json',
  },
};

export const getAuthHeaders = () => {
  const token = localStorage.getItem('roc_token');
  console.log('🔑 Auth token exists:', !!token);
  if (token) {
    console.log('🔑 Auth token (first 20 chars):', token.substring(0, 20) + '...');
  }
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