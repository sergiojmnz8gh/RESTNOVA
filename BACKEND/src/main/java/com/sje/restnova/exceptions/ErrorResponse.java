package com.sje.restnova.exceptions;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {
    private LocalDateTime timestamp;
    private int status;
    private String error;
    private String message;
    private String path;
    
    // Campo opcional para detalles de errores de validación (ej. {"email": "El email es obligatorio"})
    private Map<String, String> validationErrors;
}
