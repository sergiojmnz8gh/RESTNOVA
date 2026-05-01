import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Badge, Button, Dropdown, Modal, Spinner } from 'react-bootstrap';
import api from '../services/apiConfig';
import { useUI } from '../context/UIContext';

// Interfaces mapping to Backend PedidoResponse (we use English for frontend types)
import type { Order } from '../types/OrderTypes';

export const OrdersPage: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [showModal, setShowModal] = useState(false);
    const { showToast } = useUI();

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await api.get('/pedidos');
            setOrders(response.data);
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
            // Re-fetch orders inside function to keep state clean, or just update local
            await api.put(`/pedidos/${orderId}/estado?status=${newStatus}`);
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
            await api.delete(`/pedidos/${orderId}`);
            showToast('Éxito', 'Pedido eliminado permanentemente', 'success');
            fetchOrders();
        } catch (error) {
            showToast('Error', 'Error al eliminar el pedido', 'danger');
        }
    };

    const handleViewDetails = (order: Order) => {
        setSelectedOrder(order);
        setShowModal(true);
    };



    return (
        <Container fluid className="py-4 fade-in pb-5">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-3">
                <div>
                    <h1 className="h2 fw-800 mb-1">Control de Pedidos</h1>
                    <p className="text-muted">Historial y estado de comandas en tiempo real.</p>
                </div>
                <Button variant="primary" className="shadow-premium px-4 py-2 fw-bold" onClick={fetchOrders} disabled={loading}>
                    <i className="bi bi-arrow-clockwise me-2"></i> Actualizar Listado
                </Button>
            </div>

            <Card className="border-0 shadow-sm p-4 overflow-hidden">
                <Card.Body className="p-0">
                    <Table hover className="align-middle mb-0">
                        <thead>
                            <tr className="text-muted small text-uppercase">
                                <th className="py-3 px-2">ID</th>
                                <th className="py-3">Fecha y Hora</th>
                                <th className="py-3">Ocupación / Cliente</th>
                                <th className="py-3 text-end">Total</th>
                                <th className="py-3 text-center">Estado</th>
                                <th className="py-3 text-end">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && orders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-5">
                                        <Spinner animation="border" variant="accent" />
                                        <p className="mt-3 text-muted fw-bold">Sincronizando caja...</p>
                                    </td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-5 text-muted fw-bold">
                                        No se han registrado pedidos todavía.
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order.id}>
                                        <td className="fw-800 text-primary px-2">#{order.id}</td>
                                        <td>
                                            <div className="fw-bold">{new Date(order.fechaHora).toLocaleDateString()}</div>
                                            <small className="text-muted">{new Date(order.fechaHora).toLocaleTimeString()}</small>
                                        </td>
                                        <td>
                                                {order.numeroMesa ? `MESA ${order.numeroMesa}` : 'PARA LLEVAR'} 

                                            {order.usuarioEmail && (
                                                <small className="text-muted fw-bold opacity-75">{order.usuarioEmail}</small>
                                            )}
                                        </td>
                                        <td className="text-end fw-800 fs-5 text-primary">{order.total.toFixed(2)}€</td>
                                        <td className="text-center">
                                            <Badge className="badge-status shadow-sm fw-800 py-2 px-3" style={{ minWidth: '120px' }} bg={
                                                order.estado === 'PENDIENTE_PAGO' ? 'warning' :
                                                order.estado === 'EN_PREPARACION' ? 'info' :
                                                order.estado === 'LISTO' ? 'primary' :
                                                order.estado === 'PAGADO' ? 'success' : 'danger'
                                            }>
                                                {order.estado.replace('_', ' ')}
                                            </Badge>
                                        </td>
                                        <td className="text-end">
                                            <div className="d-flex justify-content-end gap-1">
                                                <Button 
                                                    variant="link" 
                                                    className="text-primary p-2 hover-bg-light rounded-circle"
                                                    onClick={() => handleViewDetails(order)}
                                                    title="Ver Detalles"
                                                >
                                                    <i className="bi bi-eye-fill"></i>
                                                </Button>
                                                
                                                <Dropdown>
                                                    <Dropdown.Toggle as={Button} variant="link" className="text-accent p-2 hover-bg-light rounded-circle border-0 no-caret shadow-none">
                                                        <i className="bi bi-pencil-fill"></i>
                                                    </Dropdown.Toggle>
                                                    <Dropdown.Menu align="end" className="premium-dropdown border-0 shadow-lg p-2">
                                                        <div className="dropdown-header small fw-800 text-muted text-uppercase mb-1">Cambiar Estado</div>
                                                        <Dropdown.Item onClick={() => handleStatusChange(order.id, 'EN_PREPARACION')} className="rounded-3 py-2">
                                                            <i className="bi bi-fire me-2 text-warning"></i> En Preparación
                                                        </Dropdown.Item>
                                                        <Dropdown.Item onClick={() => handleStatusChange(order.id, 'LISTO')} className="rounded-3 py-2">
                                                            <i className="bi bi-check2-all me-2 text-primary"></i> Listo para Servir
                                                        </Dropdown.Item>
                                                        <Dropdown.Item onClick={() => handleStatusChange(order.id, 'PAGADO')} className="rounded-3 py-2">
                                                            <i className="bi bi-cash me-2 text-success"></i> Marcado como Pagado
                                                        </Dropdown.Item>
                                                        <Dropdown.Divider />
                                                        <Dropdown.Item onClick={() => handleStatusChange(order.id, 'CANCELADO')} className="text-danger rounded-3 py-2">
                                                            <i className="bi bi-x-circle me-2"></i> Cancelar Pedido
                                                        </Dropdown.Item>
                                                    </Dropdown.Menu>
                                                </Dropdown>
    
                                                <Button 
                                                    variant="link" 
                                                    className="text-danger p-2 hover-bg-light rounded-circle"
                                                    onClick={() => handleDeleteOrder(order.id)}
                                                    title="Eliminar Permanente"
                                                >
                                                    <i className="bi bi-trash3-fill"></i>
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            {/* Order Details Modal Update */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered className="premium-modal">
                <Modal.Header closeButton className="border-0 px-4 pt-4">
                    <Modal.Title className="fw-800 h4">
                        Pedido #{selectedOrder?.id}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="px-4 py-3">
                    <div className="p-3 bg-light rounded-4 mb-4 border border-opacity-10">
                        <div className="d-flex justify-content-between mb-2">
                            <span className="text-muted fw-bold small">FECHA:</span>
                            <span className="fw-800 text-primary small">{selectedOrder && new Date(selectedOrder.fechaHora).toLocaleString()}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                            <span className="text-muted fw-bold small">ESTADO ACTUAL:</span>
                            <Badge bg={selectedOrder ? (
                                selectedOrder.estado === 'PENDIENTE_PAGO' ? 'warning' :
                                selectedOrder.estado === 'EN_PREPARACION' ? 'info' :
                                selectedOrder.estado === 'LISTO' ? 'primary' :
                                selectedOrder.estado === 'PAGADO' ? 'success' : 'danger'
                            ) : 'secondary'} className="fw-800 shadow-none px-3" style={{ fontSize: '0.7rem' }}>
                                {selectedOrder?.estado}
                            </Badge>
                        </div>
                        <div className="d-flex justify-content-between">
                            <span className="fw-800 text-primary small">
                                {selectedOrder?.numeroMesa ? `SALA - MESA ${selectedOrder.numeroMesa}` : 'PEDIDO EXTERNO'}
                            </span>
                        </div>
                    </div>

                    <h6 className="fw-800 text-muted small text-uppercase letter-spacing-1 mb-3">Composición de Comanda</h6>
                    <div className="bg-white rounded-4 p-3 border-dashed" style={{ border: '1px dashed #e2e8f0' }}>
                        {selectedOrder?.detalles?.map((item, index) => (
                            <div key={index} className="d-flex justify-content-between align-items-center mb-3 last-mb-0">
                                <div className="d-flex align-items-center">
                                    <div className="bg-primary text-white d-flex align-items-center justify-content-center rounded-circle me-3 fw-bold small" style={{ width: '28px', height: '28px' }}>
                                        {item.cantidad}
                                    </div>
                                    <div>
                                        <div className="fw-bold text-primary small text-uppercase">{item.productoNombre}</div>
                                        <small className="text-muted">{item.precioUnitario.toFixed(2)}€ / ud</small>
                                    </div>
                                </div>
                                <span className="fw-800 text-primary">{(item.precioUnitario * item.cantidad).toFixed(2)}€</span>
                            </div>
                        ))}
                    </div>
                    
                    <div className="d-flex justify-content-between align-items-center mt-5 p-4 bg-primary rounded-4 shadow-lg">
                        <h5 className="mb-0 text-white opacity-75 small fw-bold text-uppercase italic">Total Facturado</h5>
                        <h3 className="mb-0 text-white fw-bold">{selectedOrder?.total.toFixed(2)}€</h3>
                    </div>
                </Modal.Body>
                <Modal.Footer className="border-0 px-4 pb-4">
                    <Button variant="light" className="fw-bold px-4 border-0" onClick={() => setShowModal(false)}>
                        Cerrar Ventana
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};
