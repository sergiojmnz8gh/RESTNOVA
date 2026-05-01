import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner } from 'react-bootstrap';
import api from '../services/apiConfig';
import { useUI } from '../context/UIContext';

import type { Order as Pedido } from '../types/OrderTypes';

export const KitchenPage: React.FC = () => {
    const { showToast } = useUI();
    const [orders, setOrders] = useState<Pedido[]>([]);
    const [loading, setLoading] = useState(true);

    const loadOrders = async () => {
        try {
            const res = await api.get('/pedidos');
            // Filtrar y ordenar por fechaHora ascente (los más antiguos primero)
            const activeOrders = res.data.filter((o: Pedido) => 
                ['PENDIENTE_PAGO', 'PAGADO', 'EN_PREPARACION', 'LISTO'].includes(o.estado)
            ).sort((a: Pedido, b: Pedido) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime());
            
            setOrders(activeOrders);
        } catch (error) {
            console.error('Error loading kitchen orders', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
        // Polling cada 10 segundos
        const intervalId = setInterval(loadOrders, 10000);
        return () => clearInterval(intervalId);
    }, []);

    const updateOrderStatus = async (id: number, newStatus: string) => {
        try {
            await api.put(`/pedidos/${id}/estado?status=${newStatus}`);
            showToast('Actualizado', `Pedido movido a ${newStatus.replace('_', ' ')}`);
            loadOrders();
        } catch (error) {
            showToast('Error', 'No se pudo actualizar el estado', 'danger');
        }
    };

    const newOrders = orders.filter(o => o.estado === 'PENDIENTE_PAGO' || o.estado === 'PAGADO');
    const prepOrders = orders.filter(o => o.estado === 'EN_PREPARACION');
    const readyOrders = orders.filter(o => o.estado === 'LISTO');

    const getMinutesElapsed = (isoString: string) => {
        const diff = Date.now() - new Date(isoString).getTime();
        return Math.floor(diff / 60000);
    };

    const TicketList = ({ tickets, title, icon, colorClass, nextState, actionText }: { tickets: Pedido[], title: string, icon: string, colorClass: string, nextState?: string, actionText?: string }) => (
        <Card className="border-0 shadow-sm h-100 overflow-hidden">
            <Card.Header className={`bg-primary text-white border-0 py-4 d-flex justify-content-between align-items-center border-bottom border-4 ${colorClass}`}>
                <h5 className="mb-0 fw-bold">
                    <i className={`bi ${icon} me-3 text-accent`}></i>{title.toUpperCase()}
                </h5>
                <Badge bg="accent" text="dark" className="fs-6 px-3 py-2 fw-bold italic">{tickets.length}</Badge>
            </Card.Header>
            <Card.Body className="p-4" style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 250px)' }}>
                {tickets.length === 0 ? (
                    <div className="text-center text-muted py-5 opacity-25">
                        <i className={`bi ${icon} display-1 d-block mb-3`}></i>
                        <p className="fw-bold italic">SIN COMANDAS ACTIVAS</p>
                    </div>
                ) : (
                    tickets.map(order => {
                        const mins = getMinutesElapsed(order.fechaHora);
                        const isWarning = mins > 15 && order.estado !== 'LISTO';
                        
                        return (
                            <Card key={order.id} className={`border-0 shadow-sm mb-4 rounded-4 overflow-hidden border-start border-5 ${isWarning ? 'border-failure' : 'border-primary'}`}>
                                <Card.Body className="p-4">
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <div className="text-primary fs-3 fw-bold italic" style={{ letterSpacing: '-1px' }}>
                                            MESA {order.numeroMesa}
                                        </div>
                                        <div className={`fw-bold small ${isWarning ? 'text-failure animate-pulse' : 'text-muted'}`}>
                                            <i className="bi bi-clock-history me-2"></i>
                                            {mins} MIN
                                        </div>
                                    </div>
                                    
                                    <div className="ticket-items mb-4">
                                        {order.detalles && order.detalles.length > 0 ? (
                                            order.detalles.map((detalle, idx) => (
                                                <div key={idx} className="d-flex justify-content-between align-items-center mb-2 p-3 rounded-3 border-0 shadow-sm" style={{ backgroundColor: 'rgba(231,158,10,0.05)' }}>
                                                    <div className="bg-primary text-white d-flex align-items-center justify-content-center rounded fw-bold" style={{ minWidth: '35px', height: '35px' }}>
                                                        {detalle.cantidad}X
                                                    </div>
                                                    <span className="flex-grow-1 ms-3 fw-bold text-uppercase fs-6" style={{ color: 'var(--color-text)' }}>{detalle.productoNombre}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-muted small fw-bold italic text-center py-3">Sincronizando ingredientes...</div>
                                        )}
                                    </div>
                                    
                                    {nextState && actionText && (
                                        <Button 
                                            variant="primary" 
                                            className="w-100 fw-bold py-3 shadow-sm fs-5 italic"
                                            onClick={() => updateOrderStatus(order.id, nextState)}
                                        >
                                            <i className="bi bi-play-circle-fill me-2"></i>
                                            {actionText}
                                        </Button>
                                    )}
                                    {!nextState && (
                                        <div className="text-success text-center fw-bold py-3 rounded-3 shadow-sm italic" style={{ background: 'rgba(0,230,118,0.1)' }}>
                                            <i className="bi bi-check2-all me-2"></i>
                                            LISTO PARA SERVICIO
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        );
                    })
                )}
            </Card.Body>
        </Card>
    );

    if (loading && orders.length === 0) {
        return (
            <div className="d-flex flex-column justify-content-center align-items-center vh-100 gap-4">
                <Spinner animation="border" variant="accent" style={{width: '3.5rem', height: '3.5rem'}} />
                <h2 className="fw-bold text-primary m-0 italic">CONECTANDO CON FOGONES...</h2>
            </div>
        );
    }

    return (
        <Container fluid className="py-4 fade-in min-vh-100 pb-5">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-3">
                <div>
                    <h1 className="display-5 fw-bold mb-1">Terminal de Cocina</h1>
                    <p className="text-muted fw-bold text-uppercase small">Monitor de producción en tiempo real</p>
                </div>
                <div className="d-flex align-items-center gap-4 bg-primary px-4 py-3 rounded-4 shadow-sm">
                    <div className="d-flex align-items-center gap-2">
                        <span className="p-2 bg-accent rounded-circle animate-pulse"></span>
                        <span className="small fw-bold text-white italic">OPERATIVO</span>
                    </div>
                    <Button variant="link" onClick={loadOrders} className="p-0 text-accent text-decoration-none fw-bold small italic">
                        <i className="bi bi-arrow-clockwise me-1"></i> REFRESCAR COMANDAS
                    </Button>
                </div>
            </div>

            <Row className="g-4 align-items-stretch">
                <Col lg={4}>
                    <TicketList 
                        tickets={newOrders} 
                        title="Nuevas Comandas" 
                        icon="bi-receipt" 
                        colorClass="border-primary"
                        nextState="EN_PREPARACION"
                        actionText="COMENZAR FUEGOS"
                    />
                </Col>
                <Col lg={4}>
                    <TicketList 
                        tickets={prepOrders} 
                        title="En Marcha" 
                        icon="bi-fire" 
                        colorClass="border-warning"
                        nextState="LISTO"
                        actionText="MARCAR TERMINADO"
                    />
                </Col>
                <Col lg={4}>
                    <TicketList 
                        tickets={readyOrders} 
                        title="Despacho" 
                        icon="bi-bell-fill" 
                        colorClass="border-success"
                    />
                </Col>
            </Row>
        </Container>
    );
};
