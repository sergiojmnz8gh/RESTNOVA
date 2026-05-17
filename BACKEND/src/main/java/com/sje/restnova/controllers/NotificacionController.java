package com.sje.restnova.controllers;

import com.sje.restnova.dtos.mapper.NotificacionMapper;
import com.sje.restnova.dtos.response.NotificacionResponse;
import com.sje.restnova.entities.Notificacion;
import com.sje.restnova.repositories.NotificacionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/notificaciones")
@RequiredArgsConstructor
public class NotificacionController {

    private final NotificacionRepository notificacionRepository;
    private final NotificacionMapper notificacionMapper;

    @GetMapping("/activas")
    public List<NotificacionResponse> getActivas() {
        List<Notificacion> entities = notificacionRepository.findByLeidaFalseOrderByFechaHoraDesc();
        return notificacionMapper.toResponseList(entities);
    }

    @PostMapping("/{id}/leer")
    public void marcarComoLeida(@PathVariable Integer id) {
        notificacionRepository.findById(id).ifPresent(n -> {
            n.setLeida(true);
            notificacionRepository.save(n);
        });
    }

    @PostMapping
    public NotificacionResponse crear(@RequestBody Notificacion notif) {
        if (notif.getFechaHora() == null) {
            notif.setFechaHora(LocalDateTime.now());
        }
        Notificacion saved = notificacionRepository.save(notif);
        return notificacionMapper.toResponse(saved);
    }

    @PostMapping("/leer-todas")
    public void leerTodas() {
        List<Notificacion> activas = notificacionRepository.findByLeidaFalseOrderByFechaHoraDesc();
        activas.forEach(n -> n.setLeida(true));
        notificacionRepository.saveAll(activas);
    }
}
