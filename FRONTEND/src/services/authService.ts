import axios from 'axios';
import type { LoginRequest, TokenResponse } from '../types/AuthTypes';
import { API_ENDPOINTS } from './apis';

/**
 * Service to handle all authentication related operations.
 */
export const authService = {
    /**
     * Performs a login request.
     */
    login: async (credentials: LoginRequest): Promise<TokenResponse> => {
        try {
            const response = await axios.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
            return response.data;
        } catch (error) {
            console.error('Error in login service:', error);
            throw error;
        }
    },

    /**
     * Performs a registration request.
     */
    register: async (data: RegisterRequest): Promise<TokenResponse> => {
        try {
            const response = await axios.post(API_ENDPOINTS.AUTH.REGISTER, data);
            return response.data;
        } catch (error) {
            console.error('Error in register service:', error);
            throw error;
        }
    },

    /**
     * Helper to parse JWT (basic implementation)
     */
    parseToken: (token: string) => {
        try {
            return JSON.parse(atob(token.split('.')[1]));
        } catch (e) {
            return null;
        }
    }
};
