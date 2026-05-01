import React, { useState } from 'react';
import { Nav, Button } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '../../routes/routes';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';

export const DesktopSidebar: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const { logout, user } = useAuth();
    const { isDarkMode, toggleDarkMode } = useUI();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate(ROUTES.LOGIN);
    };

    const isActive = (path: string) => location.pathname === path;

    const canSeeAdmin = user?.rol === 'ADMIN';
    const canSeeKitchen = user?.rol === 'ADMIN' || user?.rol === 'COCINA';
    const canSeeStaff = user?.rol === 'ADMIN' || user?.rol === 'PERSONAL_SALA';

    return (
        <div className={`sidebar d-none d-md-flex flex-column transition-all ${collapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}>
            <div className="d-flex align-items-center justify-content-center p-4 border-bottom border-white border-opacity-10 py-5">
                <Link to={ROUTES.DASHBOARD} className="d-flex align-items-center justify-content-center text-decoration-none">
                    <img 
                        src="/logo_white.png" 
                        alt="Restnova Logo" 
                        style={{ 
                            height: collapsed ? '40px' : '85px', 
                            width: 'auto',
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            filter: 'drop-shadow(0 0 10px rgba(231, 158, 10, 0.2))'
                        }} 
                    />
                </Link>
                <Button 
                    variant="link" 
                    className="text-white p-0 shadow-none position-absolute opacity-50" 
                    style={{ right: '10px', top: '10px' }}
                    onClick={() => setCollapsed(!collapsed)}
                >
                    <i className={`bi bi-${collapsed ? 'list' : 'x-lg'} fs-5`}></i>
                </Button>
            </div>

            <div className="sidebar-content">
                <Nav className="flex-column p-2">
                    {/* General Access for Admin/Staff */}
                    {(canSeeAdmin || canSeeStaff) && (
                        <Nav.Link 
                            as={Link} 
                            to={ROUTES.DASHBOARD} 
                            className={`nav-item-clean ${isActive(ROUTES.DASHBOARD) || isActive(ROUTES.DASHBOARD) ? 'active' : ''}`}
                        >
                            <i className="bi bi-speedometer2"></i>
                            {!collapsed && <span className="ms-3">Dashboard</span>}
                        </Nav.Link>
                    )}

                    {/* Admin Only */}
                    {canSeeAdmin && (
                        <>
                            <Nav.Link 
                                as={Link} 
                                to={ROUTES.ADMIN_PRODUCTOS} 
                                className={`nav-item-clean ${isActive(ROUTES.ADMIN_PRODUCTOS) ? 'active' : ''}`}
                            >
                                <i className="bi bi-box-seam"></i>
                                {!collapsed && <span className="ms-3">Productos</span>}
                            </Nav.Link>
                            
                            <Nav.Link 
                                as={Link} 
                                to={ROUTES.ADMIN_MESAS} 
                                className={`nav-item-clean ${isActive(ROUTES.ADMIN_MESAS) ? 'active' : ''}`}
                            >
                                <i className="bi bi-grid-3x3-gap"></i>
                                {!collapsed && <span className="ms-3">Mesas</span>}
                            </Nav.Link>
                            
                            <Nav.Link 
                                as={Link} 
                                to={ROUTES.ADMIN_RESERVAS} 
                                className={`nav-item-clean ${isActive(ROUTES.ADMIN_RESERVAS) ? 'active' : ''}`}
                            >
                                <i className="bi bi-calendar-event"></i>
                                {!collapsed && <span className="ms-3">Reservas</span>}
                            </Nav.Link>

                            <Nav.Link 
                                as={Link} 
                                to={ROUTES.ADMIN_PEDIDOS} 
                                className={`nav-item-clean ${isActive(ROUTES.ADMIN_PEDIDOS) ? 'active' : ''}`}
                            >
                                <i className="bi bi-receipt"></i>
                                {!collapsed && <span className="ms-3">Control de Pedidos</span>}
                            </Nav.Link>

                            <Nav.Link 
                                as={Link} 
                                to={ROUTES.STATISTICS} 
                                className={`nav-item-clean ${isActive(ROUTES.STATISTICS) ? 'active' : ''}`}
                            >
                                <i className="bi bi-bar-chart-line"></i>
                                {!collapsed && <span className="ms-3">Estadísticas</span>}
                            </Nav.Link>
                        </>
                    )}

                    <hr className="bg-white opacity-25 my-2 mx-3" />

                    {/* Operational Roles */}
                    {canSeeKitchen && (
                        <Nav.Link 
                            as={Link} 
                            to={ROUTES.KITCHEN} 
                            className={`nav-item-clean ${isActive(ROUTES.KITCHEN) ? 'active' : ''}`}
                        >
                            <i className="bi bi-fire"></i>
                            {!collapsed && <span className="ms-3">Cocina</span>}
                        </Nav.Link>
                    )}

                    {canSeeStaff && (
                        <Nav.Link 
                            as={Link} 
                            to={ROUTES.STAFF} 
                            className={`nav-item-clean ${isActive(ROUTES.STAFF) ? 'active' : ''}`}
                        >
                            <i className="bi bi-phone"></i>
                            {!collapsed && <span className="ms-3">Personal Sala</span>}
                        </Nav.Link>
                    )}
                </Nav>
            </div>

            {/* Bottom Section */}
            <div className="mt-auto p-2 border-top border-white border-opacity-10 py-3">
                <Nav.Link 
                    onClick={toggleDarkMode} 
                    className="nav-item-clean cursor-pointer mb-2"
                >
                    <i className={`bi bi-${isDarkMode ? 'sun-fill text-warning' : 'moon-stars-fill'}`}></i>
                    {!collapsed && <span className="ms-3 text-uppercase small fw-bold">{isDarkMode ? 'Modo Día' : 'Modo Noche'}</span>}
                </Nav.Link>

                <Nav.Link 
                    onClick={handleLogout} 
                    className="nav-item-clean cursor-pointer"
                >
                    <i className="bi bi-box-arrow-right"></i>
                    {!collapsed && <span className="ms-3 text-uppercase small fw-bold">Salir</span>}
                </Nav.Link>
            </div>
        </div>
    );
};
