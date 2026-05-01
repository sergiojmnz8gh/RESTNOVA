package com.sje.restnova.dtos.response;

import lombok.Data;

@Data
public class CategoriaResponse {
    private Integer id;
    private String nombre;
    private Boolean disponible;
}
