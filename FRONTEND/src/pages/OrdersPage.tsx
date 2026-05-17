import React, { useState, useEffect } from 'react';
import { Container, Table, Badge, Button, Dropdown, Spinner } from 'react-bootstrap';
import { useUI } from '../context/UIContext';
import { pedidoService } from '../services/pedidoService';

import { PageHeader } from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';


import type { Order } from '../types/OrderTypes';

export const OrdersPage: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useUI();
    const { user } = useAuth();
    
    const isAdmin = user?.rol?.includes('ADMIN');
    const isStaff = user?.rol?.includes('CAMARERO');

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const data = await pedidoService.listarTodos();
            setOrders(data);
        } catch (error) {
            showToast('Error', 'Error al obtener los pedidos', 'danger');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleStatusChange = async (orderId: number, newStatus: string) => {
        try {
            
            await pedidoService.actualizarEstado(orderId, newStatus);
            showToast('Éxito', `Estado del pedido actualizado a ${newStatus}`, 'success');
            fetchOrders();
        } catch (error) {
            showToast('Error', 'Error al actualizar el estado del pedido', 'danger');
        }
    };

    const handleDeleteOrder = async (orderId: number) => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar permanentemente este pedido? Esta acción no se puede deshacer.')) {
            return;
        }
        
        try {
            await pedidoService.cancelar(orderId);
            showToast('Éxito', 'Pedido eliminado permanentemente', 'success');
            fetchOrders();
        } catch (error) {
            showToast('Error', 'Error al eliminar el pedido', 'danger');
        }
    };


    return (
        <Container fluid className="py-4 fade-in pb-5">
            <PageHeader 
                title="Historial de Pedidos" 
                description="Listado consolidado de comandas y estados"
            />

            <div className="table-container shadow-premium rounded-4 overflow-hidden bg-white">
                <div className="table-responsive">
                    <Table hover className="align-middle mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th className="py-3 px-4 border-0 small fw-bold text-muted" style={{ width: '15%' }}>ID</th>
                                <th className="py-3 border-0 small fw-bold text-muted" style={{ width: '20%' }}>FECHA / HORA</th>
                                <th className="py-3 border-0 small fw-bold text-muted" style={{ width: '15%' }}>UBICACIÓN</th>
                                <th className="py-3 border-0 small fw-bold text-muted text-center" style={{ width: '15%' }}>TOTAL</th>
                                <th className="py-3 border-0 small fw-bold text-muted text-center" style={{ width: '15%' }}>ESTADO</th>
                                <th className="py-3 border-0 small fw-bold text-muted text-center" style={{ width: '20%' }}>ACCIONES</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && orders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-5">
                                        <Spinner animation="border" className="text-accent" />
                                    </td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-5 border-0">
                                        <div className="empty-state border-0">
                                            <i className="bi bi-clipboard-x"></i>
                                            <h5 className="fw-bold">No hay pedidos registrados</h5>
                                            <p className="small">El historial aparecerá aquí conforme se realicen comandas.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order.id} className="border-bottom border-light">
                                        <td className="fw-bold text-primary px-4">#{order.id}</td>
                                        <td>
                                            <div className="fw-bold small">{new Date(order.fechaHora).toLocaleDateString()}</div>
                                            <div className="text-muted tiny">{new Date(order.fechaHora).toLocaleTimeString()}</div>
                                        </td>
                                        <td className="fw-bold text-primary">MESA {order.numeroMesa}</td>
                                        <td className="text-center fw-bold text-primary">{order.total.toFixed(2)}€</td>
                                        <td className="text-center">
                                            <Badge className="px-3 py-2 text-uppercase tiny" bg={
                                                order.estado === 'PENDIENTE' ? 'warning' :
                                                order.estado === 'EN_PREPARACION' ? 'info' :
                                                order.estado === 'LISTO_PARA_SERVIR' ? 'accent' :
                                                order.estado === 'SERVIDO' ? 'success' : 'danger'
                                            } style={{ color: order.estado === 'LISTO_PARA_SERVIR' ? 'var(--color-primary)' : '' }}>
                                                {order.estado.replace(/_/g, ' ')}
                                            </Badge>
                                        </td>
                                        <td className="text-center">
                                            <div className="d-flex justify-content-center gap-2 align-items-center">
                                                {(isAdmin || (isStaff && order.estado === 'LISTO_PARA_SERVIR')) ? (
                                                    <Dropdown>
                                                        <Dropdown.Toggle as={Button} variant="light" size="sm" className="border-0 no-caret shadow-sm rounded-3">
                                                            <i className="bi bi-three-dots-vertical"></i>
                                                        </Dropdown.Toggle>
                                                        <Dropdown.Menu align="end" className="premium-dropdown border-0 shadow-lg p-2">
                                                            {isAdmin ? (
                                                                 <>
                                                                    <Dropdown.Item className="rounded-2" onClick={() => handleStatusChange(order.id, 'EN_PREPARACION')}>Mover a En Preparación</Dropdown.Item>
                                                                    <Dropdown.Item className="rounded-2" onClick={() => handleStatusChange(order.id, 'LISTO_PARA_SERVIR')}>Mover a Listo para Servir</Dropdown.Item>
                                                                    <Dropdown.Item className="rounded-2" onClick={() => handleStatusChange(order.id, 'SERVIDO')}>Mover a Servido</Dropdown.Item>
                                                                    <Dropdown.Divider />
                                                                    <Dropdown.Item className="rounded-2 text-danger" onClick={() => handleStatusChange(order.id, 'CANCELADO')}>Cancelar Pedido</Dropdown.Item>
                                                                 </>
                                                            ) : (
                                                                <Dropdown.Item className="rounded-2 fw-bold text-success" onClick={() => handleStatusChange(order.id, 'SERVIDO')}>
                                                                    <i className="bi bi-check2-circle me-2"></i> MARCAR COMO SERVIDO
                                                                </Dropdown.Item>
                                                            )}
                                                        </Dropdown.Menu>
                                                    </Dropdown>
                                                ) : (
                                                    <span className="text-muted tiny fw-bold opacity-25 px-2">SIN ACCIONES</span>
                                                )}
                                                
                                                {isAdmin && (
                                                    <Button variant="link" className="text-danger p-0 ms-2" onClick={() => handleDeleteOrder(order.id)}>
                                                        <i className="bi bi-trash3 fs-5"></i>
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </Table>
                </div>
            </div>
        </Container>
    );
};

