package com.sje.restnova.dtos.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.sje.restnova.dtos.request.DetallePedidoRequest;
import com.sje.restnova.dtos.response.DetallePedidoResponse;
import com.sje.restnova.entities.DetallePedido;

@Mapper(componentModel = "spring")
public interface DetallePedidoMapper {
    
    @Mapping(target = "pedidoId", source = "pedido.id")
    @Mapping(target = "productoNombre", source = "producto.nombre")
    DetallePedidoResponse toResponseDTO(DetallePedido detalle);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "producto.id", source = "productoId")
    @Mapping(target = "pedido", ignore = true) 
    @Mapping(target = "precioUnitario", ignore = true) 
    DetallePedido toEntity(DetallePedidoRequest detallePedidoRequest);
}

