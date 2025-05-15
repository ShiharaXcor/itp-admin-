// src/utils/axiosConfig.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4001/api', // Update to match your backend
});

export default api;
