package com.sje.restnova.services;

import com.sje.restnova.dtos.mapper.UsuarioMapper;
import com.sje.restnova.dtos.response.UsuarioResponse;
import com.sje.restnova.repositories.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final UsuarioMapper usuarioMapper;

    public List<UsuarioResponse> getAllUsers() {
        return usuarioRepository.findAll().stream()
                .map(usuarioMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    public UsuarioResponse updateUser(Integer id, com.sje.restnova.dtos.request.UsuarioRequest request) {
        com.sje.restnova.entities.Usuario userEntity = usuarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        
        userEntity.setNombre(request.getNombre());
        userEntity.setApellidos(request.getApellidos());
        userEntity.setEmail(request.getEmail());
        userEntity.setTelefono(request.getTelefono());
        
        com.sje.restnova.entities.Usuario savedUser = usuarioRepository.save(userEntity);
        return usuarioMapper.toResponseDTO(savedUser);
    }

    public void deleteUser(Integer id) {
        if (!usuarioRepository.existsById(id)) {
            throw new IllegalArgumentException("Usuario no encontrado");
        }
        usuarioRepository.deleteById(id);
    }
}
