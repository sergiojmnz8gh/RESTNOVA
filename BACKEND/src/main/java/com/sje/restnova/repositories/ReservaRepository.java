package com.sje.restnova.repositories;

import com.sje.restnova.entities.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;

@Repository
public interface ReservaRepository extends JpaRepository<Reserva, Integer> {
    
    @Query("SELECT COUNT(r) FROM Reserva r WHERE r.fecha = :fecha AND r.hora BETWEEN :inicio AND :fin AND r.estado <> com.sje.restnova.entities.Reserva.EstadoReserva.CANCELADA")
    long countReservasEnTurno(@Param("fecha") LocalDate fecha, 
                             @Param("inicio") LocalTime inicio, 
                             @Param("fin") LocalTime fin);

    @Query("SELECT COUNT(r) FROM Reserva r WHERE r.fecha = :fecha AND r.hora BETWEEN :inicio AND :fin AND r.estado <> com.sje.restnova.entities.Reserva.EstadoReserva.CANCELADA AND r.numPersonas >= :minPersonas")
    long countReservasParaCapacidadEnTurno(@Param("fecha") LocalDate fecha, 
                                          @Param("inicio") LocalTime inicio, 
                                          @Param("fin") LocalTime fin,
                                          @Param("minPersonas") Integer minPersonas);

    @Query("SELECT r FROM Reserva r JOIN FETCH r.usuario")
    java.util.List<Reserva> findAllWithRelations();

    @Query("SELECT r FROM Reserva r JOIN FETCH r.usuario WHERE r.usuario.id = :usuarioId")
    java.util.List<Reserva> findByUsuarioIdWithRelations(@Param("usuarioId") Integer usuarioId);

    java.util.List<Reserva> findByUsuarioId(Integer usuarioId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("DELETE FROM Reserva r WHERE r.usuario.id = :usuarioId")
    void deleteByUsuarioId(@org.springframework.data.repository.query.Param("usuarioId") Integer usuarioId);
}

