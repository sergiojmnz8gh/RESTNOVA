package com.sje.restnova.services;

import com.sje.restnova.dtos.mapper.UsuarioMapper;
import com.sje.restnova.dtos.response.UsuarioResponse;
import com.sje.restnova.repositories.UsuarioRepository;
import com.sje.restnova.repositories.RolRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final UsuarioMapper usuarioMapper;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;

    public List<UsuarioResponse> getAllUsers() {
        return usuarioRepository.findAll().stream()
                .map(usuarioMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public UsuarioResponse updateUser(Integer id, com.sje.restnova.dtos.request.UsuarioRequest request) {
        com.sje.restnova.entities.Usuario userEntity = usuarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        
        userEntity.setNombre(request.getNombre());
        userEntity.setApellidos(request.getApellidos());
        userEntity.setEmail(request.getEmail());
        userEntity.setTelefono(request.getTelefono());
        
        
        if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
            userEntity.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        
        if (request.getRolNombre() != null && !request.getRolNombre().trim().isEmpty()) {
            com.sje.restnova.entities.Rol rol = rolRepository.findByNombre(request.getRolNombre().toUpperCase())
                    .orElseThrow(() -> new com.sje.restnova.exceptions.ResourceNotFoundException("Rol " + request.getRolNombre() + " no encontrado"));
            userEntity.setRol(rol);
        }
        
        com.sje.restnova.entities.Usuario savedUser = usuarioRepository.save(userEntity);
        return usuarioMapper.toResponseDTO(savedUser);
    }

    @Transactional
    public void deleteUser(Integer id) {
        if (!usuarioRepository.existsById(id)) {
            throw new com.sje.restnova.exceptions.ResourceNotFoundException("Usuario no encontrado");
        }
        usuarioRepository.deleteById(id);
    }

    @Transactional
    public UsuarioResponse updateUserImage(Integer id, String imagenUrl) {
        com.sje.restnova.entities.Usuario userEntity = usuarioRepository.findById(id)
                .orElseThrow(() -> new com.sje.restnova.exceptions.ResourceNotFoundException("Usuario no encontrado"));
        userEntity.setImagenUrl(imagenUrl);
        return usuarioMapper.toResponseDTO(usuarioRepository.save(userEntity));
    }

    

    @Transactional(readOnly = true)
    public UsuarioResponse getProfile(com.sje.restnova.entities.Usuario currentUser) {
        com.sje.restnova.entities.Usuario userEntity = usuarioRepository.findById(currentUser.getId())
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        return usuarioMapper.toResponseDTO(userEntity);
    }

    @Transactional
    public UsuarioResponse updateProfile(com.sje.restnova.entities.Usuario currentUser, Map<String, Object> updates) {
        com.sje.restnova.entities.Usuario userEntity = usuarioRepository.findById(currentUser.getId())
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        
        if (updates.containsKey("nombre")) userEntity.setNombre((String) updates.get("nombre"));
        if (updates.containsKey("apellidos")) userEntity.setApellidos((String) updates.get("apellidos"));
        if (updates.containsKey("email")) userEntity.setEmail((String) updates.get("email"));
        if (updates.containsKey("telefono")) userEntity.setTelefono((String) updates.get("telefono"));
        
        if (updates.containsKey("password") && updates.get("password") != null && !((String) updates.get("password")).trim().isEmpty()) {
            userEntity.setPassword(passwordEncoder.encode((String) updates.get("password")));
        }
        
        return usuarioMapper.toResponseDTO(usuarioRepository.save(userEntity));
    }

    @Transactional
    public void changePassword(com.sje.restnova.entities.Usuario currentUser, Map<String, String> passwordData) {
        com.sje.restnova.entities.Usuario userEntity = usuarioRepository.findById(currentUser.getId())
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        
        String newPassword = passwordData.get("newPassword");
        if (newPassword != null && !newPassword.trim().isEmpty()) {
            userEntity.setPassword(passwordEncoder.encode(newPassword));
            usuarioRepository.save(userEntity);
        }
    }
}
