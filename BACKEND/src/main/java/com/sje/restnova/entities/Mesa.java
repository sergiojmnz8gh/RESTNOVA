package com.sje.restnova.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "mesas")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Mesa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "numero_mesa", nullable = false, unique = true, length = 10)
    private String numeroMesa;

    @Column(nullable = false)
    private Integer capacidad;
}
