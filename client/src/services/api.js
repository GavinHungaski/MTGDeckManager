import axios from 'axios';

// Use relative URL in production (same origin) or VITE_API_URL in development
const API_URL = import.meta.env.VITE_API_URL || '';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor - add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear storage and redirect to login
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/api/auth/register', userData),
  login: (credentials) => api.post('/api/auth/login', credentials),
  logout: () => api.post('/api/auth/logout'),
  getCurrentUser: () => api.get('/api/auth/me'),
};

// Deck API
export const deckAPI = {
  getAll: () => api.get('/api/decks'),
  getById: (id) => api.get(`/api/decks/${id}`),
  create: (deckData) => api.post('/api/decks', deckData),
  update: (id, updates) => api.patch(`/api/decks/${id}`, updates),
  delete: (id) => api.delete(`/api/decks/${id}`),
};

// Card API
export const cardAPI = {
  add: (deckId, cardData) => api.post(`/api/cards/decks/${deckId}/card`, cardData),
  addBatch: (deckId, cardsData) => api.post(`/api/cards/decks/${deckId}/cards/batch`, { cards: cardsData }, { timeout: 60000 }),
  remove: (deckId, cardId) => api.delete(`/api/cards/decks/${deckId}/card/${cardId}`),
  toggleCommander: (deckId, cardId) => 
    api.patch(`/api/cards/decks/${deckId}/card/${cardId}/commander`),
  updateCount: (deckId, cardId, count) => 
    api.put(`/api/cards/decks/${deckId}/card/${cardId}/count`, { count }),
  minimizePrices: (deckId, updates) =>
    api.patch(`/api/cards/decks/${deckId}/prices/batch`, { updates }),
};

// Health check
export const healthAPI = {
  check: () => api.get('/health'),
};

export default api;
