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
import com.sje.restnova.services.EmailService;

import lombok.RequiredArgsConstructor;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;

import java.util.Collections;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final UsuarioMapper usuarioMapper;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final String GOOGLE_CLIENT_ID = "748359950319-t1b4aa46jfrdfaesd1c4l491dt8u8agd.apps.googleusercontent.com";

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
        
        Usuario guardado = usuarioRepository.save(usuario);
        emailService.sendRegistrationEmail(guardado);
        return guardado;
    }

    @Transactional
    public Usuario processGoogleLogin(String credentialToken) throws Exception {
        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), GsonFactory.getDefaultInstance())
            .setAudience(Collections.singletonList(GOOGLE_CLIENT_ID))
            .build();

        GoogleIdToken idToken = verifier.verify(credentialToken);
        if (idToken != null) {
            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            
            return usuarioRepository.findByEmail(email).orElseGet(() -> {
                Usuario newUser = new Usuario();
                newUser.setEmail(email);
                
                String givenName = (String) payload.get("given_name");
                String familyName = (String) payload.get("family_name");
                String fullName = (String) payload.get("name");
                
                String nombre = givenName;
                String apellidos = familyName;
                
                if (nombre == null || nombre.trim().isEmpty()) {
                    if (fullName != null && !fullName.trim().isEmpty()) {
                        int spaceIdx = fullName.indexOf(' ');
                        if (spaceIdx != -1) {
                            nombre = fullName.substring(0, spaceIdx).trim();
                            apellidos = fullName.substring(spaceIdx + 1).trim();
                        } else {
                            nombre = fullName.trim();
                        }
                    } else {
                        nombre = email.substring(0, email.indexOf('@'));
                    }
                } else if (apellidos == null || apellidos.trim().isEmpty()) {
                    if (fullName != null && fullName.startsWith(nombre)) {
                        String rest = fullName.substring(nombre.length()).trim();
                        if (!rest.isEmpty()) {
                            apellidos = rest;
                        }
                    }
                }
                
                newUser.setNombre(nombre);
                newUser.setApellidos(apellidos != null ? apellidos : "");
                
                String phone = (String) payload.get("phone_number");
                newUser.setTelefono(phone != null ? phone : "");
                
                newUser.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
                
                String pictureUrl = (String) payload.get("picture");
                if (pictureUrl != null) {
                    newUser.setImagenUrl(pictureUrl); 
                }

                Rol rol = rolRepository.findByNombre("CLIENTE")
                        .orElseThrow(() -> new ResourceNotFoundException("Rol CLIENTE no encontrado"));
                newUser.setRol(rol);
                
                Usuario guardado = usuarioRepository.save(newUser);
                emailService.sendRegistrationEmail(guardado);
                return guardado;
            });
        } else {
            throw new IllegalArgumentException("Token de Google inválido");
        }
    }
}

