package com.sje.restnova.controllers;

import com.sje.restnova.dtos.response.EstadisticaResponse;
import com.sje.restnova.services.EstadisticasService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/estadisticas")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class EstadisticasController {

    private final EstadisticasService estadisticasService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PERSONAL_SALA')")
    public ResponseEntity<EstadisticaResponse> getEstadisticas(Authentication authentication) {
        EstadisticaResponse fullReport = estadisticasService.getEstadisticasMensuales();
        
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin) {
            // El personal de sala no debe ver datos de facturación/monetarios
            return ResponseEntity.ok(EstadisticaResponse.builder()
                    .topProductos(fullReport.getTopProductos())
                    .totalPedidosMensual(fullReport.getTotalPedidosMensual())
                    .ocupacionMedia(fullReport.getOcupacionMedia())
                    .build());
        }

        return ResponseEntity.ok(fullReport);
    }
}
