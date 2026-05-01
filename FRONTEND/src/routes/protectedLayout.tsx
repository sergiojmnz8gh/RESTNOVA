import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { MobileNavbar } from '../components/layout/Navbar';
import { DesktopSidebar } from '../components/layout/Sidebar';
import { ROUTES } from './routes';
import { useAuth } from '../context/AuthContext';

export const ProtectedLayout = () => {
    const { isAuthenticated, loading, user } = useAuth();

    const location = useLocation();

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

    // Role-based routing centralization
    const roleMap: Record<string, string[]> = {
        [ROUTES.ADMIN_PRODUCTOS]: ['ADMIN'],
        [ROUTES.ADMIN_CATEGORIAS]: ['ADMIN'],
        [ROUTES.ADMIN_MESAS]: ['ADMIN', 'PERSONAL_SALA'],
        [ROUTES.ADMIN_RESERVAS]: ['ADMIN', 'PERSONAL_SALA'],
        [ROUTES.ADMIN_PEDIDOS]: ['ADMIN'],
        [ROUTES.STATISTICS]: ['ADMIN', 'PERSONAL_SALA'],
        [ROUTES.KITCHEN]: ['ADMIN', 'COCINA']
    };

    const requiredRoles = roleMap[location.pathname];
    if (requiredRoles && user && !requiredRoles.includes(user.rol)) {
        return <Navigate to={ROUTES.DASHBOARD} replace />;
    }

    return (
        <div className="app-container d-flex flex-column flex-md-row min-vh-100">
            {/* Navigation Devices */}
            <MobileNavbar />
            <DesktopSidebar />

            {/* Main Content Area */}
            <main className="flex-grow-1 p-3 p-md-4 bg-background">
                <div className="container-fluid">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};