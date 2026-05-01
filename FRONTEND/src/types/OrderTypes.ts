import type { Product } from './ProductTypes';

export interface OrderDetail {
    id: number;
    producto: Product;
    productoNombre: string; // Used in some simplified views
    cantidad: number;
    precioUnitario: number;
}

export interface Order {
    id: number;
    numeroMesa: string;
    sesionMesaId: number;
    usuarioNombre?: string;
    usuarioEmail?: string;
    fechaHora: string;
    estado: OrderStatus;
    total: number;
    detalles: OrderDetail[];
}

export type OrderStatus = 'PENDIENTE_PAGO' | 'PAGADO' | 'EN_PREPARACION' | 'LISTO' | 'CANCELADO';
