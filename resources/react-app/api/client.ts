import axios from 'axios';

const api = axios.create({
  baseURL: '/',
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect if we get a 401 and we aren't already on the login page or trying to fetch the user
    if (error.response?.status === 401) {
      if (window.location.pathname !== '/login' && error.config.url !== '/api/auth/me') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
