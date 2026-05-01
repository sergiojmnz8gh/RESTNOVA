package com.sje.restnova.dtos.response;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class UsuarioResponse {
    private Integer id;
    private String email;
    private String nombre;
    private String apellidos;
    private String telefono;
    private String rolNombre;
    private BigDecimal puntosAcumulados;
}
