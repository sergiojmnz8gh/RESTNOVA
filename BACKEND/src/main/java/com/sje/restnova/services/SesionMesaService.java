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

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public java.util.List<com.sje.restnova.dtos.response.SesionMesaResponse> getAllSessions() {
        return repository.findAllWithRelations().stream()
                .map(mapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    public SesionMesaResponse findByToken(String token) {
        com.sje.restnova.entities.SesionMesa sessionEntity = repository.findByTokenQr(token)
                .orElseThrow(() -> new com.sje.restnova.exceptions.ResourceNotFoundException("Sesión no válida o expirada"));
        if (sessionEntity.getFechaCierre() != null) {
            throw new IllegalArgumentException("Esta sesión ya ha sido cerrada");
        }
        return mapper.toResponseDTO(sessionEntity);
    }

    @org.springframework.transaction.annotation.Transactional
    public SesionMesaResponse createSession(com.sje.restnova.dtos.request.SesionMesaRequest request) {
        
        repository.findActiveByMesaId(request.getMesaId()).ifPresent(s -> {
            throw new IllegalStateException("Ya existe una sesión activa para esta mesa");
        });

        com.sje.restnova.entities.SesionMesa sessionEntity = mapper.toEntity(request);
        sessionEntity.setFechaApertura(java.time.LocalDateTime.now());
        
        
        String shortToken;
        do {
            shortToken = java.util.UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        } while (repository.findByTokenQr(shortToken).isPresent());
        
        sessionEntity.setTokenQr(shortToken);
        sessionEntity.setCodigoAcceso(shortToken); 
        com.sje.restnova.entities.SesionMesa savedSession = repository.save(sessionEntity);
        return mapper.toResponseDTO(savedSession);
    }

    @org.springframework.transaction.annotation.Transactional
    public SesionMesaResponse closeSession(Integer id) {
        com.sje.restnova.entities.SesionMesa sessionEntity = repository.findById(id)
                .orElseThrow(() -> new com.sje.restnova.exceptions.ResourceNotFoundException("Sesión no encontrada"));
        
        
        boolean hasPendingOrders = pedidoRepository.existsBySesionMesaIdAndEstadoIn(id, 
                java.util.List.of(com.sje.restnova.entities.Pedido.EstadoPedido.PENDIENTE, 
                             com.sje.restnova.entities.Pedido.EstadoPedido.EN_PREPARACION,
                             com.sje.restnova.entities.Pedido.EstadoPedido.LISTO_PARA_SERVIR));
        
        if (hasPendingOrders) {
            throw new IllegalStateException("No se puede cerrar la mesa. Hay platos pendientes de servir.");
        }

        sessionEntity.setFechaCierre(java.time.LocalDateTime.now());
        return mapper.toResponseDTO(repository.save(sessionEntity));
    }

    @org.springframework.transaction.annotation.Transactional
    public void deleteSession(Integer id) {
        if (!repository.existsById(id)) {
            throw new com.sje.restnova.exceptions.ResourceNotFoundException("Sesión no encontrada");
        }
        repository.deleteById(id);
    }
}

