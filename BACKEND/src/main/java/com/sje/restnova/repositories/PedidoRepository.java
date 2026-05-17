package com.sje.restnova.repositories;

import com.sje.restnova.entities.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Integer> {
    boolean existsBySesionMesaIdAndEstadoIn(Integer sesionMesaId, List<Pedido.EstadoPedido> estados);
    List<Pedido> findAllBySesionMesaId(Integer sesionMesaId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("UPDATE Pedido p SET p.usuario = null WHERE p.usuario.id = :usuarioId")
    void nullifyUsuario(@org.springframework.data.repository.query.Param("usuarioId") Integer usuarioId);
}

