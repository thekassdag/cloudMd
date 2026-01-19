import { API_CONFIG } from '../config/api';

const getAuthToken = () => {
    return localStorage.getItem('token');
};

const apiFetch = async (endpoint, options = {}) => {
    const token = getAuthToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
            // Unauthorized or Forbidden, token is invalid or expired
            localStorage.removeItem('token');
            window.location.href = '/auth/login'; // Force reload and redirect
        }
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || 'An API error occurred');
    }

    if (response.status === 204) { // No Content
        return null;
    }

    return response.json();
};

export default apiFetch;
