package com.sje.restnova.repositories;

import com.sje.restnova.entities.SesionMesa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SesionMesaRepository extends JpaRepository<SesionMesa, Integer> {
    Optional<SesionMesa> findByTokenQr(String tokenQr);
}
