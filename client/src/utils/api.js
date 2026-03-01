// ============================================================
//  api.js — Pre-configured axios instance
//  Dev:  proxied to localhost:5000 via Vite
//  Prod: uses VITE_API_URL env variable (set in Vercel)
// ============================================================

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  withCredentials: true,
});

export default api;
