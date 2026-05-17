import api from './apiConfig';
import type { Product } from '../types/ProductTypes';
import type { Category } from '../types/CategoryTypes';

export const productoService = {
    listarTodos: async (): Promise<Product[]> => {
        const response = await api.get('/productos');
        return response.data;
    },

    listarPorCategoria: async (categoriaId: number): Promise<Product[]> => {
        const response = await api.get(`/productos/categoria/${categoriaId}`);
        return response.data;
    },

    obtenerTop: async (): Promise<Product[]> => {
        const response = await api.get('/productos/top');
        return response.data;
    },

    crear: async (producto: any): Promise<Product> => {
        const response = await api.post('/productos', producto);
        return response.data;
    },

    actualizar: async (id: number, producto: any): Promise<Product> => {
        const response = await api.put(`/productos/${id}`, producto);
        return response.data;
    },

    eliminar: async (id: number): Promise<void> => {
        await api.delete(`/productos/${id}`);
    },

    
    listarCategorias: async (): Promise<Category[]> => {
        const response = await api.get('/categorias');
        return response.data;
    },

    crearCategoria: async (categoria: any): Promise<Category> => {
        const response = await api.post('/categorias', categoria);
        return response.data;
    },

    actualizarCategoria: async (id: number, categoria: any): Promise<Category> => {
        const response = await api.put(`/categorias/${id}`, categoria);
        return response.data;
    },

    eliminarCategoria: async (id: number): Promise<void> => {
        await api.delete(`/categorias/${id}`);
    }
};
