package com.sje.restnova.services;

import com.sje.restnova.dtos.mapper.ReservaMapper;
import com.sje.restnova.dtos.request.ReservaRequest;
import com.sje.restnova.dtos.response.ReservaResponse;
import com.sje.restnova.entities.Reserva;
import com.sje.restnova.repositories.ReservaRepository;
import com.sje.restnova.repositories.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReservaService {

    private final ReservaRepository reservaRepository;
    private final ReservaMapper reservaMapper;
    private final UsuarioRepository usuarioRepository;

    public List<ReservaResponse> listarTodas() {
        return reservaRepository.findAll().stream()
                .map(reservaMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ReservaResponse crearReserva(ReservaRequest request) {
        Reserva reserva = reservaMapper.toEntity(request);
        reserva.setEstado(Reserva.EstadoReserva.PENDIENTE);
        Reserva guardada = reservaRepository.save(reserva);
        return reservaMapper.toResponseDTO(guardada);
    }

    @Transactional
    public ReservaResponse actualizarReserva(Integer id, ReservaRequest request) {
        Reserva reserva = reservaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Reserva no encontrada"));
        
        // Handle User relationship if changed or for initial load
        if (request.getUsuarioId() != null) {
            com.sje.restnova.entities.Usuario usuario = usuarioRepository.findById(request.getUsuarioId())
                    .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
            reserva.setUsuario(usuario);
        }

        reservaMapper.updateReservaFromRequest(request, reserva);
        
        // Re-ensure the ID remains the same (MapStruct ignore handles this but it's safe)
        reserva.setId(id);
        
        Reserva guardada = reservaRepository.save(reserva);
        return reservaMapper.toResponseDTO(guardada);
    }

    @Transactional
    public void eliminarReserva(Integer id) {
        if (!reservaRepository.existsById(id)) {
            throw new IllegalArgumentException("Reserva no encontrada");
        }
        reservaRepository.deleteById(id);
    }
}
