package com.sje.restnova.config;

import com.sje.restnova.entities.*;
import com.sje.restnova.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final CategoriaRepository categoriaRepository;
    private final ProductoRepository productoRepository;
    private final MesaRepository mesaRepository;
    private final PasswordEncoder passwordEncoder;
    private final ReservaRepository reservaRepository;

    @Override
    public void run(String... args) throws Exception {
        
        Rol adminRol = getOrCreateRol("ADMIN");
        Rol clienteRol = getOrCreateRol("CLIENTE");
        Rol camareroRol = getOrCreateRol("CAMARERO");
        Rol cocinaRol = getOrCreateRol("COCINA");

        
        getOrCreateAdmin(adminRol);
        Usuario cliente = getOrCreateCliente(clienteRol);
        getOrCreateStaff(camareroRol);
        getOrCreateCocina(cocinaRol);

        
        getOrCreateMesa("M1", 4);
        getOrCreateMesa("M2", 2);
        getOrCreateMesa("M3", 6);
        getOrCreateMesa("M4", 4);
        getOrCreateMesa("M5", 2);

        
        Categoria antipasti = getOrCreateCategoria("ANTIPASTI", 1);
        Categoria pasta = getOrCreateCategoria("PASTA FRESCA", 2);
        Categoria pizze = getOrCreateCategoria("PIZZE ARTIGIANALE", 3);
        Categoria carne = getOrCreateCategoria("CARNI E SPECIALITÀ", 4);
        Categoria dolce = getOrCreateCategoria("DOLCI", 5);
        Categoria bibite = getOrCreateCategoria("BIBITE E VINI", 6);

        
        
        getOrCreateProducto("Burrata Trufada", "14.50", antipasti, "Burrata fresca de Puglia con crema de trufa negra fresca y rúcula.", "/productos/1.png");
        getOrCreateProducto("Carpaccio di Manzo", "16.00", antipasti, "Finas láminas de solomillo de ternera con lascas de parmesano 24 meses y aceite de albahaca.", "/productos/2.png");
        getOrCreateProducto("Bruschetta Pomodoro", "8.50", antipasti, "Pan artesano tostado con tomate San Marzano, ajo, albahaca fresca y AOVE.", "/productos/3.png");
        getOrCreateProducto("Melanzane alla Parmigiana", "12.00", antipasti, "Capas de berenjena frita, salsa de tomate casera, mozzarella y parmesano al horno.", "/productos/10.png");

        
        getOrCreateProducto("Risotto ai Funghi", "18.00", pasta, "Arroz carnaroli con boletus edulis frescos, parmesano y un toque de tomillo.", "/productos/4.png");
        getOrCreateProducto("Tagliatelle al Ragu", "15.50", pasta, "Pasta fresca al huevo con nuestra salsa boloñesa tradicional cocinada a fuego lento.", "/productos/5.png");
        getOrCreateProducto("Lasagna Classica", "14.00", pasta, "Pasta fresca, carne de ternera selecta, bechamel cremosa y gratín de quesos italianos.", "/productos/6.png");
        getOrCreateProducto("Gnocchi alla Sorrentina", "13.50", pasta, "Gnocchi de patata artesanos con salsa de tomate, mozzarella fundida y albahaca.", "/productos/11.png");
        getOrCreateProducto("Spaghetti alla Carbonara", "14.50", pasta, "La receta auténtica: yema de huevo, pecorino romano, guanciale y pimienta negra.", "/productos/12.png");

        
        getOrCreateProducto("Pizza Margherita", "11.00", pizze, "Tomate San Marzano, mozzarella fior di latte, albahaca fresca y AOVE.", "/productos/7.png");
        getOrCreateProducto("Pizza Prosciutto e Funghi", "13.50", pizze, "Tomate, mozzarella, jamón cocido de alta calidad y champiñones frescos.", "/productos/8.png");
        getOrCreateProducto("Pizza Diavola", "14.00", pizze, "Tomate, mozzarella, salami picante italiano y aceitunas negras.", "/productos/13.png");
        getOrCreateProducto("Pizza Quattro Formaggi", "14.50", pizze, "Mozzarella, gorgonzola, parmesano y provolone.", "/productos/14.png");
        getOrCreateProducto("Pizza Tartufata", "16.50", pizze, "Crema de trufa, mozzarella, setas silvestres y aceite de trufa blanca.", "/productos/15.png");

        
        getOrCreateProducto("Tagliata di Manzo", "22.00", carne, "Lomo de ternera a la brasa con rúcula, tomates cherry y escamas de parmesano.", "/productos/16.png");
        getOrCreateProducto("Ossobuco alla Milanese", "24.00", carne, "Jarrete de ternera estofado con verduras, vino blanco y gremolata.", "/productos/17.png");
        getOrCreateProducto("Pollo alla Cacciatora", "16.50", carne, "Pollo campero guisado con tomate, aceitunas, alcaparras y hierbas aromáticas.", "/productos/18.png");

        
        getOrCreateProducto("Tiramisú della Nonna", "7.50", dolce, "Nuestra receta secreta con mascarpone artesano, bizcochos savoiardi y café espresso.", "/productos/9.png");
        getOrCreateProducto("Panna Cotta ai Frutti di Bosco", "6.50", dolce, "Crema de nata cocida con vainilla natural y coulis de frutos rojos.", "/productos/19.png");
        getOrCreateProducto("Cannoli Siciliani", "7.00", dolce, "Tubos de masa crujiente rellenos de crema de ricotta dulce y pistachos.", "/productos/20.png");
        getOrCreateProducto("Gelato Artigianale", "5.50", dolce, "Tres bolas de helado artesano a elegir: Vainilla, Chocolate o Pistacho.", "/productos/21.png");

        
        getOrCreateProducto("Vino Chianti Classico", "18.00", bibite, "Vino tinto toscano con notas de cereza y violeta. Botella 750ml.", "/productos/22.png");
        getOrCreateProducto("Prosecco Superiore", "21.00", bibite, "Vino espumoso italiano, fresco y afrutado. Botella 750ml.", "/productos/23.png");
        getOrCreateProducto("Birra Peroni", "3.50", bibite, "Cerveza italiana premium, equilibrada y refrescante. 330ml.", "/productos/24.png");
        getOrCreateProducto("Acqua Panna", "3.00", bibite, "Agua mineral natural sin gas de la Toscana. 500ml.", "/productos/25.png");
        getOrCreateProducto("Limoncello Spritz", "7.50", bibite, "Refrescante cóctel con limoncello, prosecco y soda.", "/productos/26.png");

        
        for (Producto p : productoRepository.findAll()) {
            if (p.getDescripcion() == null || p.getDescripcion().trim().isEmpty()) {
                p.setDescripcion("Exquisito plato elaborado al estilo tradicional con ingredientes frescos seleccionados.");
                productoRepository.save(p);
            }
        }
        
        createReserva(cliente, LocalDate.now(), LocalTime.of(14, 0), 2);
    }

    private Rol getOrCreateRol(String nombre) {
        return rolRepository.findByNombre(nombre)
                .orElseGet(() -> {
                    Rol rol = new Rol();
                    rol.setNombre(nombre);
                    return rolRepository.save(rol);
                });
    }

    private void getOrCreateAdmin(Rol rol) {
        if (usuarioRepository.findByEmail("admin@restnova.com").isEmpty()) {
            Usuario admin = new Usuario();
            admin.setEmail("admin@restnova.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setNombre("Sergio");
            admin.setApellidos("Admin");
            admin.setTelefono("600000000");
            admin.setRol(rol);
            usuarioRepository.save(admin);
        }
    }

    private Usuario getOrCreateCliente(Rol rol) {
        return usuarioRepository.findByEmail("cliente@restnova.com")
                .orElseGet(() -> {
                    Usuario cliente = new Usuario();
                    cliente.setEmail("cliente@restnova.com");
                    cliente.setPassword(passwordEncoder.encode("cliente123"));
                    cliente.setNombre("Carlos");
                    cliente.setApellidos("Cliente");
                    cliente.setTelefono("677777777");
                    cliente.setRol(rol);
                    return usuarioRepository.save(cliente);
                });
    }

    private Usuario getOrCreateStaff(Rol rol) {
        return usuarioRepository.findByEmail("sala@restnova.com")
                .orElseGet(() -> {
                    Usuario camarero = new Usuario();
                    camarero.setEmail("sala@restnova.com");
                    camarero.setPassword(passwordEncoder.encode("sala123"));
                    camarero.setNombre("Elena");
                    camarero.setApellidos("Sala");
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

    private Categoria getOrCreateCategoria(String nombre, int orden) {
        return categoriaRepository.findAll().stream()
                .filter(c -> c.getNombre().equalsIgnoreCase(nombre))
                .findFirst()
                .orElseGet(() -> {
                    Categoria cat = new Categoria();
                    cat.setNombre(nombre);
                    cat.setOrden(orden);
                    return categoriaRepository.save(cat);
                });
    }

    private void getOrCreateProducto(String nombre, String precio, Categoria cat, String desc, String imagenUrl) {
        Optional<Producto> existente = productoRepository.findAll().stream()
                .filter(p -> p.getNombre().equalsIgnoreCase(nombre))
                .findFirst();
                
        if (existente.isEmpty()) {
            Producto p = new Producto();
            p.setNombre(nombre);
            p.setPrecio(new BigDecimal(precio));
            p.setCategoria(cat);
            p.setDescripcion(desc);
            p.setDisponible(true);
            p.setActivo(true);
            if (imagenUrl != null) {
                p.setImagenUrl(imagenUrl);
            }
            productoRepository.save(p);
        } else {
            
            Producto p = existente.get();
            p.setDescripcion(desc);
            if (imagenUrl != null) p.setImagenUrl(imagenUrl);
            p.setCategoria(cat);
            p.setActivo(true);
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
