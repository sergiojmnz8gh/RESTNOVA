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
        imagenUrl?: string;
        puntosAcumulados?: number;
    };
}

export interface User {
    id: number;
    email: string;
    nombre: string;
    rol: string;
    apellidos?: string;
    telefono?: string;
    imagenUrl?: string;
    puntosAcumulados?: number;
}

export interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (credentials: LoginRequest, rememberMe: boolean) => Promise<void>;
    loginWithGoogle: (credential: string) => Promise<void>;
    register: (data: RegisterRequest) => Promise<void>;
    logout: () => void;
    updateUser: (usuarioData: any) => void;
    loading: boolean;
}

