import React, { useState } from 'react';
import { Navbar, Container, Nav, Offcanvas } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../routes/routes';

import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';

export const MobileNavbar: React.FC = () => {
    const [show, setShow] = useState(false);
    const navigate = useNavigate();
    const { logout, user } = useAuth();
    const { isDarkMode, toggleDarkMode } = useUI();

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const handleLogout = () => {
        logout();
        navigate(ROUTES.LOGIN);
        handleClose();
    };

    const canSeeAdmin = user?.rol === 'ADMIN';
    const canSeeStaff = user?.rol === 'ADMIN' || user?.rol === 'PERSONAL_SALA';

    return (
        <Navbar expand={false} className="bg-navy-brand navbar-dark d-md-none sticky-top shadow-sm px-2">
            <Container fluid>
                <Navbar.Brand as={Link} to={ROUTES.DASHBOARD} className="p-0 border-0">
                    <img 
                        src="/logo_white.png" 
                        alt="Restnova Logo" 
                        style={{ height: '40px', width: 'auto' }} 
                    />
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="offcanvasNavbar" onClick={handleShow} className="border-0 shadow-none" />
                <Navbar.Offcanvas
                    id="offcanvasNavbar"
                    aria-labelledby="offcanvasNavbarLabel"
                    placement="end"
                    show={show}
                    onHide={handleClose}
                    className="bg-navy-brand text-white"
                >
                    <Offcanvas.Header closeButton closeVariant="white" className="p-4 border-bottom border-white border-opacity-10">
                        <Offcanvas.Title id="offcanvasNavbarLabel" className="fw-bold text-accent fs-1 italic">
                            MENÚ
                        </Offcanvas.Title>
                    </Offcanvas.Header>
                    <Offcanvas.Body className="p-4">
                        <Nav className="justify-content-end flex-grow-1 fs-4 gap-4">
                            <Nav.Link as={Link} to={ROUTES.DASHBOARD} onClick={handleClose} className="text-white d-flex align-items-center p-0 italic">
                                <i className="bi bi-house-door me-3 text-accent"></i> INICIO
                            </Nav.Link>

                            {canSeeAdmin && (
                                <>
                                    <Nav.Link as={Link} to={ROUTES.ADMIN_PEDIDOS} onClick={handleClose} className="text-white d-flex align-items-center p-0 italic">
                                        <i className="bi bi-receipt me-3 text-accent"></i> PEDIDOS
                                    </Nav.Link>
                                    <Nav.Link as={Link} to={ROUTES.STATISTICS} onClick={handleClose} className="text-white d-flex align-items-center p-0 italic">
                                        <i className="bi bi-bar-chart-line me-3 text-accent"></i> ESTADÍSTICAS
                                    </Nav.Link>
                                </>
                            )}

                            {canSeeStaff && (
                                <>
                                    <Nav.Link as={Link} to={ROUTES.ADMIN_MESAS} onClick={handleClose} className="text-white d-flex align-items-center p-0 italic">
                                        <i className="bi bi-grid-3x3 me-3 text-accent"></i> GESTIÓN MESAS
                                    </Nav.Link>
                                    <Nav.Link as={Link} to={ROUTES.ADMIN_RESERVAS} onClick={handleClose} className="text-white d-flex align-items-center p-0 italic">
                                        <i className="bi bi-calendar-check me-3 text-accent"></i> RESERVAS
                                    </Nav.Link>
                                </>
                            )}
                            
                            <hr className="bg-white opacity-25 my-2" />
                            
                            <Nav.Link onClick={toggleDarkMode} className="text-white d-flex align-items-center p-0 italic mb-2">
                                <i className={`bi bi-${isDarkMode ? 'sun-fill text-warning' : 'moon-stars-fill'} me-3`}></i> {isDarkMode ? 'MODO DÍA' : 'MODO NOCHE'}
                            </Nav.Link>

                            <Nav.Link onClick={handleLogout} className="text-accent d-flex align-items-center p-0 italic fw-bold">
                                <i className="bi bi-box-arrow-right me-3"></i> SALIR
                            </Nav.Link>
                        </Nav>
                    </Offcanvas.Body>
                </Navbar.Offcanvas>
            </Container>
        </Navbar>
    );
};
