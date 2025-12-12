import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json'
  }
});

const storedToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

if (storedToken) {
  apiClient.defaults.headers.common.Authorization = `Bearer ${storedToken}`;
}

apiClient.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function setAuthToken(token?: string) {
  if (token) {
    localStorage.setItem('auth_token', token);
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    localStorage.removeItem('auth_token');
    delete apiClient.defaults.headers.common.Authorization;
  }
}
