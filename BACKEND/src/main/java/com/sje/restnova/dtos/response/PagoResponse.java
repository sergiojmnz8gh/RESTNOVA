package com.sje.restnova.dtos.response;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class PagoResponse {
    private Integer id;
    private Integer pedidoId;
    private BigDecimal monto;
    private LocalDateTime fechaPago;
    private String metodoPago;
}

