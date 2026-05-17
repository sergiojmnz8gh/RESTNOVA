import api from './apiConfig';

export const mesaService = {
    listarTodas: async (): Promise<any[]> => {
        const response = await api.get('/mesas');
        return response.data;
    },

    obtenerPorId: async (id: number): Promise<any> => {
        const response = await api.get(`/mesas/${id}`);
        return response.data;
    },

    crear: async (mesa: any): Promise<any> => {
        const response = await api.post('/mesas', mesa);
        return response.data;
    },

    actualizar: async (id: number, mesa: any): Promise<any> => {
        const response = await api.put(`/mesas/${id}`, mesa);
        return response.data;
    },

    eliminar: async (id: number): Promise<void> => {
        await api.delete(`/mesas/${id}`);
    },


        listarSesionesActivas: async (): Promise<any[]> => {
        const response = await api.get('/sesiones-mesa');
        return response.data;
    },

    abrirSesion: async (mesaId: number, camareroId: number): Promise<any> => {
        const response = await api.post('/sesiones-mesa', { mesaId, camareroId });
        return response.data;
    },

    cerrarSesion: async (sessionId: number): Promise<void> => {
        await api.put(`/sesiones-mesa/${sessionId}/cerrar`);
    },

    validarToken: async (token: string): Promise<any> => {
        const response = await api.get(`/sesiones-mesa/validar/${token}`);
        return response.data;
    },

    obtenerSesionPorToken: async (token: string): Promise<any> => {
        const response = await api.get(`/sesiones-mesa/token/${token}`);
        return response.data;
    }
};
