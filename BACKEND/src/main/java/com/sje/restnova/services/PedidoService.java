package com.sje.restnova.services;

import com.sje.restnova.dtos.mapper.PedidoMapper;
import com.sje.restnova.dtos.response.PedidoResponse;
import com.sje.restnova.repositories.PedidoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final PedidoMapper pedidoMapper;
    private final com.sje.restnova.repositories.ProductoRepository productoRepository;
    private final com.sje.restnova.repositories.DetallePedidoRepository detallePedidoRepository;
    private final com.sje.restnova.repositories.SesionMesaRepository sesionMesaRepository;
    private final com.sje.restnova.repositories.UsuarioRepository usuarioRepository;

    public List<PedidoResponse> getAllOrders() {
        return pedidoRepository.findAll().stream()
                .map(pedidoMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @org.springframework.transaction.annotation.Transactional
    public PedidoResponse createOrder(com.sje.restnova.dtos.request.PedidoRequest request) {
        // En lugar de usar mapper.toEntity directamente para objetos anidados complejos,
        // recuperamos las entidades gestionadas para evitar problemas de persistencia.
        com.sje.restnova.entities.SesionMesa sessionEntity = sesionMesaRepository.findById(request.getSesionMesaId())
                .orElseThrow(() -> new IllegalArgumentException("Sesión de mesa no encontrada"));
        
        com.sje.restnova.entities.Pedido orderEntity = new com.sje.restnova.entities.Pedido();
        orderEntity.setSesionMesa(sessionEntity);
        orderEntity.setFechaHora(java.time.LocalDateTime.now());
        
        if (request.getUsuarioId() != null) {
            orderEntity.setUsuario(usuarioRepository.findById(request.getUsuarioId()).orElse(null));
        }

        // Determinar estado inicial basado en forma de pago
        if ("CARD".equalsIgnoreCase(request.getFormaPago())) {
            orderEntity.setEstado(com.sje.restnova.entities.Pedido.EstadoPedido.PAGADO);
        } else {
            orderEntity.setEstado(com.sje.restnova.entities.Pedido.EstadoPedido.PENDIENTE_PAGO);
        }

        orderEntity.setTotal(java.math.BigDecimal.ZERO);
        com.sje.restnova.entities.Pedido savedOrder = pedidoRepository.save(orderEntity);

        java.math.BigDecimal accumulatedTotal = java.math.BigDecimal.ZERO;
        
        for (com.sje.restnova.dtos.request.DetallePedidoRequest dReq : request.getDetalles()) {
            com.sje.restnova.entities.Producto productEntity = productoRepository.findById(dReq.getProductoId())
                    .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado: " + dReq.getProductoId()));
            
            com.sje.restnova.entities.DetallePedido detailEntity = new com.sje.restnova.entities.DetallePedido();
            detailEntity.setPedido(savedOrder);
            detailEntity.setProducto(productEntity);
            detailEntity.setCantidad(dReq.getCantidad());
            detailEntity.setPrecioUnitario(productEntity.getPrecio()); // Usamos el precio REAL de la DB por seguridad
            
            detallePedidoRepository.save(detailEntity);
            savedOrder.getDetalles().add(detailEntity);
            
            java.math.BigDecimal subtotal = productEntity.getPrecio().multiply(java.math.BigDecimal.valueOf(dReq.getCantidad()));
            accumulatedTotal = accumulatedTotal.add(subtotal);
        }

        savedOrder.setTotal(accumulatedTotal);
        pedidoRepository.saveAndFlush(savedOrder); // Aseguramos que el total se persista
        
        return pedidoMapper.toResponseDTO(savedOrder);
    }

    @org.springframework.transaction.annotation.Transactional
    public PedidoResponse updateStatus(Integer id, com.sje.restnova.entities.Pedido.EstadoPedido newStatus) {
        com.sje.restnova.entities.Pedido orderEntity = pedidoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Pedido no encontrado"));
        
        orderEntity.setEstado(newStatus);
        com.sje.restnova.entities.Pedido savedOrder = pedidoRepository.saveAndFlush(orderEntity);
        return pedidoMapper.toResponseDTO(savedOrder);
    }

    @org.springframework.transaction.annotation.Transactional
    public void deleteOrder(Integer id) {
        if (!pedidoRepository.existsById(id)) {
            throw new IllegalArgumentException("Pedido no encontrado");
        }
        // Cascade removes DetallePedido (Must check if DetallePedido is mapped with orphanRemoval = true or CascadeType.REMOVE)
        // Pedido.java doesn't have DetallePedido mapped directly, so we must delete details first.
        detallePedidoRepository.deleteByPedidoId(id);
        pedidoRepository.deleteById(id);
    }
}
