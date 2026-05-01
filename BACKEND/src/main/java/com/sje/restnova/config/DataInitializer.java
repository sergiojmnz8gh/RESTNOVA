package com.sje.restnova.config;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.sje.restnova.entities.Categoria;
import com.sje.restnova.entities.Mesa;
import com.sje.restnova.entities.Producto;
import com.sje.restnova.entities.Reserva;
import com.sje.restnova.entities.Rol;
import com.sje.restnova.entities.Usuario;
import com.sje.restnova.repositories.CategoriaRepository;
import com.sje.restnova.repositories.MesaRepository;
import com.sje.restnova.repositories.ProductoRepository;
import com.sje.restnova.repositories.ReservaRepository;
import com.sje.restnova.repositories.RolRepository;
import com.sje.restnova.repositories.UsuarioRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;
    private final CategoriaRepository categoriaRepository;
    private final ProductoRepository productoRepository;
    private final MesaRepository mesaRepository;
    private final ReservaRepository reservaRepository;

    @Override
    public void run(String... args) {
        // 1. Roles
        Rol adminRol = getOrCreateRol("ADMIN");
        Rol clienteRol = getOrCreateRol("CLIENTE");
        Rol staffRol = getOrCreateRol("PERSONAL_SALA");
        Rol cocinaRol = getOrCreateRol("COCINA");

        // 2. Usuarios
        Usuario admin = getOrCreateAdmin(adminRol);
        getOrCreateCliente(clienteRol);
        getOrCreateStaff(staffRol);
        getOrCreateCocina(cocinaRol);

        // 3. Categorías
        Categoria entrantes = getOrCreateCategoria("Entrantes");
        Categoria carnes = getOrCreateCategoria("Carnes");
        Categoria pescados = getOrCreateCategoria("Pescados");
        Categoria postres = getOrCreateCategoria("Postres");
        Categoria bebidas = getOrCreateCategoria("Bebidas");

        // 4. Productos
        getOrCreateProducto("Croquetas Caseras", "8.50", entrantes);
        getOrCreateProducto("Patatas Bravas", "7.00", entrantes);
        getOrCreateProducto("Tabla de Quesos", "12.00", entrantes);
        getOrCreateProducto("Entrecot de Ternera", "22.50", carnes);
        getOrCreateProducto("Solomillo al Whisky", "18.00", carnes);
        getOrCreateProducto("Hamburguesa Gourmet", "14.50", carnes);
        getOrCreateProducto("Salmón a la Plancha", "19.00", pescados);
        getOrCreateProducto("Lubina al Horno", "21.00", pescados);
        getOrCreateProducto("Bacalao Dorado", "17.50", pescados);
        getOrCreateProducto("Tarta de Queso", "6.50", postres);
        getOrCreateProducto("Coulant de Chocolate", "7.00", postres);
        getOrCreateProducto("Fruta de Temporada", "4.50", postres);
        getOrCreateProducto("Vino Tinto Rioja", "18.00", bebidas);
        getOrCreateProducto("Cerveza Artesana", "4.50", bebidas);
        getOrCreateProducto("Refresco", "2.50", bebidas);
        getOrCreateProducto("Agua Mineral", "2.00", bebidas);

        // 5. Mesas
        for (int i = 1; i <= 10; i++) {
            getOrCreateMesa("M" + i, (i % 3 == 0) ? 6 : (i % 2 == 0 ? 4 : 2));
        }

        // 6. Reservas (para hoy si no hay ninguna)
        if (reservaRepository.findAll().isEmpty()) {
            createReserva(admin, LocalDate.now(), LocalTime.of(14, 0), 4);
            createReserva(admin, LocalDate.now(), LocalTime.of(21, 30), 2);
            createReserva(admin, LocalDate.now().plusDays(1), LocalTime.of(15, 0), 6);
        }
    }

    private Rol getOrCreateRol(String nombre) {
        return rolRepository.findByNombre(nombre)
                .orElseGet(() -> {
                    Rol rol = new Rol();
                    rol.setNombre(nombre);
                    return rolRepository.save(rol);
                });
    }

    private Usuario getOrCreateAdmin(Rol rol) {
        return usuarioRepository.findByEmail("admin@restnova.com")
                .orElseGet(() -> {
                    Usuario admin = new Usuario();
                    admin.setEmail("admin@restnova.com");
                    admin.setPassword(passwordEncoder.encode("admin123"));
                    admin.setNombre("Administrador");
                    admin.setApellidos("RESTNOVA");
                    admin.setTelefono("666666666");
                    admin.setRol(rol);
                    return usuarioRepository.save(admin);
                });
    }

    private Usuario getOrCreateCliente(Rol rol) {
        return usuarioRepository.findByEmail("sergio@email.com")
                .orElseGet(() -> {
                    Usuario cliente = new Usuario();
                    cliente.setEmail("sergio@email.com");
                    cliente.setPassword(passwordEncoder.encode("password123"));
                    cliente.setNombre("Sergio");
                    cliente.setApellidos("Cliente Prueba");
                    cliente.setTelefono("677777777");
                    cliente.setRol(rol);
                    return usuarioRepository.save(cliente);
                });
    }

    private Usuario getOrCreateStaff(Rol rol) {
        return usuarioRepository.findByEmail("camarero@restnova.com")
                .orElseGet(() -> {
                    Usuario camarero = new Usuario();
                    camarero.setEmail("camarero@restnova.com");
                    camarero.setPassword(passwordEncoder.encode("staff123"));
                    camarero.setNombre("Carlos");
                    camarero.setApellidos("Camarero");
                    camarero.setTelefono("655555555");
                    camarero.setRol(rol);
                    return usuarioRepository.save(camarero);
                });
    }

    private Usuario getOrCreateCocina(Rol rol) {
        return usuarioRepository.findByEmail("cocina@restnova.com")
                .orElseGet(() -> {
                    Usuario cocina = new Usuario();
                    cocina.setEmail("cocina@restnova.com");
                    cocina.setPassword(passwordEncoder.encode("cocina123"));
                    cocina.setNombre("Jefe");
                    cocina.setApellidos("Cocina");
                    cocina.setTelefono("644444444");
                    cocina.setRol(rol);
                    return usuarioRepository.save(cocina);
                });
    }

    private Categoria getOrCreateCategoria(String nombre) {
        return categoriaRepository.findAll().stream()
                .filter(c -> c.getNombre().equalsIgnoreCase(nombre))
                .findFirst()
                .orElseGet(() -> {
                    Categoria cat = new Categoria();
                    cat.setNombre(nombre);
                    return categoriaRepository.save(cat);
                });
    }

    private void getOrCreateProducto(String nombre, String precio, Categoria cat) {
        if (!productoRepository.findAll().stream().anyMatch(p -> p.getNombre().equalsIgnoreCase(nombre))) {
            Producto p = new Producto();
            p.setNombre(nombre);
            p.setPrecio(new BigDecimal(precio));
            p.setCategoria(cat);
            p.setDisponible(true);
            productoRepository.save(p);
        }
    }

    private void getOrCreateMesa(String numero, int capacidad) {
        if (!mesaRepository.findAll().stream().anyMatch(m -> m.getNumeroMesa().equalsIgnoreCase(numero))) {
            Mesa m = new Mesa();
            m.setNumeroMesa(numero);
            m.setCapacidad(capacidad);
            mesaRepository.save(m);
        }
    }

    private void createReserva(Usuario user, LocalDate fecha, LocalTime hora, int personas) {
        Reserva r = new Reserva();
        r.setUsuario(user);
        r.setFecha(fecha);
        r.setHora(hora);
        r.setNumPersonas(personas);
        r.setEstado(Reserva.EstadoReserva.CONFIRMADA);
        reservaRepository.save(r);
    }
}
