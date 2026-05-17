import type { Category } from './CategoryTypes';

export interface Product {
    id: number;
    nombre: string;
    precio: number;
    descripcion: string;
    categoria: Category;
    disponible: boolean;
    imagenUrl?: string;
}

export interface CartItem extends Product {
    cantidad: number;
}

