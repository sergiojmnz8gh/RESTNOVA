import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedLayout } from './protectedLayout';
import { ROUTES } from './routes';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { DashboardPage } from '../pages/DashboardPage';
import { ProductsPage } from '../pages/ProductsPage';
import { CategoriesPage } from '../pages/CategoriesPage';
import { TablesPage } from '../pages/TablesPage';
import { CustomerOrderPage } from '../pages/CustomerOrderPage';
import { ReservationsPage } from '../pages/ReservationsPage';
import { OrdersPage } from '../pages/OrdersPage';
import { KitchenPage } from '../pages/KitchenPage';
import { PersonalSalaPage } from '../pages/PersonalSalaPage';
import { StatisticsPage } from '../pages/StatisticsPage';


export const router = createBrowserRouter([
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
                path: ROUTES.CLIENTE_PEDIDO,
                element: <CustomerOrderPage />
            },
            {
                path: ROUTES.KITCHEN,
                element: <KitchenPage />
            },
            {
                path: ROUTES.STAFF,
                element: <PersonalSalaPage />
            },
            {
                path: ROUTES.STATISTICS,
                element: <StatisticsPage />
            }
        ]
    },
    {
        path: "*",
        element: <Navigate to={ROUTES.LOGIN} replace />
    }
]);