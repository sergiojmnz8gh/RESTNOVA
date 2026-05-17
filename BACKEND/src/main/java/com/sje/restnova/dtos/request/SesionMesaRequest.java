package com.sje.restnova.dtos.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SesionMesaRequest {

    @NotNull(message = "El ID de la mesa es obligatorio")
    private Integer mesaId;

    @NotNull(message = "El ID del camarero es obligatorio")
    private Integer camareroId;
}

