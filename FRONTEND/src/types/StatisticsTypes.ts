export interface ProductoRanking {
    nombre: string;
    cantidad: number;
}

export interface StatisticsData {
    totalVentasMensual?: number;
    ticketMedio?: number;
    ventasPorDia?: Record<string, number>;
    ventasPorCategoria?: Record<string, number>;
    topProductos: ProductoRanking[];
    totalPedidosMensual: number;
    ocupacionMedia: number;
}

