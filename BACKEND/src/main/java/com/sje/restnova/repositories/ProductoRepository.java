package com.sje.restnova.repositories;

import com.sje.restnova.entities.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Integer> {
    List<Producto> findByDisponibleTrue();

    List<Producto> findByActivoTrue();

    @org.springframework.data.jpa.repository.Query(value = 
        "SELECT p.* FROM productos p " +
        "JOIN detalle_pedidos dp ON p.id = dp.producto_id " +
        "GROUP BY p.id " +
        "ORDER BY SUM(dp.cantidad) DESC " +
        "LIMIT 3", nativeQuery = true)
    List<Producto> findTop3MostSold();
}

