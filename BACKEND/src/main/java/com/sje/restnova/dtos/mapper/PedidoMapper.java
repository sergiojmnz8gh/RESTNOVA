package com.sje.restnova.dtos.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.sje.restnova.dtos.request.PedidoRequest;
import com.sje.restnova.dtos.response.PedidoResponse;
import com.sje.restnova.entities.Pedido;

@Mapper(componentModel = "spring", uses = {DetallePedidoMapper.class})
public interface PedidoMapper {
    
    @Mapping(target = "sesionMesaId", source = "sesionMesa.id")
    @Mapping(target = "numeroMesa", source = "sesionMesa.mesa.numeroMesa")
    @Mapping(target = "usuarioNombre", source = "usuario.nombre")
    PedidoResponse toResponseDTO(Pedido pedido);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "sesionMesa.id", source = "sesionMesaId")
    @Mapping(target = "usuario.id", source = "usuarioId")
    @Mapping(target = "fechaHora", ignore = true) // Set in service
    @Mapping(target = "estado", constant = "PENDIENTE")
    @Mapping(target = "total", ignore = true) // Calculated in service
    Pedido toEntity(PedidoRequest pedidoRequest);
}
