package com.sje.restnova.dtos.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.sje.restnova.dtos.request.UsuarioRequest;
import com.sje.restnova.dtos.response.UsuarioResponse;
import com.sje.restnova.entities.Usuario;

@Mapper(componentModel = "spring")
public interface UsuarioMapper {
    
    @Mapping(target = "rolNombre", source = "rol.nombre")
    UsuarioResponse toResponseDTO(Usuario usuario);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "puntosAcumulados", constant = "0.0")
    @Mapping(target = "rol", ignore = true) 
    @Mapping(target = "authorities", ignore = true)
    Usuario toEntity(UsuarioRequest usuarioRequest);
}

