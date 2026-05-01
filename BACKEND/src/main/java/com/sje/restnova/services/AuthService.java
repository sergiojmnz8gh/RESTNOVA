package com.sje.restnova.services;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sje.restnova.dtos.mapper.UsuarioMapper;
import com.sje.restnova.dtos.request.UsuarioRequest;
import com.sje.restnova.entities.Rol;
import com.sje.restnova.entities.Usuario;
import com.sje.restnova.exceptions.DuplicateResourceException;
import com.sje.restnova.exceptions.ResourceNotFoundException;
import com.sje.restnova.repositories.RolRepository;
import com.sje.restnova.repositories.UsuarioRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final UsuarioMapper usuarioMapper;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public Usuario registrarUsuario(UsuarioRequest request) {
        
        if (usuarioRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new DuplicateResourceException("El email ya está en uso");
        }

        Usuario usuario = usuarioMapper.toEntity(request);

        if (usuario.getPassword() == null || usuario.getPassword().trim().isEmpty()) {
            usuario.setPassword("temporal123");
        }

        usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));

        Rol rol = rolRepository.findByNombre(request.getRolNombre().toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Rol " + request.getRolNombre() + " no encontrado en el sistema"));
        
        usuario.setRol(rol);
        
        return usuarioRepository.save(usuario);
    }
}
