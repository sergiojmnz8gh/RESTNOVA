package com.sje.restnova.dtos.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.sje.restnova.dtos.request.PagoRequest;
import com.sje.restnova.dtos.response.PagoResponse;
import com.sje.restnova.entities.Pago;

@Mapper(componentModel = "spring")
public interface PagoMapper {
    
    @Mapping(target = "pedidoId", source = "pedido.id")
    PagoResponse toResponseDTO(Pago pago);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "pedido.id", source = "pedidoId")
    @Mapping(target = "monto", ignore = true) 
    @Mapping(target = "fechaPago", ignore = true) 
    Pago toEntity(PagoRequest pagoRequest);
}

