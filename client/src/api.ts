// /client/src/api.ts
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api', // Adjust to your Laravel URL
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
});

// Automatically attach the token to every request if it exists
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;