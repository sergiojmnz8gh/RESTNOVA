package com.sje.restnova.dtos.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.sje.restnova.dtos.request.ReservaRequest;
import com.sje.restnova.dtos.response.ReservaResponse;
import com.sje.restnova.entities.Reserva;

@Mapper(componentModel = "spring")
public interface ReservaMapper {
    
    @Mapping(target = "usuarioNombre", source = "usuario.nombre")
    @Mapping(target = "usuarioId", source = "usuario.id")
    ReservaResponse toResponseDTO(Reserva reserva);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "usuario.id", source = "usuarioId")
    @Mapping(target = "estado", source = "estado", defaultValue = "PENDIENTE")
    Reserva toEntity(ReservaRequest reservaRequest);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "usuario.id", source = "usuarioId")
    void updateReservaFromRequest(ReservaRequest request, @org.mapstruct.MappingTarget Reserva entity);
}
