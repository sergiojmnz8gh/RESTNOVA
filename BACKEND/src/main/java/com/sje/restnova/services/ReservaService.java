package com.sje.restnova.services;

import com.sje.restnova.dtos.mapper.ReservaMapper;
import com.sje.restnova.dtos.request.ReservaRequest;
import com.sje.restnova.dtos.response.ReservaResponse;
import com.sje.restnova.entities.Reserva;
import com.sje.restnova.entities.Usuario;
import com.sje.restnova.repositories.MesaRepository;
import com.sje.restnova.repositories.ReservaRepository;
import com.sje.restnova.repositories.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReservaService {

    private final ReservaRepository reservaRepository;
    private final ReservaMapper reservaMapper;
    private final UsuarioRepository usuarioRepository;
    private final MesaRepository mesaRepository;
    private final EmailService emailService;

    
    private static final LocalTime INICIO_COMIDA = LocalTime.of(13, 0);
    private static final LocalTime FIN_COMIDA = LocalTime.of(16, 0);
    private static final LocalTime INICIO_CENA = LocalTime.of(20, 0);
    private static final LocalTime FIN_CENA = LocalTime.of(23, 30);

    public List<ReservaResponse> listarTodas() {
        return reservaRepository.findAllWithRelations().stream()
                .map(reservaMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    public List<ReservaResponse> listarPorUsuario(Integer usuarioId) {
        return reservaRepository.findByUsuarioIdWithRelations(usuarioId).stream()
                .map(reservaMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    public Integer getMaxCapacidad() {
        return mesaRepository.findMaxCapacidad();
    }

    @Transactional
    public ReservaResponse crearReserva(ReservaRequest request) {
        
        if (request.getFecha().getDayOfWeek() == java.time.DayOfWeek.MONDAY) {
            throw new IllegalArgumentException("Lo sentimos, el restaurante permanece cerrado los lunes por descanso del personal.");
        }

        
        Integer maxCap = mesaRepository.findMaxCapacidad();
        if (request.getNumPersonas() > maxCap) {
            throw new IllegalArgumentException("Para reservas de más de " + maxCap + " personas, por favor contacte directamente con el restaurante.");
        }

        
        LocalTime hora = request.getHora();
        LocalTime inicioTurno;
        LocalTime finTurno;

        if (!hora.isBefore(INICIO_COMIDA) && hora.isBefore(FIN_COMIDA)) {
            inicioTurno = INICIO_COMIDA;
            finTurno = FIN_COMIDA;
        } else if (!hora.isBefore(INICIO_CENA) && hora.isBefore(FIN_CENA)) {
            inicioTurno = INICIO_CENA;
            finTurno = FIN_CENA;
        } else {
            throw new IllegalArgumentException("El horario seleccionado está fuera de nuestros turnos de apertura.");
        }

        
        if (hora.isAfter(finTurno.minusHours(1))) {
            throw new IllegalArgumentException("Las reservas deben realizarse al menos 1 hora antes del cierre del turno (" + finTurno.minusHours(1) + ").");
        }

        
        long mesasCapacidadSuficiente = mesaRepository.countByCapacidadGreaterThanEqual(request.getNumPersonas());
        long reservasOcupadas = reservaRepository.countReservasParaCapacidadEnTurno(request.getFecha(), inicioTurno, finTurno, request.getNumPersonas());

        if (reservasOcupadas >= mesasCapacidadSuficiente) {
            throw new IllegalStateException("Lo sentimos, no hay mesas disponibles para " + request.getNumPersonas() + " personas en este turno.");
        }

        Reserva reserva = reservaMapper.toEntity(request);
        reserva.setEstado(Reserva.EstadoReserva.PENDIENTE);
        
        
        if (reserva.getUsuario() != null) {
            Usuario fullUser = usuarioRepository.findById(reserva.getUsuario().getId())
                .orElse(null);
            reserva.setUsuario(fullUser);
        }

        Reserva guardada = reservaRepository.save(reserva);
        emailService.sendReservationEmail(guardada);
        return reservaMapper.toResponseDTO(guardada);
    }

    public List<LocalTime> getDisponibilidad(java.time.LocalDate fecha, Integer numPersonas) {
        java.util.List<LocalTime> slotsDisponibles = new java.util.ArrayList<>();
        
        if (fecha.getDayOfWeek() == java.time.DayOfWeek.MONDAY) {
            return slotsDisponibles;
        }

        
        if (hayDisponibilidadEnTurno(fecha, INICIO_COMIDA, FIN_COMIDA, numPersonas)) {
            LocalTime current = INICIO_COMIDA;
            LocalTime limit = FIN_COMIDA.minusHours(1);
            while (!current.isAfter(limit)) {
                slotsDisponibles.add(current);
                current = current.plusMinutes(15);
            }
        }

        
        if (hayDisponibilidadEnTurno(fecha, INICIO_CENA, FIN_CENA, numPersonas)) {
            LocalTime current = INICIO_CENA;
            LocalTime limit = FIN_CENA.minusHours(1);
            while (!current.isAfter(limit)) {
                slotsDisponibles.add(current);
                current = current.plusMinutes(15);
            }
        }

        return slotsDisponibles;
    }

    private boolean hayDisponibilidadEnTurno(java.time.LocalDate fecha, LocalTime inicio, LocalTime fin, Integer numPersonas) {
        long mesasCapacidadSuficiente = mesaRepository.countByCapacidadGreaterThanEqual(numPersonas);
        long reservasOcupadas = reservaRepository.countReservasParaCapacidadEnTurno(fecha, inicio, fin, numPersonas);
        return reservasOcupadas < mesasCapacidadSuficiente;
    }

    @Transactional
    public ReservaResponse actualizarReserva(Integer id, ReservaRequest request) {
        Reserva reserva = reservaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Reserva no encontrada"));
        
        Reserva.EstadoReserva oldEstado = reserva.getEstado();

        
        if (request.getUsuarioId() != null) {
            com.sje.restnova.entities.Usuario usuario = usuarioRepository.findById(request.getUsuarioId())
                    .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
            reserva.setUsuario(usuario);
        }

        reservaMapper.updateReservaFromRequest(request, reserva);
        
        
        reserva.setId(id);
        
        Reserva guardada = reservaRepository.save(reserva);

        if (oldEstado != guardada.getEstado()) {
            emailService.sendReservationStatusEmail(guardada);
        }

        return reservaMapper.toResponseDTO(guardada);
    }

    @Transactional
    public void eliminarReserva(Integer id) {
        if (!reservaRepository.existsById(id)) {
            throw new com.sje.restnova.exceptions.ResourceNotFoundException("Reserva no encontrada");
        }
        reservaRepository.deleteById(id);
    }

    public List<java.time.LocalDate> getDiasOcupados(Integer numPersonas) {
        
        
        java.time.LocalDate today = java.time.LocalDate.now();
        java.util.List<java.time.LocalDate> diasOcupados = new java.util.ArrayList<>();
        
        for (int i = 0; i < 30; i++) {
            java.time.LocalDate fecha = today.plusDays(i);
            if (fecha.getDayOfWeek() == java.time.DayOfWeek.MONDAY) {
                diasOcupados.add(fecha);
                continue;
            }
            boolean comidaLlena = !hayDisponibilidadEnTurno(fecha, INICIO_COMIDA, FIN_COMIDA, numPersonas);
            boolean cenaLlena = !hayDisponibilidadEnTurno(fecha, INICIO_CENA, FIN_CENA, numPersonas);
            if (comidaLlena && cenaLlena) {
                diasOcupados.add(fecha);
            }
        }
        return diasOcupados;
    }
}

