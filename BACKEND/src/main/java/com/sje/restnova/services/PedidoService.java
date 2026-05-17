package com.sje.restnova.services;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.sje.restnova.dtos.mapper.PedidoMapper;
import com.sje.restnova.dtos.response.PedidoResponse;
import com.sje.restnova.repositories.PedidoRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final PedidoMapper pedidoMapper;
    private final com.sje.restnova.repositories.ProductoRepository productoRepository;
    private final com.sje.restnova.repositories.DetallePedidoRepository detallePedidoRepository;
    private final com.sje.restnova.repositories.SesionMesaRepository sesionMesaRepository;
    private final com.sje.restnova.repositories.UsuarioRepository usuarioRepository;
    private final com.sje.restnova.repositories.NotificacionRepository notificacionRepository;

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<PedidoResponse> getAllOrders() {
        return pedidoRepository.findAll().stream()
                .map(pedidoMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<PedidoResponse> getOrdersBySession(Integer sessionId) {

        return pedidoRepository.findAllBySesionMesaId(sessionId).stream()
                .map(pedidoMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @org.springframework.transaction.annotation.Transactional
    public PedidoResponse createOrder(com.sje.restnova.dtos.request.PedidoRequest request) {

        com.sje.restnova.entities.SesionMesa sessionEntity = sesionMesaRepository.findById(request.getSesionMesaId())
                .orElseThrow(() -> new IllegalArgumentException("Sesión de mesa no encontrada"));

        if (sessionEntity.getFechaCierre() != null) {
            throw new IllegalStateException("Esta sesión de mesa ha sido cerrada. No se pueden realizar más pedidos.");
        }

        com.sje.restnova.entities.Pedido orderEntity = new com.sje.restnova.entities.Pedido();
        orderEntity.setSesionMesa(sessionEntity);
        orderEntity.setFechaHora(java.time.LocalDateTime.now());

        if (request.getUsuarioId() != null) {
            orderEntity.setUsuario(usuarioRepository.findById(request.getUsuarioId()).orElse(null));
        }

        if ("CARD".equalsIgnoreCase(request.getFormaPago())) {
            orderEntity.setEstado(com.sje.restnova.entities.Pedido.EstadoPedido.PENDIENTE);
            orderEntity.setMetodoPago(com.sje.restnova.entities.Pedido.MetodoPago.TARJETA);
        } else if ("WEB".equalsIgnoreCase(request.getFormaPago())) {
            orderEntity.setEstado(com.sje.restnova.entities.Pedido.EstadoPedido.PENDIENTE);
            orderEntity.setMetodoPago(com.sje.restnova.entities.Pedido.MetodoPago.WEB);
        } else {
            orderEntity.setEstado(com.sje.restnova.entities.Pedido.EstadoPedido.PENDIENTE_PAGO);
            orderEntity.setMetodoPago(com.sje.restnova.entities.Pedido.MetodoPago.EFECTIVO);
        }

        orderEntity.setTotal(java.math.BigDecimal.ZERO);
        com.sje.restnova.entities.Pedido savedOrder = pedidoRepository.save(orderEntity);

        java.math.BigDecimal accumulatedTotal = java.math.BigDecimal.ZERO;

        for (com.sje.restnova.dtos.request.DetallePedidoRequest dReq : request.getDetalles()) {
            com.sje.restnova.entities.Producto productEntity = productoRepository.findById(dReq.getProductoId())
                    .orElseThrow(() -> new com.sje.restnova.exceptions.ResourceNotFoundException(
                            "Producto no encontrado: " + dReq.getProductoId()));

            com.sje.restnova.entities.DetallePedido detailEntity = new com.sje.restnova.entities.DetallePedido();
            detailEntity.setPedido(savedOrder);
            detailEntity.setProducto(productEntity);
            detailEntity.setCantidad(dReq.getCantidad());
            detailEntity.setPrecioUnitario(productEntity.getPrecio());

            detallePedidoRepository.save(detailEntity);
            savedOrder.getDetalles().add(detailEntity);

            java.math.BigDecimal subtotal = productEntity.getPrecio()
                    .multiply(java.math.BigDecimal.valueOf(dReq.getCantidad()));
            accumulatedTotal = accumulatedTotal.add(subtotal);
        }

        if (Boolean.TRUE.equals(request.getUsaPuntos()) && orderEntity.getUsuario() != null) {
            com.sje.restnova.entities.Usuario usuario = orderEntity.getUsuario();
            java.math.BigDecimal puntos = usuario.getPuntosAcumulados();
            if (puntos != null && puntos.compareTo(new java.math.BigDecimal("500")) >= 0) {

                java.math.BigDecimal discount = puntos.multiply(new java.math.BigDecimal("0.01"));

                if (discount.compareTo(accumulatedTotal) > 0) {
                    discount = accumulatedTotal;

                    java.math.BigDecimal pointsUsed = discount.divide(new java.math.BigDecimal("0.01"));
                    usuario.setPuntosAcumulados(puntos.subtract(pointsUsed));
                } else {
                    usuario.setPuntosAcumulados(java.math.BigDecimal.ZERO);
                }

                accumulatedTotal = accumulatedTotal.subtract(discount);
                usuarioRepository.save(usuario);
            }
        }

        savedOrder.setTotal(accumulatedTotal);
        pedidoRepository.saveAndFlush(savedOrder);

        if ("EFECTIVO".equalsIgnoreCase(request.getFormaPago())) {
            com.sje.restnova.entities.Notificacion notif = new com.sje.restnova.entities.Notificacion();
            notif.setMesa(sessionEntity.getMesa());
            notif.setTipo("PAGO_CAMARERO");
            notif.setMensaje("Pago en efectivo - Mesa " + sessionEntity.getMesa().getNumeroMesa() + " (" + accumulatedTotal + "€)");
            notif.setFechaHora(java.time.LocalDateTime.now());
            notificacionRepository.save(notif);
        }

        if (savedOrder.getUsuario() != null) {
            rewardPoints(savedOrder);
        }

        return pedidoMapper.toResponseDTO(savedOrder);
    }

    private void rewardPoints(com.sje.restnova.entities.Pedido order) {
        com.sje.restnova.entities.Usuario usuario = order.getUsuario();
        if (usuario != null && order.getTotal().compareTo(java.math.BigDecimal.ZERO) > 0) {

            java.math.BigDecimal pointsToReward = order.getTotal().multiply(new java.math.BigDecimal("8"));

            java.math.BigDecimal currentPoints = usuario.getPuntosAcumulados() != null ? usuario.getPuntosAcumulados()
                    : java.math.BigDecimal.ZERO;
            usuario.setPuntosAcumulados(currentPoints.add(pointsToReward));
            usuarioRepository.save(usuario);
        }
    }

    @org.springframework.transaction.annotation.Transactional
    public PedidoResponse updateStatus(Integer id, com.sje.restnova.entities.Pedido.EstadoPedido newStatus) {
        com.sje.restnova.entities.Pedido orderEntity = pedidoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Pedido no encontrado"));

        com.sje.restnova.entities.Pedido.EstadoPedido oldStatus = orderEntity.getEstado();
        orderEntity.setEstado(newStatus);
        com.sje.restnova.entities.Pedido savedOrder = pedidoRepository.saveAndFlush(orderEntity);

        if (com.sje.restnova.entities.Pedido.EstadoPedido.LISTO_PARA_SERVIR.equals(newStatus)) {
            com.sje.restnova.entities.Notificacion notif = new com.sje.restnova.entities.Notificacion();
            notif.setMesa(orderEntity.getSesionMesa().getMesa());
            notif.setTipo("PLATO_LISTO");
            String platos = orderEntity.getDetalles().stream()
                    .map(d -> d.getProducto().getNombre() + " (x" + d.getCantidad() + ")")
                    .collect(java.util.stream.Collectors.joining(", "));
            notif.setMensaje(platos + " (Mesa " + orderEntity.getSesionMesa().getMesa().getNumeroMesa() + ")");
            notif.setFechaHora(java.time.LocalDateTime.now());
            notificacionRepository.save(notif);
        }

        return pedidoMapper.toResponseDTO(savedOrder);
    }

    @org.springframework.transaction.annotation.Transactional
    public void deleteOrder(Integer id) {
        if (!pedidoRepository.existsById(id)) {
            throw new com.sje.restnova.exceptions.ResourceNotFoundException("Pedido no encontrado");
        }

        detallePedidoRepository.deleteByPedidoId(id);
        pedidoRepository.deleteById(id);
    }
}
