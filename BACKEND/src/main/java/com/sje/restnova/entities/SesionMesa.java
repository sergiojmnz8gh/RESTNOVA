package com.sje.restnova.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "sesiones_mesa")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SesionMesa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mesa_id", nullable = false)
    private Mesa mesa;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "camarero_id", nullable = false)
    private Usuario camarero;

    @Column(name = "token_qr", length = 255)
    private String tokenQr;

    @Column(name = "fecha_apertura", nullable = false)
    private LocalDateTime fechaApertura;

    @Column(name = "fecha_cierre")
    private LocalDateTime fechaCierre;
}
