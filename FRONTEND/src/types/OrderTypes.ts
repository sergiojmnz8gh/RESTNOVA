import type { Product } from './ProductTypes';

export interface OrderDetail {
    id: number;
    producto: Product;
    productoNombre: string; 
    cantidad: number;
    precioUnitario: number;
}

export interface Order {
    id: number;
    numeroMesa: string;
    mesaId: number;
    sesionMesaId: number;
    usuarioNombre?: string;
    usuarioEmail?: string;
    fechaHora: string;
    estado: OrderStatus;
    total: number;
    detalles: OrderDetail[];
}

export type OrderStatus = 'PENDIENTE' | 'EN_PREPARACION' | 'LISTO_PARA_SERVIR' | 'SERVIDO' | 'CANCELADO';

