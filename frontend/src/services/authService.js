

import apiFetch from './api';
import { API_CONFIG } from '../config/api';

export const authService = {
    getCurrentUser: async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            return null;
        }
        try {
            const user = await apiFetch(API_CONFIG.ENDPOINTS.AUTH.CURRENT_USER);
            if (user) {
                user.avatar = `https://ui-avatars.com/api/?name=${user.name.replace(' ', '+')}&background=0D8ABC&color=fff`;
            }
            return user;
        } catch (error) {
            console.error('Failed to fetch current user', error);
            localStorage.removeItem('token');
            return null;
        }
    },

    login: async (email, password) => {
        const data = await apiFetch(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        if (data.token) {
            localStorage.setItem('token', data.token);
        }
        return data;
    },

    signup: async (name, email, password) => {
        const data = await apiFetch(API_CONFIG.ENDPOINTS.AUTH.REGISTER, {
            method: 'POST',
            body: JSON.stringify({ name, email, password }),
        });
        return data;
    },

    logout: async () => {
        localStorage.removeItem('token');
    }
};
