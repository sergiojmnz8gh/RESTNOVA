package com.sje.restnova.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EstadisticaResponse {
    
    private BigDecimal totalVentasMensual;
    private BigDecimal ticketMedio;
    private Map<String, BigDecimal> ventasPorDia; 
    private Map<String, BigDecimal> ventasPorCategoria; 
    private Map<String, BigDecimal> ventasPorMetodoPago; 

    
    private List<ProductoRanking> topProductos;
    private Long totalPedidosMensual;
    private Double ocupacionMedia;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductoRanking {
        private String nombre;
        private Long cantidad;
    }
}

