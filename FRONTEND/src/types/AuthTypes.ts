export interface LoginRequest {
    email: string;
    password?: string;
}

export interface RegisterRequest {
    email: string;
    password?: string;
    nombre: string;
    apellidos?: string;
    telefono?: string;
    rolNombre: string;
}

export interface TokenResponse {
    token: string;
    usuario: {
        id: number;
        email: string;
        nombre: string;
        rolNombre: string;
    };
}

export interface User {
    id: number;
    email: string;
    nombre: string;
    rol: string;
}

export interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (credentials: LoginRequest, rememberMe: boolean) => Promise<void>;
    register: (data: RegisterRequest) => Promise<void>;
    logout: () => void;
    loading: boolean;
}
