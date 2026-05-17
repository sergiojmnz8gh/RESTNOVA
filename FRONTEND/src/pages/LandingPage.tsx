import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Container, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Footer } from '../components/Footer';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../routes/routes';
import api from '../services/apiConfig';

export const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        document.body.classList.add('force-light-theme');
        return () => {
            document.body.classList.remove('force-light-theme');
        };
    }, []);

    const [starDishes, setStarDishes] = useState<any[]>([]);

    useEffect(() => {
        const fetchTopProducts = async () => {
            try {
                const response = await api.get('/productos/top');
                const apiTop = response.data || [];
                const fallbackDishes = [
                    { id: 1, title: 'Burrata Trufada', description: 'Burrata fresca de Puglia con crema de trufa negra fresca y rúcula.', price: '14.50€', image: '/productos/1.png' },
                    { id: 4, title: 'Risotto ai Funghi', description: 'Arroz carnaroli con boletus edulis frescos, parmesano y un toque de tomillo.', price: '18.00€', image: '/productos/4.png' },
                    { id: 12, title: 'Tiramisú della Nonna', description: 'Nuestra receta secreta con mascarpone artesano y café espresso.', price: '7.50€', image: '/productos/9.png' }
                ];

                const mappedApi = apiTop.map((p: any) => ({
                    id: p.id,
                    title: p.nombre,
                    description: p.descripcion,
                    price: `${p.precio.toFixed(2)}€`,
                    image: `/productos/${p.id}.png`
                }));


                const finalStarDishes = [...mappedApi];
                fallbackDishes.forEach(fb => {
                    if (finalStarDishes.length < 3 && !finalStarDishes.find(d => d.id === fb.id)) {
                        finalStarDishes.push(fb);
                    }
                });

                setStarDishes(finalStarDishes.slice(0, 3));
            } catch (error) {
                console.error("Error fetching top products", error);
            }
        };
        fetchTopProducts();
    }, []);

    return (
        <div className="landing-wrapper" data-theme="light">
            <Navbar transparentInitially={true} />

            <section
                id="home"
                className="hero-section vh-100 d-flex align-items-center position-relative overflow-hidden"
                style={{
                    backgroundImage: `linear-gradient(rgba(4, 8, 51, 0.75), rgba(4, 8, 51, 0.6)), url('/login-bg.png')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundAttachment: 'fixed'
                }}
            >
                <Container className="position-relative z-index-1 fade-in text-center text-lg-start">
                    <Row className="align-items-center">
                        <Col lg={7}>
                            <div className="d-flex align-items-center gap-3 mb-4 justify-content-center justify-content-lg-start">
                                <div className="flex-grow-0 border-top border-2 border-accent" style={{ width: '60px' }}></div>
                                <span className="text-accent fw-bold tracking-widest" style={{ letterSpacing: '6px', fontSize: '1rem' }}>IL SOGNO DI RESTNOVA</span>
                            </div>

                            <h1 className="display-2 fw-bold text-white mb-4" style={{ lineHeight: '0.9' }}>
                                EL ARTE DE LA <br /> <span className="text-accent">ALTA COCINA</span>
                            </h1>

                            <p className="lead text-light mb-5 fw-medium opacity-90" style={{ fontSize: '1.25rem', maxWidth: '600px' }}>
                                Disfruta de la auténtica comida ítalo-mediterránea en un ambiente moderno y acogedor. Ingredientes frescos, recetas caseras y un servicio excepcional acompañado de la mejor tecnología.
                            </p>

                            <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center justify-content-lg-start">
                                <Button
                                    onClick={() => navigate(ROUTES.RESERVA_CLIENTE)}
                                    variant="primary"
                                    size="lg"
                                    className="px-5 py-3 fw-bold shadow-lg"
                                >
                                    RESERVAR MESA
                                </Button>
                                <Button
                                    variant="outline-light"
                                    size="lg"
                                    className="px-5 py-3 fw-bold d-flex align-items-center gap-2"
                                    style={{ borderWidth: '2px' }}
                                    onClick={() => {
                                        if (isAuthenticated) {
                                            navigate(ROUTES.SCAN_QR);
                                        } else {
                                            navigate(ROUTES.LOGIN);
                                        }
                                    }}
                                >
                                    ESCANEAR <i className="bi bi-qr-code-scan ms-1"></i>
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </Container>

                <div className="position-absolute bottom-0 start-50 translate-middle-x mb-4 text-white animate-bounce d-none d-md-block">
                    <a href="#filosofia" className="text-white opacity-50">
                        <i className="bi bi-chevron-down fs-2"></i>
                    </a>
                </div>
            </section>

            <section id="filosofia" className="py-5 bg-white position-relative overflow-hidden">
                <Container className="py-5">
                    <Row className="align-items-center g-5">
                        <Col lg={6} className="order-2 order-lg-1">
                            <div className="pe-lg-5">
                                <div className="d-flex align-items-center gap-3 mb-4">
                                    <div className="bg-accent" style={{ width: '40px', height: '2px' }}></div>
                                    <span className="text-primary fw-bold text-uppercase tracking-widest small">Nuestra Esencia</span>
                                </div>
                                <h2 className="display-3 fw-bold mb-4 text-primary" style={{ lineHeight: '1.1' }}>
                                    SINFONÍA DE <br /> <span className="text-accent">EXCELENCIA</span>
                                </h2>
                                <p className="lead fw-medium mb-5 text-dark opacity-75" style={{ fontSize: '1.2rem' }}>
                                    Más que un restaurante, somos un laboratorio de sensaciones donde la herencia mediterránea evoluciona hacia el futuro.
                                    Fusionamos la calidez de lo clásico con la precisión de la innovación digital.
                                </p>

                                <Row className="g-4">
                                    <Col md={6}>
                                        <div className="p-4 bg-light rounded-4 shadow-sm h-100 border-bottom border-4 border-accent">
                                            <div className="d-flex align-items-center gap-3 mb-2">
                                                <i className="bi bi-cpu text-accent fs-4"></i>
                                                <h6 className="fw-bold text-primary mb-0 text-uppercase small tracking-widest">Digital First</h6>
                                            </div>
                                            <p className="text-muted small mb-0">Gestión inteligente para una experiencia fluida y sin esperas.</p>
                                        </div>
                                    </Col>
                                    <Col md={6}>
                                        <div className="p-4 bg-light rounded-4 shadow-sm h-100 border-bottom border-4 border-accent">
                                            <div className="d-flex align-items-center gap-3 mb-2">
                                                <i className="bi bi-award text-accent fs-4"></i>
                                                <h6 className="fw-bold text-primary mb-0 text-uppercase small tracking-widest">Alta Calidad</h6>
                                            </div>
                                            <p className="text-muted small mb-0">Selección rigurosa de materia prima de kilómetro cero.</p>
                                        </div>
                                    </Col>
                                </Row>

                                <div className="mt-5 d-flex align-items-center gap-4">
                                    <div className="text-center">
                                        <div className="h2 fw-bold text-primary mb-0">100%</div>
                                        <div className="small text-uppercase tracking-widest text-muted fw-bold" style={{ fontSize: '0.65rem' }}>Artesanía Digital</div>
                                    </div>
                                    <div className="vr opacity-25"></div>
                                    <div className="text-center">
                                        <div className="h2 fw-bold text-primary mb-0">0km</div>
                                        <div className="small text-uppercase tracking-widest text-muted fw-bold" style={{ fontSize: '0.65rem' }}>Producto Local</div>
                                    </div>
                                    <div className="vr opacity-25"></div>
                                    <div className="text-center">
                                        <div className="h2 fw-bold text-primary mb-0">TOP</div>
                                        <div className="small text-uppercase tracking-widest text-muted fw-bold" style={{ fontSize: '0.65rem' }}>Servicio Exclusive</div>
                                    </div>
                                </div>
                            </div>
                        </Col>
                        <Col lg={6} className="order-1 order-lg-2">
                            <div className="position-relative">
                                <div className="position-absolute top-50 start-50 translate-middle w-110 h-110 bg-light rounded-circle" style={{ zIndex: 0, width: '120%', height: '120%' }}></div>
                                <div className="p-3 bg-white shadow-premium rounded-4 position-relative z-index-1">
                                    <img
                                        src="/restaurant_interior.png"
                                        alt="Restaurante Interior"
                                        className="img-fluid rounded-4"
                                        style={{ objectFit: 'cover', minHeight: '550px', width: '100%' }}
                                    />
                                    <div className="position-absolute top-0 end-0 m-5 translate-middle-y">
                                        <div className="bg-accent text-primary p-4 rounded-circle shadow-lg d-flex flex-column align-items-center justify-content-center" style={{ width: '100px', height: '100px' }}>
                                            <span className="h4 fw-bold mb-0">Desde</span>
                                            <span className="small fw-bold">2026</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>

            <section id="carta" className="py-5 bg-primary text-white overflow-hidden">
                <Container className="py-5">
                    <div className="text-center mb-5 fade-in">
                        <div className="d-flex align-items-center justify-content-center gap-3 mb-3">
                            <div className="bg-accent" style={{ width: '30px', height: '1px' }}></div>
                            <span className="text-white fw-bold text-uppercase tracking-widest small" style={{ letterSpacing: '4px' }}>Experiencia Gastronómica</span>
                            <div className="bg-accent" style={{ width: '30px', height: '1px' }}></div>
                        </div>
                        <h2 className="display-1 fw-bold mb-0 text-accent" style={{ letterSpacing: '-2px', color: 'var(--color-accent)' }}>PLATOS ESTRELLA</h2>
                        <p className="lead text-white opacity-50 mt-3 fw-light text-uppercase tracking-widest mb-0" style={{ fontSize: '0.9rem' }}>Los favoritos de nuestros clientes</p>
                    </div>

                    <Row className="g-4">
                        {starDishes.map((dish, index) => (
                            <Col md={4} key={dish.id || index}>
                                <Card className="bg-white border-0 h-100 text-center overflow-hidden shadow-sm hover-lift transition-all">
                                    <div className="position-relative overflow-hidden" style={{ height: '250px' }}>
                                        <Card.Img
                                            variant="top"
                                            src={dish.image}
                                            className="h-100 w-100 object-fit-cover transition-all"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000&auto=format&fit=crop';
                                            }}
                                        />
                                    </div>
                                    <Card.Body className="p-4 d-flex flex-column justify-content-between h-100">
                                        <div className="d-flex flex-column flex-grow-1">
                                            <h4 className="fw-bold text-primary text-uppercase mb-2 text-center d-flex align-items-center justify-content-center" style={{ color: 'var(--color-primary)', fontSize: '1.2rem', minHeight: '54px' }}>
                                                {dish.title}
                                            </h4>
                                            <div className="text-accent fw-bold fs-5 mb-3 text-center">
                                                {dish.price}
                                            </div>
                                            <p className="text-secondary small mb-0 text-center flex-grow-1" style={{ fontWeight: '500', color: 'var(--color-text-muted)' }}>
                                                {dish.description}
                                            </p>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>

                    <div className="text-center mt-5">
                        <Button
                            variant="primary"
                            className="px-5 py-3 fw-bold"
                            onClick={() => navigate(ROUTES.MENU)}
                        >
                            VER CARTA COMPLETA
                        </Button>
                    </div>
                </Container>
            </section>

            <Footer />

            <style>{`
                .landing-wrapper {
                    background-color: #F5F5F5;
                    color: var(--color-primary);
                    transition: all 0.3s ease;
                }
                .nav-link-custom {
                    position: relative;
                    transition: color 0.3s ease;
                }
                .nav-link-custom::after {
                    content: '';
                    position: absolute;
                    width: 0;
                    height: 2px;
                    bottom: 0;
                    left: 0;
                    background-color: var(--color-accent);
                    transition: width 0.3s ease;
                }
                .nav-link-custom:hover::after {
                    width: 100%;
                }
                .hero-section {
                    background-attachment: fixed;
                }
                .animate-bounce {
                    animation: bounce 2s infinite;
                }
                @keyframes bounce {
                    0%, 20%, 50%, 80%, 100% {transform: translateY(0);}
                    40% {transform: translateY(-10px);}
                    60% {transform: translateY(-5px);}
                }
                
                .btn-primary {
                    background-color: var(--color-accent) !important;
                    border-color: var(--color-accent) !important;
                    color: var(--color-primary) !important;
                    font-weight: bold !important;
                }
            `}</style>
        </div>
    );
};
