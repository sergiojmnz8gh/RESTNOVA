package com.sje.restnova.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String projectDir = System.getProperty("user.dir");
        Path productosLocalPath = Paths.get(projectDir).getParent().resolve("FRONTEND/public/productos").normalize();
        Path usuariosLocalPath = Paths.get(projectDir).getParent().resolve("FRONTEND/public/usuarios").normalize();

        registry.addResourceHandler("/productos/**")
                .addResourceLocations("file:" + productosLocalPath.toString() + "/", "file:/app/uploads/productos/")
                .setCachePeriod(0);
        
        registry.addResourceHandler("/usuarios/**")
                .addResourceLocations("file:" + usuariosLocalPath.toString() + "/", "file:/app/uploads/usuarios/")
                .setCachePeriod(0);
    }

    @Override
    public void addCorsMappings(org.springframework.web.servlet.config.annotation.CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns("http://localhost:*", "http://127.0.0.1:*", "http://*.restnova.com")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}

