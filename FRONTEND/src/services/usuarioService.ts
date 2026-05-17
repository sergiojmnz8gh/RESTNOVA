import api from './apiConfig';

export const usuarioService = {
    listarTodos: async (): Promise<any[]> => {
        const response = await api.get('/usuarios');
        return response.data;
    },

    obtenerPerfil: async (): Promise<any> => {
        const response = await api.get('/usuarios/me');
        return response.data;
    },

    actualizarPerfil: async (datos: any): Promise<any> => {
        const response = await api.put('/usuarios/me', datos);
        return response.data;
    },

    subirImagen: async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/usuarios/me/imagen', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    cambiarPassword: async (datos: any): Promise<void> => {
        await api.post('/usuarios/me/password', datos);
    },

    crearUsuario: async (datos: any): Promise<any> => {
        const response = await api.post('/auth/register', datos);
        return response.data;
    },

    actualizarUsuario: async (id: number, datos: any): Promise<any> => {
        const response = await api.put(`/usuarios/${id}`, datos);
        return response.data;
    },

    eliminarUsuario: async (id: number): Promise<void> => {
        await api.delete(`/usuarios/${id}`);
    }
};
