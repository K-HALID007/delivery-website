import axios from 'axios';
import { API_URL } from '../../services/api.config.js';

const api = axios.create({
  baseURL: '${API_URL}', // Update if needed
  withCredentials: true,
});

export default api;
