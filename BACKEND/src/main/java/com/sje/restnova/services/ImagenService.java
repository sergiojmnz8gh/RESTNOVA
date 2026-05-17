package com.sje.restnova.services;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class ImagenService {

    private final String DIRECTORY = "/app/uploads/productos/";

    public String guardarImagenProducto(MultipartFile archivo, Integer id) {
        if (archivo == null || archivo.isEmpty()) {
            return null;
        }

        try {
            Path dirPath = Paths.get(DIRECTORY);
            if (!Files.exists(dirPath)) {
                Files.createDirectories(dirPath);
            }

            
            String originalFilename = archivo.getOriginalFilename();
            String extension = ".jpg"; 
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            
            String filename = id + extension;
            Path filePath = dirPath.resolve(filename);

            Files.copy(archivo.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            return "/productos/" + filename; 
        } catch (IOException e) {
            System.err.println("Error saving image: " + e.getMessage());
            return null;
        }
    }

    public String guardarImagenUsuario(MultipartFile archivo, Integer id) {
        if (archivo == null || archivo.isEmpty()) {
            return null;
        }

        try {
            Path dirPath = Paths.get("../FRONTEND/public/usuarios");
            if (!Files.exists(dirPath)) {
                dirPath = Paths.get("./FRONTEND/public/usuarios");
            }
            
            if (!Files.exists(dirPath)) {
                dirPath = Paths.get("/app/uploads/usuarios");
                if (!Files.exists(dirPath)) {
                    Files.createDirectories(dirPath);
                }
            } else {
                if (!Files.exists(dirPath)) {
                    Files.createDirectories(dirPath);
                }
            }

            String originalFilename = archivo.getOriginalFilename();
            String extension = ".jpg"; 
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            String filename = "user_" + id + extension;
            Path filePath = dirPath.resolve(filename);

            Files.copy(archivo.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            return "/usuarios/" + filename; 
        } catch (IOException e) {
            System.err.println("Error saving user image: " + e.getMessage());
            return null;
        }
    }
}

