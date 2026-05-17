import api from './apiConfig';
import type { Reserva, ReservaRequest } from '../types/ReservationTypes';

export const reservaService = {
    listarTodas: async (): Promise<Reserva[]> => {
        const response = await api.get('/reservas');
        return response.data;
    },

    listarPorUsuario: async (usuarioId: number): Promise<Reserva[]> => {
        const response = await api.get(`/reservas/usuario/${usuarioId}`);
        return response.data;
    },

    crear: async (reserva: ReservaRequest): Promise<Reserva> => {
        const response = await api.post('/reservas', reserva);
        return response.data;
    },

    actualizar: async (id: number, reserva: ReservaRequest): Promise<Reserva> => {
        const response = await api.put(`/reservas/${id}`, reserva);
        return response.data;
    },

    eliminar: async (id: number): Promise<void> => {
        await api.delete(`/reservas/${id}`);
    },

    consultarDisponibilidad: async (fecha: string, numPersonas: number): Promise<string[]> => {
        const response = await api.get('/reservas/disponibilidad', {
            params: { fecha, numPersonas }
        });
        return response.data;
    },

    getDiasOcupados: async (numPersonas: number): Promise<string[]> => {
        const response = await api.get('/reservas/dias-ocupados', {
            params: { numPersonas }
        });
        return response.data;
    },

    obtenerMaxCapacidad: async (): Promise<number> => {
        const response = await api.get('/reservas/max-capacidad');
        return response.data;
    }
};
