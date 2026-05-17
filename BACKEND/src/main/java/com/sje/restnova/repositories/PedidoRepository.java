package com.sje.restnova.repositories;

import com.sje.restnova.entities.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Integer> {
    boolean existsBySesionMesaIdAndEstadoIn(Integer sesionMesaId, List<Pedido.EstadoPedido> estados);
    List<Pedido> findAllBySesionMesaId(Integer sesionMesaId);
}

