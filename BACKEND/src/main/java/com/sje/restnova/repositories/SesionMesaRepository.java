package com.sje.restnova.repositories;

import com.sje.restnova.entities.SesionMesa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SesionMesaRepository extends JpaRepository<SesionMesa, Integer> {
    @org.springframework.data.jpa.repository.Query("SELECT s FROM SesionMesa s LEFT JOIN FETCH s.mesa LEFT JOIN FETCH s.camarero")
    java.util.List<SesionMesa> findAllWithRelations();

    Optional<SesionMesa> findByTokenQr(String tokenQr);

    @org.springframework.data.jpa.repository.Query("SELECT s FROM SesionMesa s WHERE s.mesa.id = :mesaId AND s.fechaCierre IS NULL")
    Optional<SesionMesa> findActiveByMesaId(@org.springframework.data.repository.query.Param("mesaId") Integer mesaId);
}

