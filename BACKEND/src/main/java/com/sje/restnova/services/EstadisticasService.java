package com.sje.restnova.services;

import com.sje.restnova.dtos.response.EstadisticaResponse;
import com.sje.restnova.entities.Pedido;
import com.sje.restnova.entities.DetallePedido;
import com.sje.restnova.repositories.PedidoRepository;
import com.sje.restnova.repositories.DetallePedidoRepository;
import com.sje.restnova.repositories.SesionMesaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EstadisticasService {

    private final PedidoRepository pedidoRepository;
    private final DetallePedidoRepository detallePedidoRepository;
    private final SesionMesaRepository sesionMesaRepository;

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public EstadisticaResponse getEstadisticasMensuales() {
        LocalDateTime startOfMonth = LocalDate.now().withDayOfMonth(1).atStartOfDay();

        List<Pedido> orders = pedidoRepository.findAll().stream()
                .filter(p -> p.getFechaHora().isAfter(startOfMonth))
                .toList();

        
        BigDecimal totalRevenue = orders.stream()
                .map(Pedido::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal avgTicket = orders.isEmpty() ? BigDecimal.ZERO : 
                totalRevenue.divide(BigDecimal.valueOf(orders.size()), 2, RoundingMode.HALF_UP);

        
        Map<String, BigDecimal> salesByDay = orders.stream()
                .collect(Collectors.groupingBy(
                        p -> p.getFechaHora().toLocalDate().toString(),
                        Collectors.reducing(BigDecimal.ZERO, Pedido::getTotal, BigDecimal::add)
                ));

        
        Map<String, BigDecimal> salesByCategory = orders.stream()
                .flatMap(p -> p.getDetalles().stream())
                .collect(Collectors.groupingBy(
                        d -> d.getProducto().getCategoria().getNombre(),
                        Collectors.reducing(BigDecimal.ZERO, 
                                d -> d.getPrecioUnitario().multiply(BigDecimal.valueOf(d.getCantidad())), 
                                BigDecimal::add)
                ));

        
        List<EstadisticaResponse.ProductoRanking> topProducts = orders.stream()
                .flatMap(p -> p.getDetalles().stream())
                .collect(Collectors.groupingBy(
                        d -> d.getProducto().getNombre(),
                        Collectors.summingLong(DetallePedido::getCantidad)
                ))
                .entrySet().stream()
                .map(e -> EstadisticaResponse.ProductoRanking.builder()
                        .nombre(e.getKey())
                        .cantidad(e.getValue())
                        .build())
                .sorted(Comparator.comparing(EstadisticaResponse.ProductoRanking::getCantidad).reversed())
                .limit(5)
                .collect(Collectors.toList());

        
        Map<String, BigDecimal> salesByPaymentMethod = orders.stream()
                .filter(p -> p.getMetodoPago() != null)
                .collect(Collectors.groupingBy(
                        p -> p.getMetodoPago().toString(),
                        Collectors.reducing(BigDecimal.ZERO, Pedido::getTotal, BigDecimal::add)
                ));

        
        long totalSessions = sesionMesaRepository.count();
        double occupancyRate = Math.min(100.0, (totalSessions * 10.0) / 100.0);

        return EstadisticaResponse.builder()
                .totalVentasMensual(totalRevenue)
                .ticketMedio(avgTicket)
                .ventasPorDia(salesByDay)
                .ventasPorCategoria(salesByCategory)
                .ventasPorMetodoPago(salesByPaymentMethod)
                .topProductos(topProducts)
                .totalPedidosMensual((long) orders.size())
                .ocupacionMedia(occupancyRate)
                .build();
    }
}

