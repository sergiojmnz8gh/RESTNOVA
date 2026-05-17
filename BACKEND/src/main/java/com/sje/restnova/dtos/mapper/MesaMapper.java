package com.sje.restnova.dtos.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.sje.restnova.dtos.request.MesaRequest;
import com.sje.restnova.dtos.response.MesaResponse;
import com.sje.restnova.entities.Mesa;

@Mapper(componentModel = "spring")
public interface MesaMapper {
    
    MesaResponse toResponseDTO(Mesa mesa);

    @Mapping(target = "id", ignore = true)
    Mesa toEntity(MesaRequest mesaRequest);
}

