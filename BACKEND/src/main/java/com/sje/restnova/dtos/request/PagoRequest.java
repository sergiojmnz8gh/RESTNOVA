package com.sje.restnova.dtos.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PagoRequest {

    @NotNull(message = "El ID del pedido es obligatorio")
    private Integer pedidoId;

    @NotBlank(message = "El método de pago es obligatorio")
    private String metodoPago; // EFECTIVO, TARJETA, PUNTOS
}
