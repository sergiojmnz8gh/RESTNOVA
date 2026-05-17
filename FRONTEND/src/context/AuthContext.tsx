import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, LoginRequest, RegisterRequest, TokenResponse, AuthContextType } from '../types/AuthTypes';
import { authService } from '../services/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    
    useEffect(() => {
        const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token');
        const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');

        if (storedToken && storedUser) {
            try {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            } catch (error) {
                
                localStorage.clear();
                sessionStorage.clear();
            }
        }
        setLoading(false);
    }, []);

    const mapUsuarioToUser = (usuario: any): User => ({
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.rolNombre,
        imagenUrl: usuario.imagenUrl,
        puntosAcumulados: usuario.puntosAcumulados
    });

    const login = async (credentials: LoginRequest, rememberMe: boolean) => {
        try {
            const response: TokenResponse = await authService.login(credentials);
            const { token, usuario } = response;

            const userData = mapUsuarioToUser(usuario);

            setToken(token);
            setUser(userData);

            const storage = rememberMe ? localStorage : sessionStorage;
            storage.setItem('token', token);
            storage.setItem('user', JSON.stringify(userData));
            
            if (rememberMe) {
                localStorage.setItem('rememberedEmail', credentials.email);
            } else {
                localStorage.removeItem('rememberedEmail');
            }
        } catch (error) {
            throw error;
        }
    };

    const loginWithGoogle = async (credential: string) => {
        try {
            const response: TokenResponse = await authService.googleLogin(credential);
            const { token, usuario } = response;

            const userData = mapUsuarioToUser(usuario);

            setToken(token);
            setUser(userData);

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
        } catch (error) {
            throw error;
        }
    };

    const register = async (data: RegisterRequest) => {
        try {
            const response: TokenResponse = await authService.register(data);
            const { token, usuario } = response;

            const userData = mapUsuarioToUser(usuario);

            setToken(token);
            setUser(userData);

            
            sessionStorage.setItem('token', token);
            sessionStorage.setItem('user', JSON.stringify(userData));
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
    };

    const updateUser = (usuarioData: any) => {
        const userData = mapUsuarioToUser(usuarioData);
        setUser(userData);
        
        
        if (localStorage.getItem('user')) {
            localStorage.setItem('user', JSON.stringify(userData));
        } else if (sessionStorage.getItem('user')) {
            sessionStorage.setItem('user', JSON.stringify(userData));
        }
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            token, 
            isAuthenticated: !!token, 
            login, 
            loginWithGoogle, 
            register, 
            logout, 
            updateUser,
            loading 
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};

