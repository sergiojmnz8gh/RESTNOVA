package com.sje.restnova.dtos.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.sje.restnova.dtos.request.SesionMesaRequest;
import com.sje.restnova.dtos.response.SesionMesaResponse;
import com.sje.restnova.entities.SesionMesa;

@Mapper(componentModel = "spring")
public interface SesionMesaMapper {
    
    @Mapping(target = "mesaId", source = "mesa.id")
    @Mapping(target = "numeroMesa", source = "mesa.numeroMesa")
    @Mapping(target = "camareroNombre", source = "camarero.nombre")
    SesionMesaResponse toResponseDTO(SesionMesa sesion);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "mesa.id", source = "mesaId")
    @Mapping(target = "camarero.id", source = "camareroId")
    @Mapping(target = "fechaApertura", ignore = true) 
    @Mapping(target = "fechaCierre", ignore = true)
    @Mapping(target = "tokenQr", ignore = true) 
    @Mapping(target = "codigoAcceso", ignore = true) 
    SesionMesa toEntity(SesionMesaRequest sesionMesaRequest);
}

