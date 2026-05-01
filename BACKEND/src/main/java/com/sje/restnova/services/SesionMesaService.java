package com.sje.restnova.services;

import com.sje.restnova.dtos.mapper.SesionMesaMapper;
import com.sje.restnova.dtos.response.SesionMesaResponse;
import com.sje.restnova.repositories.SesionMesaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SesionMesaService {

    private final SesionMesaRepository repository;
    private final SesionMesaMapper mapper;
    private final com.sje.restnova.repositories.PedidoRepository pedidoRepository;

    public List<SesionMesaResponse> getAllSessions() {
        return repository.findAll().stream()
                .map(mapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    public SesionMesaResponse findByToken(String token) {
        com.sje.restnova.entities.SesionMesa sessionEntity = repository.findByTokenQr(token)
                .orElseThrow(() -> new IllegalArgumentException("Sesión no válida o expirada"));
        if (sessionEntity.getFechaCierre() != null) {
            throw new IllegalArgumentException("Esta sesión ya ha sido cerrada");
        }
        return mapper.toResponseDTO(sessionEntity);
    }

    @org.springframework.transaction.annotation.Transactional
    public SesionMesaResponse createSession(com.sje.restnova.dtos.request.SesionMesaRequest request) {
        com.sje.restnova.entities.SesionMesa sessionEntity = mapper.toEntity(request);
        sessionEntity.setFechaApertura(java.time.LocalDateTime.now());
        sessionEntity.setTokenQr(java.util.UUID.randomUUID().toString());
        com.sje.restnova.entities.SesionMesa savedSession = repository.save(sessionEntity);
        return mapper.toResponseDTO(savedSession);
    }

    @org.springframework.transaction.annotation.Transactional
    public SesionMesaResponse closeSession(Integer id) {
        com.sje.restnova.entities.SesionMesa sessionEntity = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Sesión no encontrada"));
        
        // Bloquear cierre si hay pedidos pendientes de pago
        boolean hasPendingOrders = pedidoRepository.existsBySesionMesaIdAndEstadoIn(id, 
                java.util.List.of(com.sje.restnova.entities.Pedido.EstadoPedido.PENDIENTE, 
                             com.sje.restnova.entities.Pedido.EstadoPedido.PENDIENTE_PAGO));
        
        if (hasPendingOrders) {
            throw new IllegalStateException("No se puede cerrar la mesa. Hay pedidos pendientes de pago.");
        }

        sessionEntity.setFechaCierre(java.time.LocalDateTime.now());
        return mapper.toResponseDTO(repository.save(sessionEntity));
    }

    @org.springframework.transaction.annotation.Transactional
    public void deleteSession(Integer id) {
        if (!repository.existsById(id)) {
            throw new IllegalArgumentException("Sesión no encontrada");
        }
        repository.deleteById(id);
    }
}
