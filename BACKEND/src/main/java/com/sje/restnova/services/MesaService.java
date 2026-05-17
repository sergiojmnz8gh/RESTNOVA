package com.sje.restnova.services;

import com.sje.restnova.dtos.mapper.MesaMapper;
import com.sje.restnova.dtos.request.MesaRequest;
import com.sje.restnova.dtos.response.MesaResponse;
import com.sje.restnova.entities.Mesa;
import com.sje.restnova.repositories.MesaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MesaService {

    private final MesaRepository mesaRepository;
    private final com.sje.restnova.repositories.SesionMesaRepository sesionMesaRepository;
    private final MesaMapper mesaMapper;

    public List<MesaResponse> getAllTables() {
        return mesaRepository.findAll().stream()
                .map(mesaMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public MesaResponse createTable(MesaRequest request) {
        Mesa tableEntity = mesaMapper.toEntity(request);
        Mesa savedTable = mesaRepository.save(tableEntity);
        return mesaMapper.toResponseDTO(savedTable);
    }

    @Transactional
    public MesaResponse updateTable(Integer id, MesaRequest request) {
        Mesa tableEntity = mesaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Mesa no encontrada"));
        
        if (sesionMesaRepository.findActiveByMesaId(id).isPresent()) {
            throw new IllegalStateException("No se puede modificar una mesa con una sesión activa");
        }
        
        tableEntity.setNumeroMesa(request.getNumeroMesa());
        tableEntity.setCapacidad(request.getCapacidad());
        
        Mesa savedTable = mesaRepository.saveAndFlush(tableEntity);
        return mesaMapper.toResponseDTO(savedTable);
    }

    @Transactional
    public void deleteTable(Integer id) {
        if (!mesaRepository.existsById(id)) {
            throw new com.sje.restnova.exceptions.ResourceNotFoundException("Mesa no encontrada");
        }
        if (sesionMesaRepository.findActiveByMesaId(id).isPresent()) {
            throw new IllegalStateException("No se puede eliminar una mesa con una sesión activa");
        }
        mesaRepository.deleteById(id);
    }
}

