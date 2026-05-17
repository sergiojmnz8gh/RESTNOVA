package com.sje.restnova.dtos.response;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class PedidoResponse {
    private Integer id;
    private Integer sesionMesaId;
    private Integer mesaId;
    private String usuarioNombre;
    private LocalDateTime fechaHora;
    private String estado;
    private BigDecimal total;
    private String numeroMesa;
    private java.util.List<DetallePedidoResponse> detalles;
}

