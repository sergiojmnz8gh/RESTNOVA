package com.sje.restnova.repositories;

import com.sje.restnova.entities.DetallePedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DetallePedidoRepository extends JpaRepository<DetallePedido, Integer> {
    void deleteByPedidoId(Integer pedidoId);
}

