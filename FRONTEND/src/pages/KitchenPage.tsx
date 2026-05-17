import React, { useEffect, useState } from 'react';
import { Badge, Button, Card, Col, Container, Row, Spinner } from 'react-bootstrap';
import { useUI } from '../context/UIContext';
import { pedidoService } from '../services/pedidoService';

import type { Order as Pedido } from '../types/OrderTypes';

import { PageHeader } from '../components/PageHeader';

export const KitchenPage: React.FC = () => {
    const { showToast } = useUI();
    const [orders, setOrders] = useState<Pedido[]>([]);
    const [loading, setLoading] = useState(true);

    const loadOrders = async () => {
        try {
            const data = await pedidoService.listarTodos();

            const activeOrders = data.filter((o: Pedido) =>
                ['PENDIENTE', 'EN_PREPARACION', 'LISTO_PARA_SERVIR'].includes(o.estado)
            ).sort((a: Pedido, b: Pedido) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime());

            setOrders(activeOrders);
        } catch (error) {
            console.error('Error loading kitchen orders', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let lastOrderId = 0;

        const loadOrdersWithSound = async () => {
            try {
                const data = await pedidoService.listarTodos();
                const activeOrders = data.filter((o: Pedido) =>
                    ['PENDIENTE', 'EN_PREPARACION', 'LISTO_PARA_SERVIR'].includes(o.estado)
                ).sort((a: Pedido, b: Pedido) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime());

                setOrders(activeOrders);

                const newOrds = activeOrders.filter((o: Pedido) => o.estado === 'PENDIENTE');
                if (newOrds.length > 0) {
                    const maxId = Math.max(...newOrds.map((o: Pedido) => o.id));
                    if (lastOrderId > 0 && maxId > lastOrderId) {
                        const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
                        audio.play().catch(e => console.log('Audio autoplay prevented', e));
                    }
                    lastOrderId = Math.max(lastOrderId, maxId);
                }
            } catch (error) {
                console.error('Error loading kitchen orders', error);
            } finally {
                setLoading(false);
            }
        };

        loadOrdersWithSound();
        const intervalId = setInterval(loadOrdersWithSound, 10000);
        return () => clearInterval(intervalId);
    }, []);

    const updateOrderStatus = async (id: number, newStatus: string) => {
        try {
            await pedidoService.actualizarEstado(id, newStatus);

            showToast('Actualizado', `Pedido movido a ${newStatus.replace(/_/g, ' ')}`);
            loadOrders();
        } catch (error) {
            showToast('Error', 'No se pudo actualizar el estado', 'danger');
        }
    };

    const getMinutesElapsed = (isoString: string) => {
        const diff = Date.now() - new Date(isoString).getTime();
        return Math.floor(diff / 60000);
    };

    if (loading && orders.length === 0) {
        return (
            <div className="d-flex flex-column justify-content-center align-items-center vh-100 gap-4">
                <Spinner animation="border" className="text-accent" style={{ width: '3.5rem', height: '3.5rem' }} />
                <h2 className="fw-bold text-primary m-0">CONECTANDO CON FOGONES...</h2>
            </div>
        );
    }

    return (
        <Container fluid className="py-4 fade-in min-vh-100 pb-5">
            <PageHeader
                title="Monitor de Cocina"
                description="Gestión de comandas en tiempo real y flujo de producción"
            />

            {orders.length === 0 ? (
                <div className="text-center py-5 opacity-50">
                    <i className="bi bi-fire display-1 d-block mb-3 text-primary"></i>
                    <h3 className="fw-bold">SIN COMANDAS PENDIENTES</h3>
                    <p className="text-muted">La cocina está al día. Buen trabajo.</p>
                </div>
            ) : (
                <Row className="g-4">
                    {orders.map(order => {
                        const mins = getMinutesElapsed(order.fechaHora);
                        const isWarning = mins > 15 && order.estado !== 'LISTO_PARA_SERVIR';
                        let nextState = '';
                        let actionText = '';
                        let variant = 'primary';

                        if (order.estado === 'PENDIENTE') {
                            nextState = 'EN_PREPARACION';
                            actionText = 'COMENZAR PREPARACIÓN';
                            variant = 'primary';
                        } else if (order.estado === 'EN_PREPARACION') {
                            nextState = 'LISTO_PARA_SERVIR';
                            actionText = 'COMANDA LISTA';
                            variant = 'accent';
                        }

                        return (
                            <Col key={order.id} xs={12} md={6} xl={4}>
                                <Card className={`border-0 shadow-premium h-100 rounded-4 overflow-hidden border-top border-5 ${isWarning ? 'border-danger' : order.estado === 'LISTO_PARA_SERVIR' ? 'border-success' : 'border-primary'}`}>
                                    <Card.Header className="bg-white border-0 pt-4 px-4 d-flex justify-content-between align-items-center">
                                        <div>
                                            <div className="fs-4 fw-bold text-primary text-uppercase">MESA {order.numeroMesa}</div>
                                            <small className="text-muted fw-bold">#{order.id}</small>
                                        </div>
                                        <Badge bg={order.estado === 'LISTO_PARA_SERVIR' ? 'success' : isWarning ? 'danger' : 'primary'} className="px-3 py-2 text-uppercase">
                                            {order.estado.replace(/_/g, ' ')}
                                        </Badge>
                                    </Card.Header>
                                    <Card.Body className="px-4 pb-4">
                                        <div className="text-muted small fw-bold mb-4">
                                            <i className="bi bi-clock me-2"></i>Hace {mins} min
                                        </div>

                                        <div className="ticket-items mb-4">
                                            {order.detalles?.map((detalle, idx) => (
                                                <div key={idx} className="d-flex justify-content-between align-items-center mb-2 p-3 rounded-3 bg-light border-0">
                                                    <div className="bg-primary text-white d-flex align-items-center justify-content-center rounded-2 fw-bold" style={{ minWidth: '32px', height: '32px' }}>
                                                        {detalle.cantidad}
                                                    </div>
                                                    <span className="flex-grow-1 ms-3 fw-bold text-uppercase small">{detalle.productoNombre}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {nextState ? (
                                            <Button
                                                variant={variant}
                                                className={`w-100 fw-bold py-3 shadow-sm border-0 ${variant === 'accent' ? 'text-primary' : ''}`}
                                                onClick={() => updateOrderStatus(order.id, nextState)}
                                            >
                                                {actionText}
                                            </Button>
                                        ) : (
                                            <div className="text-success text-center fw-bold py-3 rounded-3 shadow-sm bg-success bg-opacity-10 border border-success">
                                                <i className="bi bi-check2-all me-2"></i>LISTO PARA SERVIR
                                            </div>
                                        )}
                                    </Card.Body>
                                </Card>
                            </Col>
                        );
                    })}
                </Row>
            )}
        </Container>
    );
};

