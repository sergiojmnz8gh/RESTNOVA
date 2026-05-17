import api from './apiConfig';
import type { LoginRequest, RegisterRequest, TokenResponse } from '../types/AuthTypes';


export const authService = {

        login: async (credentials: LoginRequest): Promise<TokenResponse> => {
        try {
            const response = await api.post('/auth/login', credentials);
            return response.data;
        } catch (error) {
            console.error('Error in login service:', error);
            throw error;
        }
    },

    googleLogin: async (credential: string): Promise<TokenResponse> => {
        try {
            const response = await api.post('/auth/google', { credential });
            return response.data;
        } catch (error) {
            console.error('Error in google login service:', error);
            throw error;
        }
    },


        register: async (data: RegisterRequest): Promise<TokenResponse> => {
        try {
            const response = await api.post('/auth/registro', data);
            return response.data;
        } catch (error) {
            console.error('Error in register service:', error);
            throw error;
        }
    },


        parseToken: (token: string) => {
        try {
            return JSON.parse(atob(token.split('.')[1]));
        } catch (e) {
            return null;
        }
    }
};

