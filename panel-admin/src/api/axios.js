import axios from 'axios';

const api = axios.create({
    baseURL: 'http://sib.swueb.net/api', // Tu Backend Laravel
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Interceptor: Si ya iniciamos sesión, enviamos el token automáticamente
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;