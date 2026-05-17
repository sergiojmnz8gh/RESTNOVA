package com.sje.restnova.repositories;

import com.sje.restnova.entities.Mesa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MesaRepository extends JpaRepository<Mesa, Integer> {
    
    @Query("SELECT MAX(m.capacidad) FROM Mesa m")
    Integer findMaxCapacidad();

    @Query("SELECT COUNT(m) FROM Mesa m WHERE m.capacidad >= :minPersonas")
    long countByCapacidadGreaterThanEqual(@Param("minPersonas") Integer minPersonas);
}

