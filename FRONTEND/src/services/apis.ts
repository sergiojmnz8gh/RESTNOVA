const BASE_URL = 'http://localhost:8080/api';

export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: `${BASE_URL}/auth/login`,
        REGISTER: `${BASE_URL}/auth/registro`,
    },
    CATEGORIAS: `${BASE_URL}/categorias`,
    MESAS: `${BASE_URL}/mesas`,
    PAGOS: `${BASE_URL}/pagos`,
    PEDIDOS: `${BASE_URL}/pedidos`,
    PRODUCTOS: `${BASE_URL}/productos`,
    RESERVAS: `${BASE_URL}/reservas`,
    SESIONES_MESA: `${BASE_URL}/sesiones-mesa`,
    USUARIOS: `${BASE_URL}/usuarios`,
};
