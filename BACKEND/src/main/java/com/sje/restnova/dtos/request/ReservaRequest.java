package com.sje.restnova.dtos.request;

import com.sje.restnova.entities.Reserva.EstadoReserva;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class ReservaRequest {

    @NotNull(message = "El ID del usuario es obligatorio")
    private Integer usuarioId;

    @NotNull(message = "La fecha es obligatoria")
    @Future(message = "La fecha de reserva debe ser en el futuro")
    private LocalDate fecha;

    @NotNull(message = "La hora es obligatoria")
    private LocalTime hora;

    @NotNull(message = "El número de personas es obligatorio")
    @Min(value = 1, message = "Debe haber al menos 1 persona")
    private Integer numPersonas;

    private EstadoReserva estado;
}
