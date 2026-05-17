package com.sje.restnova.dtos.response;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class DetallePedidoResponse {
    private Integer id;
    private Integer pedidoId;
    private String productoNombre;
    private Integer cantidad;
    private BigDecimal precioUnitario;
}

