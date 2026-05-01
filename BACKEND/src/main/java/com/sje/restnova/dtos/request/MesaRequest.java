package com.sje.restnova.dtos.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class MesaRequest {

    @NotBlank(message = "El número de mesa es obligatorio")
    private String numeroMesa;

    @NotNull(message = "La capacidad es obligatoria")
    @Min(value = 1, message = "La capacidad debe ser de al menos 1")
    private Integer capacidad;
}
