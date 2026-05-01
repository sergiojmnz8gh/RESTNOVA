package com.sje.restnova.dtos.response;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class SesionMesaResponse {
    private Integer id;
    private Integer mesaId;
    private String camareroNombre;
    private String tokenQr;
    private LocalDateTime fechaApertura;
    private LocalDateTime fechaCierre;
    private String numeroMesa;
}
