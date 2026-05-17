import React, { useState, useEffect } from 'react';
import { Container, Nav, Navbar as BSNavbar, Button, Offcanvas, Image } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../routes/routes';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';

interface NavbarProps {
    transparentInitially?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ transparentInitially = false }) => {
    const [scrolled, setScrolled] = useState(false);
    const [showOffcanvas, setShowOffcanvas] = useState(false);
    const { isAuthenticated, logout, user } = useAuth();
    const { isDarkMode, toggleDarkMode } = useUI();
    const navigate = useNavigate();

    useEffect(() => {
        if (!transparentInitially) return;
        
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [transparentInitially]);

    const isTransparent = transparentInitially && !scrolled;
    const navbarBg = isTransparent ? 'transparent' : 'var(--color-primary)';
    
    const handleLogout = () => {
        logout();
        navigate(ROUTES.LOGIN);
        setShowOffcanvas(false);
    };

    const normalizedRole = (user?.rol || '').replace('ROLE_', '').toUpperCase();
    const isStaffOrAdmin = ['ADMIN', 'CAMARERO'].includes(normalizedRole);
    const isCustomer = normalizedRole === 'CLIENTE';

    return (
        <BSNavbar 
            expand="lg" 
            fixed="top" 
            variant="dark"
            className={`transition-all duration-300 py-2 ${scrolled || !transparentInitially ? 'shadow-lg' : ''}`}
            style={{ backgroundColor: navbarBg, backdropFilter: isTransparent ? 'none' : 'blur(10px)' }}
        >
            <Container>
                <BSNavbar.Brand as={Link} to={ROUTES.LANDING} className="d-flex align-items-center">
                    <img 
                        src="/logo_white.png" 
                        alt="Restnova" 
                        style={{ height: scrolled || !transparentInitially ? '40px' : '55px', transition: 'height 0.3s' }} 
                    />
                </BSNavbar.Brand>

                <BSNavbar.Toggle 
                    aria-controls="basic-navbar-nav" 
                    className="border-0 shadow-none text-white" 
                    onClick={() => setShowOffcanvas(true)}
                />

                {}
                <BSNavbar.Collapse id="basic-navbar-nav" className="d-none d-lg-flex justify-content-end">
                    <Nav className="align-items-center gap-3">
                        <Nav.Link as={Link} to={ROUTES.LANDING} className="text-white fw-bold text-uppercase nav-link-custom mx-3">Inicio</Nav.Link>
                        <Nav.Link as={Link} to={ROUTES.MENU} className="text-white fw-bold text-uppercase nav-link-custom mx-3">La Carta</Nav.Link>
                        
                        {isAuthenticated ? (
                            <div className="ms-auto d-flex align-items-center gap-4">
                                {isCustomer && (
                                    <div className="d-flex align-items-center gap-1">
                                        <Nav.Link as={Link} to={ROUTES.RESERVA_CLIENTE} className="text-white fw-bold text-uppercase nav-link-custom mx-2">
                                            Reservar
                                        </Nav.Link>
                                        <Nav.Link as={Link} to={ROUTES.SCAN_QR} className="text-white d-flex align-items-center gap-2 mx-2 nav-link-custom">
                                            <i className="bi bi-qr-code-scan text-accent"></i> PEDIR
                                        </Nav.Link>
                                    </div>
                                )}

                                {isStaffOrAdmin && (
                                    <Button variant="primary" size="sm" className="fw-bold px-3 py-2 ms-2" onClick={() => navigate(ROUTES.DASHBOARD)}>
                                        PANEL CONTROL
                                    </Button>
                                )}
                                
                                <Nav.Link 
                                    as={Link} 
                                    to={ROUTES.PERFIL} 
                                    className="user-nav-item d-flex align-items-center gap-3 border-start border-white border-opacity-10 ps-4 ms-2 py-0 text-white text-decoration-none"
                                    style={{ opacity: 0.85 }}
                                >
                                    <div className="position-relative">
                                        {user?.imagenUrl ? (
                                            <Image 
                                                src={user.imagenUrl.startsWith('http') ? user.imagenUrl : `http://localhost:8080${user.imagenUrl}`} 
                                                roundedCircle 
                                                className="border border-2 border-accent shadow-sm"
                                                style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <i className="bi bi-person-circle fs-3 text-accent"></i>
                                        )}
                                    </div>
                                    <span className="text-white small fw-bold text-uppercase d-none d-xl-block">{user?.nombre}</span>
                                </Nav.Link>
                                
                                <Button variant="link" size="sm" className="text-danger p-2 ms-1 border-0 text-decoration-none opacity-75 hover-opacity-100 transition-all" onClick={handleLogout} title="Cerrar Sesión">
                                    <i className="bi bi-box-arrow-right fs-5"></i>
                                </Button>

                                {!['/', '/menu', '/login', '/registro'].includes(window.location.pathname) && (
                                    <Button variant="link" className="text-white p-0 ms-3 shadow-none hvr-grow" onClick={toggleDarkMode}>
                                        <i className={`bi bi-${isDarkMode ? 'sun-fill text-warning' : 'moon-stars-fill'} fs-5`}></i>
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="ms-auto d-flex gap-3">
                                <Button variant="outline-light" className="fw-bold px-4 py-2" onClick={() => navigate(ROUTES.LOGIN)}>
                                    INICIAR SESIÓN
                                </Button>
                                <Button variant="primary" className="fw-bold px-4 py-2" onClick={() => navigate(ROUTES.REGISTER)}>
                                    REGISTRARSE
                                </Button>
                            </div>
                        )}
                    </Nav>
                </BSNavbar.Collapse>

                {}
                <Offcanvas 
                    show={showOffcanvas} 
                    onHide={() => setShowOffcanvas(false)} 
                    placement="end"
                    className="bg-primary text-white border-0"
                    style={{ width: '320px' }}
                >
                    <Offcanvas.Header closeButton closeVariant="white" className="border-bottom border-white border-opacity-10 p-4">
                        <Offcanvas.Title className="fw-bold fs-3 text-accent tracking-tighter brand-font">RESTNOVA</Offcanvas.Title>
                    </Offcanvas.Header>
                    <Offcanvas.Body className="p-0 d-flex flex-column h-100">
                        <div className="p-4 flex-grow-1">
                            <Nav className="flex-column gap-3">
                                <Nav.Link as={Link} to={ROUTES.LANDING} onClick={() => setShowOffcanvas(false)} className="text-white d-flex align-items-center fs-5 fw-bold nav-link-custom">
                                    <i className="bi bi-house-door me-3 text-accent fs-4"></i> INICIO
                                </Nav.Link>
                                <Nav.Link as={Link} to={ROUTES.MENU} onClick={() => setShowOffcanvas(false)} className="text-white d-flex align-items-center fs-5 fw-bold nav-link-custom">
                                    <i className="bi bi-book me-3 text-accent fs-4"></i> LA CARTA
                                </Nav.Link>
                                
                                {isAuthenticated && (
                                    <>
                                        <hr className="opacity-25" />
                                        <Nav.Link as={Link} to={ROUTES.PERFIL} onClick={() => setShowOffcanvas(false)} className="text-white d-flex align-items-center fs-5 fw-bold nav-link-custom">
                                            <i className="bi bi-person me-3 text-accent fs-4"></i> MI PERFIL
                                        </Nav.Link>
                                        
                                        {isCustomer && (
                                            <>
                                                <Nav.Link as={Link} to={ROUTES.RESERVA_CLIENTE} onClick={() => setShowOffcanvas(false)} className="text-white d-flex align-items-center fs-5 fw-bold nav-link-custom">
                                                    <i className="bi bi-calendar-check me-3 text-accent fs-4"></i> RESERVAR MESA
                                                </Nav.Link>
                                                <Nav.Link as={Link} to={ROUTES.SCAN_QR} onClick={() => setShowOffcanvas(false)} className="text-white d-flex align-items-center fs-5 fw-bold nav-link-custom">
                                                    <i className="bi bi-qr-code-scan me-3 text-accent fs-4"></i> PEDIR EN MESA
                                                </Nav.Link>
                                            </>
                                        )}

                                        {isStaffOrAdmin && (
                                            <Nav.Link as={Link} to={ROUTES.DASHBOARD} onClick={() => setShowOffcanvas(false)} className="text-white d-flex align-items-center fs-5 fw-bold nav-link-custom">
                                                <i className="bi bi-speedometer2 me-3 text-accent fs-4"></i> PANEL CONTROL
                                            </Nav.Link>
                                        )}
                                    </>
                                )}
                            </Nav>
                        </div>
                        
                        <div className="p-4 bg-black bg-opacity-25 border-top border-white border-opacity-10 mt-auto">
                            {isAuthenticated ? (
                                <>
                                    <div className="d-flex align-items-center gap-3 mb-4">
                                        <div className="bg-accent rounded-circle p-1">
                                            <i className="bi bi-person-fill text-primary fs-4"></i>
                                        </div>
                                        <div className="overflow-hidden">
                                            <div className="fw-bold text-truncate">{user?.nombre}</div>
                                            <div className="small text-white text-opacity-50 text-truncate">{user?.email}</div>
                                        </div>
                                    </div>
                                    <Button variant="link" className="w-100 fw-bold border-0 text-start ps-0 text-danger text-decoration-none opacity-75 hover-opacity-100 transition-all" onClick={handleLogout}>
                                        <i className="bi bi-box-arrow-right me-3 fs-5"></i> CERRAR SESIÓN
                                    </Button>
                                </>
                            ) : (
                                <div className="d-grid gap-3">
                                    <Button variant="outline-light" className="fw-bold py-2" onClick={() => {navigate(ROUTES.LOGIN); setShowOffcanvas(false);}}>
                                        INICIAR SESIÓN
                                    </Button>
                                    <Button variant="primary" className="fw-bold py-2" onClick={() => {navigate(ROUTES.REGISTER); setShowOffcanvas(false);}}>
                                        REGISTRARSE
                                    </Button>
                                </div>
                            )}
                        </div>
                    </Offcanvas.Body>
                </Offcanvas>
            </Container>
        </BSNavbar>
    );
};
