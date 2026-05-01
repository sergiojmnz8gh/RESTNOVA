package com.sje.restnova.repositories;

import com.sje.restnova.entities.Mesa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MesaRepository extends JpaRepository<Mesa, Integer> {
}
