import api from './apiConfig';

export const pedidoService = {
    listarTodos: async (): Promise<any[]> => {
        const response = await api.get('/pedidos');
        return response.data;
    },

    listarPorUsuario: async (usuarioId: number): Promise<any[]> => {
        const response = await api.get(`/pedidos/usuario/${usuarioId}`);
        return response.data;
    },

    obtenerPorId: async (id: number): Promise<any> => {
        const response = await api.get(`/pedidos/${id}`);
        return response.data;
    },

    crear: async (pedido: any): Promise<any> => {
        const response = await api.post('/pedidos', pedido);
        return response.data;
    },

    actualizarEstado: async (id: number, estado: string): Promise<any> => {
        const response = await api.put(`/pedidos/${id}/estado`, null, {
            params: { status: estado }
        });
        return response.data;
    },

    cancelar: async (id: number): Promise<void> => {
        await api.delete(`/pedidos/${id}`);
    },

    getEstadisticas: async (): Promise<any> => {
        const response = await api.get('/pedidos/estadisticas');
        return response.data;
    },

    getPedidosActivos: async (): Promise<any[]> => {
        const response = await api.get('/pedidos/activos');
        return response.data;
    }
};
