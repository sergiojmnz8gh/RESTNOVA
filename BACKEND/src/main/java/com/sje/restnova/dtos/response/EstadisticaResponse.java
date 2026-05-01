package com.sje.restnova.dtos.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class EstadisticaResponse {
    // Reporte para Admin (Financiero)
    private BigDecimal totalVentasMensual;
    private BigDecimal ticketMedio;
    private Map<String, BigDecimal> ventasPorDia; // Fecha -> Total
    private Map<String, BigDecimal> ventasPorCategoria; // Categoria -> Total

    // Reporte para Personal y Admin (Operacional)
    private List<ProductoRanking> topProductos;
    private Long totalPedidosMensual;
    private Double ocupacionMedia;

    @Data
    @Builder
    public static class ProductoRanking {
        private String nombre;
        private Long cantidad;
    }
}
