package com.sje.restnova.dtos.response;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class ReservaResponse {
    private Integer id;
    private Integer usuarioId;
    private String usuarioNombre;
    private LocalDate fecha;
    private LocalTime hora;
    private Integer numPersonas;
    private String estado;
}
