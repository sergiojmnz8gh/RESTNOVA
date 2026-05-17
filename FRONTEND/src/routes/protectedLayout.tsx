import { useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { DesktopSidebar } from '../components/Sidebar';
import { ROUTES } from './routes';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { Navbar } from '../components/Navbar';

export const ProtectedLayout = () => {
    const { isAuthenticated, loading, user } = useAuth();
    const { isDarkMode } = useUI();
    const location = useLocation();

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('restnova_theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('restnova_theme', 'light');
        }
        return () => {
            document.documentElement.removeAttribute('data-theme');
        };
    }, [isDarkMode]);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center min-vh-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to={ROUTES.LOGIN} replace />;
    }

    
    const roleMap: Record<string, string[]> = {
        [ROUTES.DASHBOARD]: ['ADMIN', 'CAMARERO', 'COCINA'],
        [ROUTES.ADMIN_PRODUCTOS]: ['ADMIN', 'CAMARERO', 'COCINA'],
        [ROUTES.ADMIN_CATEGORIAS]: ['ADMIN'],
        [ROUTES.ADMIN_MESAS]: ['ADMIN', 'CAMARERO'],
        [ROUTES.ADMIN_RESERVAS]: ['ADMIN', 'CAMARERO'],
        [ROUTES.ADMIN_PEDIDOS]: ['ADMIN', 'CAMARERO'],
        [ROUTES.ADMIN_USUARIOS]: ['ADMIN'],
        [ROUTES.PERFIL]: ['CLIENTE', 'ADMIN', 'CAMARERO', 'COCINA'],
        [ROUTES.RESERVA_CLIENTE]: ['CLIENTE'],
        [ROUTES.SCAN_QR]: ['CLIENTE'],
        [ROUTES.WAITER_ORDER]: ['ADMIN', 'CAMARERO'],
        [ROUTES.KITCHEN]: ['ADMIN', 'COCINA']
    };

    const requiredRoles = roleMap[location.pathname];
    if (requiredRoles && user) {
        
        const normalizedRole = (user.rol || '').replace('ROLE_', '').toUpperCase();
        if (!requiredRoles.includes(normalizedRole)) {
            if (normalizedRole === 'CLIENTE') {
                return <Navigate to={ROUTES.LANDING} replace />;
            }
            return <Navigate to={ROUTES.DASHBOARD} replace />;
        }
    }

    
    const normalizedRole = (user?.rol || '').replace('ROLE_', '').toUpperCase();
    const isCustomer = normalizedRole === 'CLIENTE';

    
    const isFullScreenCustomerPage = isCustomer && (location.pathname === ROUTES.RESERVA_CLIENTE || location.pathname === ROUTES.PERFIL);
    if (isFullScreenCustomerPage) {
        return <Outlet />;
    }

    return (
        <div className="app-container d-flex flex-column flex-md-row min-vh-100">
            {}
            {isCustomer ? (
                <Navbar />
            ) : (
                <DesktopSidebar />
            )}

            {}
            <main className={`flex-grow-1 p-0 p-md-4 bg-background ${isCustomer ? 'mt-5 pt-4 w-100' : 'mt-mobile-nav'}`}>
                <div className="container-fluid py-4 px-3 px-md-0">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
