package com.sje.restnova.services;

import com.sje.restnova.dtos.mapper.PagoMapper;
import com.sje.restnova.dtos.response.PagoResponse;
import com.sje.restnova.repositories.PagoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PagoService {

    private final PagoRepository pagoRepository;
    private final PagoMapper pagoMapper;

    public List<PagoResponse> listarTodos() {
        return pagoRepository.findAll().stream()
                .map(pagoMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @org.springframework.transaction.annotation.Transactional
    public PagoResponse crearPago(com.sje.restnova.dtos.request.PagoRequest request) {
        com.sje.restnova.entities.Pago pago = pagoMapper.toEntity(request);
        pago.setFechaPago(java.time.LocalDateTime.now());
        pago.setMonto(java.math.BigDecimal.ZERO); // Hardcoded temporalmente, debería agarrarlo del Pedido
        com.sje.restnova.entities.Pago guardado = pagoRepository.save(pago);
        return pagoMapper.toResponseDTO(guardado);
    }
}
