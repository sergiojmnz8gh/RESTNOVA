package com.sje.restnova.dtos.response;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProductoResponse {
    private Integer id;
    private String nombre;
    private String descripcion;
    private BigDecimal precio;
    private CategoriaResponse categoria;
    private Boolean disponible;
    private String imagenUrl;
}

