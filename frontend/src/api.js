// frontend/src/api.js

import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to attach the JWT token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// --- Authentication Service ---

export const login = (username, password) => {
    // The username parameter here is actually the user's email from the frontend form
    return api.post('/auth/login', { username, password }) 
        .then(response => {
            const token = response.data.token;
            localStorage.setItem('token', token);
            return token;
        });
};

export const signup = (email, password) => {
    return api.post('/auth/signup', { email, password });
};

export const logout = () => {
    localStorage.removeItem('token');
};

// --- Notes Service (Requires JWT) ---

export const getNotes = () => {
    return api.get('/notes');
};

export const createNote = (title, content) => {
    return api.post('/notes', { title, content });
};

export const updateNote = (id, title, content) => {
    return api.put(`/notes/${id}`, { title, content });
};

export const deleteNote = (id) => {
    return api.delete(`/notes/${id}`);
};

export default api;