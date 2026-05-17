package com.sje.restnova.dtos.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class PedidoRequest {

    @NotNull(message = "El ID de la sesión de mesa es obligatorio")
    private Integer sesionMesaId;

    private Integer usuarioId; 

    @NotEmpty(message = "El pedido debe contener al menos un detalle")
    @Valid
    private List<DetallePedidoRequest> detalles;

    @NotNull(message = "La forma de pago es obligatoria")
    private String formaPago; 

    private Boolean usaPuntos;
}

