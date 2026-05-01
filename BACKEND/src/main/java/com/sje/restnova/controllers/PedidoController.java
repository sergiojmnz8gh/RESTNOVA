package com.sje.restnova.controllers;

import com.sje.restnova.dtos.response.PedidoResponse;
import com.sje.restnova.services.PedidoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pedidos")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class PedidoController {

    private final PedidoService pedidoService;

    @GetMapping
    public ResponseEntity<List<PedidoResponse>> getAllOrders() {
        return ResponseEntity.ok(pedidoService.getAllOrders());
    }

    @PostMapping
    public ResponseEntity<PedidoResponse> createOrder(@RequestBody @jakarta.validation.Valid com.sje.restnova.dtos.request.PedidoRequest request) {
        PedidoResponse response = pedidoService.createOrder(request);
        return org.springframework.http.ResponseEntity.status(org.springframework.http.HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<PedidoResponse> updateOrderStatus(@PathVariable Integer id, @RequestParam String status) {
        com.sje.restnova.entities.Pedido.EstadoPedido newStatus;
        try {
            newStatus = com.sje.restnova.entities.Pedido.EstadoPedido.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(pedidoService.updateStatus(id, newStatus));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable Integer id) {
        pedidoService.deleteOrder(id);
        return ResponseEntity.noContent().build();
    }
}
