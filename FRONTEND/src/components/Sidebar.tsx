import React, { useState, useEffect } from 'react';
import { Nav, Button, Offcanvas, Badge, Card } from 'react-bootstrap';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../routes/routes';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import api from '../services/apiConfig';

export const DesktopSidebar: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [showMobile, setShowMobile] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [showNotificationsPanel, setShowNotificationsPanel] = useState(false);
    const { logout, user } = useAuth();
    const { isDarkMode, toggleDarkMode } = useUI();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate(ROUTES.LOGIN);
    };

    const isAdmin = user?.rol?.includes('ADMIN');
    const isKitchen = user?.rol?.includes('COCINA') || isAdmin;
    const isWaiter = user?.rol?.includes('CAMARERO');

    const loadNotifications = async () => {
        if (!user) return;
        try {
            const res = await api.get('/notificaciones/activas');
            setNotifications(res.data);
        } catch (error) {
            console.error("Error loading notifications in sidebar");
        }
    };

    useEffect(() => {
        if (user && isWaiter) {
            loadNotifications();
            const interval = setInterval(loadNotifications, 10000);
            return () => clearInterval(interval);
        }
    }, [user, isWaiter]);

    const unreadCount = notifications.filter(n => !n.leida).length;

    const navLinks = (
        <Nav className="flex-column px-2 gap-1 mt-4">
            {isAdmin && (
                <Nav.Link 
                    as={NavLink} 
                    to={ROUTES.DASHBOARD} 
                    className={`nav-item-clean ${collapsed && !showMobile ? 'justify-content-center px-0' : ''}`}
                    onClick={() => setShowMobile(false)}
                >
                    <i className="bi bi-speedometer2"></i>
                    {(!collapsed || showMobile) && <span className="ms-3">Panel de Control</span>}
                </Nav.Link>
            )}

            {isWaiter && (
                <Nav.Link 
                    as="div" 
                    className={`nav-item-clean cursor-pointer position-relative ${collapsed && !showMobile ? 'justify-content-center px-0' : ''}`}
                    onClick={() => {
                        setShowNotificationsPanel(true);
                        setShowMobile(false);
                    }}
                >
                    <i className="bi bi-bell"></i>
                    {(!collapsed || showMobile) && (
                        <div className="d-flex align-items-center justify-content-between w-100 ms-3">
                            <span>Notificaciones</span>
                            {unreadCount > 0 && (
                                <Badge bg="danger" pill className="ms-2 pulse-dot" style={{ fontSize: '0.6rem', padding: '0.35em 0.65em' }}>
                                    {unreadCount}
                                </Badge>
                            )}
                        </div>
                    )}
                    {collapsed && !showMobile && unreadCount > 0 && (
                        <span 
                            className="position-absolute translate-middle p-1 bg-danger border border-light rounded-circle" 
                            style={{ top: '25%', right: '20%', width: '10px', height: '10px' }}
                        ></span>
                    )}
                </Nav.Link>
            )}
            {(isAdmin || isWaiter) && (
                <>
                    <Nav.Link 
                        as={NavLink} 
                        to={ROUTES.ADMIN_MESAS} 
                        className={`nav-item-clean ${collapsed && !showMobile ? 'justify-content-center px-0' : ''}`}
                        onClick={() => setShowMobile(false)}
                    >
                        <i className="bi bi-grid-3x3-gap"></i>
                        {(!collapsed || showMobile) && <span className="ms-3">Gestión de Sala</span>}
                    </Nav.Link>

                    <Nav.Link 
                        as={NavLink} 
                        to={ROUTES.ADMIN_PEDIDOS} 
                        className={`nav-item-clean ${collapsed && !showMobile ? 'justify-content-center px-0' : ''}`}
                        onClick={() => setShowMobile(false)}
                    >
                        <i className="bi bi-receipt"></i>
                        {(!collapsed || showMobile) && <span className="ms-3">Historial de Pedidos</span>}
                    </Nav.Link>

                    <Nav.Link 
                        as={NavLink} 
                        to={ROUTES.ADMIN_RESERVAS} 
                        className={`nav-item-clean ${collapsed && !showMobile ? 'justify-content-center px-0' : ''}`}
                        onClick={() => setShowMobile(false)}
                    >
                        <i className="bi bi-calendar-event"></i>
                        {(!collapsed || showMobile) && <span className="ms-3">Control de Reservas</span>}
                    </Nav.Link>
                </>
            )}

            {(isAdmin || isKitchen) && (
                <Nav.Link 
                    as={NavLink} 
                    to={ROUTES.KITCHEN} 
                    className={`nav-item-clean ${collapsed && !showMobile ? 'justify-content-center px-0' : ''}`}
                    onClick={() => setShowMobile(false)}
                >
                    <i className="bi bi-fire"></i>
                    {(!collapsed || showMobile) && <span className="ms-3">Monitor de Cocina</span>}
                </Nav.Link>
            )}

            {(isAdmin || isWaiter || isKitchen) && (
                <>
                    <Nav.Link 
                        as={NavLink} 
                        to={ROUTES.ADMIN_PRODUCTOS} 
                        className={`nav-item-clean ${collapsed && !showMobile ? 'justify-content-center px-0' : ''}`}
                        onClick={() => setShowMobile(false)}
                    >
                        <i className="bi bi-box-seam"></i>
                        {(!collapsed || showMobile) && <span className="ms-3">Gestión de Carta</span>}
                    </Nav.Link>

                    {isAdmin && (
                        <>
                            <Nav.Link 
                                as={NavLink} 
                                to={ROUTES.ADMIN_CATEGORIAS} 
                                className={`nav-item-clean ${collapsed && !showMobile ? 'justify-content-center px-0' : ''}`}
                                onClick={() => setShowMobile(false)}
                            >
                                <i className="bi bi-tags"></i>
                                {(!collapsed || showMobile) && <span className="ms-3">Gestión de Categorías</span>}
                            </Nav.Link>

                            <Nav.Link 
                                as={NavLink} 
                                to={ROUTES.ADMIN_USUARIOS} 
                                className={`nav-item-clean ${collapsed && !showMobile ? 'justify-content-center px-0' : ''}`}
                                onClick={() => setShowMobile(false)}
                            >
                                <i className="bi bi-person-gear"></i>
                                {(!collapsed || showMobile) && <span className="ms-3">Gestión de Usuarios</span>}
                            </Nav.Link>
                        </>
                    )}
                </>
            )}
        </Nav>
    );

    const handleMarkRead = async (id: number) => {
        try {
            await api.post(`/notificaciones/${id}/leer`);
            loadNotifications();
        } catch (error) {
            console.error("Error marking read");
        }
    };

    return (
        <>
            <div className="d-flex d-md-none align-items-center justify-content-between p-3 bg-primary fixed-top w-100 shadow-lg" style={{ zIndex: 1060, height: '70px' }}>
                <Link to={ROUTES.DASHBOARD} className="d-flex align-items-center">
                    <img src="/logo_white.png" alt="Restnova" style={{ height: '35px' }} />
                </Link>
                <div className="d-flex align-items-center gap-3">
                    {unreadCount > 0 && (
                        <div className="position-relative" onClick={() => setShowNotificationsPanel(true)}>
                            <i className="bi bi-bell-fill text-white fs-4"></i>
                            <span className="position-absolute top-0 start-100 translate-middle badge rounded-circle bg-danger p-1" style={{ fontSize: '0.6rem' }}>{unreadCount}</span>
                        </div>
                    )}
                    <Button 
                        variant="link" 
                        className="text-white p-0 border-0 shadow-none" 
                        onClick={() => setShowMobile(true)}
                        aria-label="Abrir menú"
                    >
                        <i className="bi bi-list display-6"></i>
                    </Button>
                </div>
            </div>

            {}
            <Offcanvas 
                show={showMobile} 
                onHide={() => setShowMobile(false)} 
                placement="start"
                className="bg-primary text-white border-0 shadow-lg"
                style={{ width: '280px', zIndex: 3000 }}
            >
                <Offcanvas.Header closeButton closeVariant="white" className="p-4 border-bottom border-white border-opacity-10">
                    <Offcanvas.Title className="fw-bold text-accent">MENÚ STAFF</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body className="p-0 d-flex flex-column h-100">
                    <div className="flex-grow-1 py-3">
                        {navLinks}
                    </div>
                    <div className="p-3 border-top border-white border-opacity-10 bg-black bg-opacity-10">
                        <div className="d-flex align-items-center gap-2">
                            <Button variant="link" onClick={toggleDarkMode} className="text-white p-3 rounded-3 hover-bg-light d-flex align-items-center justify-content-center m-0" style={{ width: '55px', height: '55px' }}>
                                <i className={`bi bi-${isDarkMode ? 'sun-fill text-warning' : 'moon-stars-fill'} fs-4`}></i>
                            </Button>
                            <Button variant="danger" className="fw-bold py-3 flex-grow-1 rounded-3" onClick={handleLogout}>
                                <i className="bi bi-box-arrow-right me-2"></i> SALIR
                            </Button>
                        </div>
                    </div>
                </Offcanvas.Body>
            </Offcanvas>

            {}
            <div className={`sidebar d-none d-md-flex flex-column transition-all ${collapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}>
                <div className={`d-flex flex-column align-items-center justify-content-center p-3 border-bottom border-white border-opacity-10 py-4 gap-3`}>
                    {collapsed ? (
                        <div className="d-flex flex-column align-items-center gap-2">
                            <Link to={ROUTES.DASHBOARD} className="d-flex align-items-center text-decoration-none">
                                <img 
                                    src="/favicon.png" 
                                    alt="Restnova" 
                                    style={{ 
                                        height: '40px', 
                                        width: '40px',
                                        objectFit: 'contain',
                                        filter: 'brightness(0) invert(1) drop-shadow(0 0 8px rgba(231, 158, 10, 0.3))'
                                    }} 
                                    className="fade-in"
                                />
                            </Link>
                            <Button 
                                variant="link" 
                                className="text-white p-0 shadow-none opacity-50 hover-opacity-100 mt-2" 
                                onClick={() => setCollapsed(false)}
                                title="Expandir menú"
                            >
                                <i className="bi bi-chevron-right fs-5"></i>
                            </Button>
                        </div>
                    ) : (
                        <div className="d-flex align-items-center justify-content-between w-100 position-relative px-2">
                            <Link to={ROUTES.DASHBOARD} className="d-flex align-items-center text-decoration-none">
                                <img 
                                    src="/logo_white.png" 
                                    alt="Restnova" 
                                    style={{ 
                                        height: '45px', 
                                        filter: 'drop-shadow(0 0 8px rgba(231, 158, 10, 0.3))'
                                    }} 
                                    className="fade-in"
                                />
                            </Link>
                            <Button 
                                variant="link" 
                                className="text-white p-0 shadow-none opacity-50 hover-opacity-100" 
                                onClick={() => setCollapsed(true)}
                                title="Contraer menú"
                            >
                                <i className="bi bi-chevron-left fs-5"></i>
                            </Button>
                        </div>
                    )}
                </div>

                <div className="sidebar-content">
                    {navLinks}
                </div>

                <div className="mt-auto p-2 border-top border-white border-opacity-10 py-3 bg-black bg-opacity-10">
                    <div className={`d-flex ${collapsed ? 'flex-column' : 'flex-row'} align-items-center justify-content-center gap-2`}>
                        <Button 
                            variant="link"
                            onClick={toggleDarkMode} 
                            className="text-white p-2 shadow-none hover-bg-light rounded-3 d-flex align-items-center justify-content-center m-0"
                            title={isDarkMode ? 'Modo Día' : 'Modo Noche'}
                            style={{ width: '45px', height: '45px' }}
                        >
                            <i className={`bi bi-${isDarkMode ? 'sun-fill text-warning' : 'moon-stars-fill'} fs-5`}></i>
                        </Button>

                        <div 
                            onClick={handleLogout} 
                            className="cursor-pointer rounded-3 d-flex align-items-center justify-content-center bg-danger bg-opacity-10 text-danger hover-bg-danger-opacity"
                            style={{ 
                                cursor: 'pointer', 
                                width: collapsed ? '45px' : '100%',
                                height: '45px',
                                transition: 'all 0.2s ease',
                                border: '1px solid rgba(239, 68, 68, 0.2)'
                            }}
                            title="Salir"
                        >
                            <i className="bi bi-box-arrow-right fs-5"></i>
                            {!collapsed && <span className="ms-2 text-uppercase tiny fw-bold">Salir</span>}
                        </div>
                    </div>
                </div>
            </div>

            {}
            <Offcanvas show={showNotificationsPanel} onHide={() => setShowNotificationsPanel(false)} placement="end" className="border-0 shadow-lg" style={{ zIndex: 4000 }}>
                <Offcanvas.Header closeButton className="bg-primary text-white p-4 align-items-center">
                    <div className="d-flex align-items-center gap-3">
                        <div className="bg-accent rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ width: '45px', height: '45px' }}>
                            <i className="bi bi-bell-fill text-primary fs-5"></i>
                        </div>
                        <div>
                            <Offcanvas.Title className="fw-bold text-uppercase mb-0 text-accent" style={{ letterSpacing: '1px' }}>Notificaciones</Offcanvas.Title>
                            <small className="opacity-75 text-accent fw-bold tiny">SISTEMA EN TIEMPO REAL</small>
                        </div>
                    </div>
                </Offcanvas.Header>
                <Offcanvas.Body className="p-4 bg-light">
                    {notifications.length === 0 ? (
                        <div className="empty-state">
                            <i className="bi bi-check2-circle text-success"></i>
                            <h5 className="fw-bold text-uppercase">Sin Notificaciones</h5>
                            <p className="small text-muted">Todo está bajo control.</p>
                        </div>
                    ) : (
                        <div className="d-flex flex-column gap-3">
                            {notifications.map((n: any) => (
                                <Card key={n.id} className={`border-0 shadow-sm rounded-4 overflow-hidden ${!n.leida ? 'border-start border-4 border-accent' : ''}`}>
                                    <Card.Body className="p-3">
                                        <div className="d-flex justify-content-between mb-2">
                                            <Badge bg={n.tipo === 'LLAMAR_CAMARERO' ? 'danger' : 'accent'} text={n.tipo === 'LLAMAR_CAMARERO' ? 'white' : 'dark'} className="fw-bold tiny">
                                                {n.tipo.replace(/_/g, ' ')}
                                            </Badge>
                                            <small className="text-muted tiny">{new Date(n.fechaHora).toLocaleTimeString()}</small>
                                        </div>
                                        <p className="small mb-2 fw-bold text-primary">{n.mensaje}</p>
                                        {!n.leida && (
                                            <Button 
                                                variant="outline-primary" 
                                                size="sm" 
                                                className="w-100 py-1 fw-bold tiny rounded-pill"
                                                onClick={() => handleMarkRead(n.id)}
                                            >
                                                MARCAR COMO LEÍDO
                                            </Button>
                                        )}
                                    </Card.Body>
                                </Card>
                            ))}
                        </div>
                    )}
                </Offcanvas.Body>
            </Offcanvas>
        </>
    );
};

