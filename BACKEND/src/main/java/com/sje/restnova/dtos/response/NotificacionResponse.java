package com.sje.restnova.dtos.response;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class NotificacionResponse {
    private Integer id;
    private String mensaje;
    private String tipo;
    private boolean leida;
    private LocalDateTime fechaHora;
    private String numeroMesa;
}
