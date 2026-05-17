import { createBrowserRouter, Navigate } from 'react-router-dom';
import { CategoriesPage } from '../pages/CategoriesPage';
import { CustomerOrderPage } from '../pages/CustomerOrderPage';
import { CustomerQRScannerPage } from '../pages/CustomerQRScannerPage';
import { CustomerReservationPage } from '../pages/CustomerReservationPage';
import { DashboardPage } from '../pages/DashboardPage';
import { KitchenPage } from '../pages/KitchenPage';
import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/LoginPage';
import { MenuPage } from '../pages/MenuPage';
import { OrdersPage } from '../pages/OrdersPage';
import { PrivacyPolicyPage } from '../pages/PrivacyPolicyPage';
import { ProductsPage } from '../pages/ProductsPage';
import { ProfilePage } from '../pages/ProfilePage';
import { RedsysMockPage } from '../pages/RedsysMockPage';
import { RegisterPage } from '../pages/RegisterPage';
import { ReservationsPage } from '../pages/ReservationsPage';
import { TablesPage } from '../pages/TablesPage';
import { UsersPage } from '../pages/UsersPage';
import { WaiterOrderPage } from '../pages/WaiterOrderPage';
import { ProtectedLayout } from './protectedLayout';
import { ROUTES } from './routes';

export const router = createBrowserRouter([
    {
        path: ROUTES.LANDING,
        element: <LandingPage />
    },
    {
        path: ROUTES.MENU,
        element: <MenuPage />
    },
    {
        path: ROUTES.PRIVACY_POLICY,
        element: <PrivacyPolicyPage />
    },
    {
        path: ROUTES.REDSYS_MOCK,
        element: <RedsysMockPage />
    },
    {
        path: ROUTES.LOGIN,
        element: <LoginPage />
    },
    {
        path: ROUTES.REGISTER,
        element: <RegisterPage />
    },
    {
        element: <ProtectedLayout />,
        children: [
            {
                path: ROUTES.DASHBOARD,
                element: <DashboardPage />
            },
            {
                path: ROUTES.ADMIN_PRODUCTOS,
                element: <ProductsPage />
            },
            {
                path: ROUTES.ADMIN_CATEGORIAS,
                element: <CategoriesPage />
            },
            {
                path: ROUTES.ADMIN_MESAS,
                element: <TablesPage />
            },
            {
                path: ROUTES.ADMIN_RESERVAS,
                element: <ReservationsPage />
            },
            {
                path: ROUTES.ADMIN_PEDIDOS,
                element: <OrdersPage />
            },
            {
                path: ROUTES.ADMIN_USUARIOS,
                element: <UsersPage />
            },
            {
                path: ROUTES.CLIENTE_PEDIDO,
                element: <CustomerOrderPage />
            },
            {
                path: ROUTES.KITCHEN,
                element: <KitchenPage />
            },

            {
                path: ROUTES.PERFIL,
                element: <ProfilePage />
            },
            {
                path: ROUTES.WAITER_ORDER,
                element: <WaiterOrderPage />
            },
            {
                path: ROUTES.RESERVA_CLIENTE,
                element: <CustomerReservationPage />
            },
            {
                path: ROUTES.SCAN_QR,
                element: <CustomerQRScannerPage />
            }
        ]
    },

    {
        path: "*",
        element: <Navigate to={ROUTES.LANDING} replace />
    }
]);
