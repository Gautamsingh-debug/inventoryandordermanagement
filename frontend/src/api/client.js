import axios from 'axios';

let rawBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
if (rawBaseUrl.includes('railway.app') && rawBaseUrl.startsWith('http://')) {
  rawBaseUrl = rawBaseUrl.replace('http://', 'https://');
}
const API_BASE_URL = rawBaseUrl.replace(/\/+$/, '');

const client = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Response interceptor for error handling
client.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.detail || error.message || 'An unexpected error occurred';
    return Promise.reject({ message, status: error.response?.status });
  }
);

export default client;
