package com.sje.restnova.dtos.mapper;

import com.sje.restnova.dtos.response.NotificacionResponse;
import com.sje.restnova.entities.Notificacion;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class NotificacionMapper {

    public NotificacionResponse toResponse(Notificacion entity) {
        if (entity == null) return null;
        NotificacionResponse dto = new NotificacionResponse();
        dto.setId(entity.getId());
        dto.setMensaje(entity.getMensaje());
        dto.setTipo(entity.getTipo());
        dto.setLeida(entity.isLeida());
        dto.setFechaHora(entity.getFechaHora());
        if (entity.getMesa() != null) {
            dto.setNumeroMesa(entity.getMesa().getNumeroMesa());
        }
        return dto;
    }

    public List<NotificacionResponse> toResponseList(List<Notificacion> entities) {
        return entities.stream().map(this::toResponse).collect(Collectors.toList());
    }
}
