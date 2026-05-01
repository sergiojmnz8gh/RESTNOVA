import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner } from 'react-bootstrap';
import api from '../services/apiConfig';
import { useUI } from '../context/UIContext';

import type { SesionMesa } from '../types/TableTypes';
import type { Order as Pedido } from '../types/OrderTypes';

export const PersonalSalaPage: React.FC = () => {
    const { showToast, showConfirm } = useUI();
    const [sessions, setSessions] = useState<SesionMesa[]>([]);
    const [orders, setOrders] = useState<Pedido[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        try {
            const [sesRes, ordRes] = await Promise.all([
                api.get('/sesiones-mesa'),
                api.get('/pedidos')
            ]);
            setSessions(sesRes.data.filter((s: SesionMesa) => !s.fechaCierre));
            setOrders(ordRes.data);
        } catch (error) {
            showToast('Error', 'No se pudo sincronizar el terminal de sala', 'danger');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        const intervalId = setInterval(loadData, 5000);
        return () => clearInterval(intervalId);
    }, []);

    const handleCobrarPedidos = (sessionOrders: Pedido[]) => {
        const unpaidOrders = sessionOrders.filter(o => o.estado === 'PENDIENTE_PAGO');
        const amount = unpaidOrders.reduce((acc, curr) => acc + curr.total, 0);

        showConfirm(
            'Liquidación de Mesa',
            `¿Confirmas el cobro en sala de ${amount.toFixed(2)}€?`,
            async () => {
                try {
                    await Promise.all(
                        unpaidOrders.map(o => api.put(`/pedidos/${o.id}/estado?status=PAGADO`))
                    );
                    showToast('Caja Actualizada', 'Cobro registrado correctamente');
                    loadData();
                } catch (error) {
                    showToast('Error', 'No se pudo procesar la transacción', 'danger');
                }
            }
        );
    };

    const handleEntregarPedidos = async (sessionOrders: Pedido[]) => {
        const readyOrders = sessionOrders.filter(o => o.estado === 'LISTO');
        
        try {
            await Promise.all(
                readyOrders.map(o => api.put(`/pedidos/${o.id}/estado?status=ENTREGADO`))
            );
            showToast('Servido', 'Platos entregados a los comensales.');
            loadData();
        } catch (error) {
            showToast('Error', 'Fallo al sincronizar entrega.', 'danger');
        }
    };

    const handleCerrarMesa = (sessionId: number, tableNumber: string) => {
        showConfirm(
            'Liberar Mesa',
            `¿Limpiar y cerrar la Mesa ${tableNumber}? Esta acción habilitará la mesa para nuevos clientes.`,
            async () => {
                try {
                    await api.put(`/sesiones-mesa/${sessionId}/cerrar`);
                    showToast('Mesa Libre', `La Mesa ${tableNumber} está lista de nuevo.`);
                    loadData();
                } catch (error: any) {
                    const msg = error.response?.data?.message || 'Error al liberar la mesa';
                    showToast('Error', msg, 'danger');
                }
            }
        );
    };

    if (loading && sessions.length === 0) {
        return (
            <div className="d-flex flex-column justify-content-center align-items-center vh-100 gap-4">
                <Spinner animation="border" variant="primary" style={{width: '3.5rem', height: '3.5rem'}} />
                <h2 className="fw-bold text-primary m-0 italic">SINCRONIZANDO SALA...</h2>
            </div>
        );
    }

    return (
        <Container fluid className="py-4 fade-in pb-5">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-3">
                <div>
                    <h1 className="display-5 fw-bold mb-1">Terminal de Sala</h1>
                    <p className="text-muted fw-bold text-uppercase small">Gestión de flujo y facturación rápida</p>
                </div>
                <Button variant="primary" className="px-4 py-3 fw-bold shadow-sm" onClick={loadData}>
                    <i className="bi bi-arrow-clockwise me-2"></i> RECARGAR ESTADO
                </Button>
            </div>

            {sessions.length === 0 ? (
                <Card className="border-0 shadow-sm text-center py-5 p-5 rounded-4 mt-4">
                    <Card.Body>
                        <div className="d-inline-flex p-4 rounded-circle mb-4 text-muted opacity-25" style={{ background: 'rgba(231,158,10,0.1)' }}>
                            <i className="bi bi-door-closed-fill display-1"></i>
                        </div>
                        <h2 className="fw-bold text-primary mb-2 italic">SALA DESPEJADA</h2>
                        <p className="text-muted fw-bold text-uppercase">No hay sesiones activas en este momento.</p>
                    </Card.Body>
                </Card>
            ) : (
                <Row className="g-4">
                    {sessions.map(session => {
                        const sessionOrders = orders.filter(o => o.sesionMesaId === session.id);
                        const unpaidOrders = sessionOrders.filter(o => o.estado === 'PENDIENTE_PAGO');
                        const readyOrders = sessionOrders.filter(o => o.estado === 'LISTO');
                        const isPrep = sessionOrders.some(o => o.estado === 'EN_PREPARACION');
                        const isPending = sessionOrders.some(o => o.estado === 'PENDIENTE_PAGO');
                        const unpaidTotal = unpaidOrders.reduce((acc, curr) => acc + curr.total, 0);

                        return (
                            <Col xs={12} md={6} lg={4} key={session.id}>
                                <Card className={`border-0 shadow-sm h-100 table-card overflow-hidden ${readyOrders.length > 0 ? 'border-top border-5 border-success' : 'border-top border-5 border-primary'}`}>
                                    <Card.Body className="p-4 d-flex flex-column">
                                        <div className="d-flex justify-content-between align-items-start mb-4">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="bg-primary text-white rounded-4 shadow-sm d-flex align-items-center justify-content-center fw-bold display-4" style={{ width: '85px', height: '85px', letterSpacing: '-2px', border: '2px solid var(--color-accent)' }}>
                                                    {session.mesa?.numeroMesa || '?'}
                                                </div>
                                                <div>
                                                    <Badge bg="primary" className="px-3 py-2 text-uppercase mb-2 fw-bold shadow-sm">MESA ACTIVA</Badge>
                                                    <div className="text-muted small fw-bold italic">
                                                        <i className="bi bi-clock-history me-2 text-accent"></i>
                                                        DESDE: {new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit' }).format(new Date(session.fechaApertura))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mb-4 d-flex flex-column gap-2">
                                            {isPending && <Badge bg="warning" text="dark" className="px-3 py-3 w-100 text-start fw-bold shadow-sm fs-6"><i className="bi bi-bell-fill me-3"></i>COMANDAS PENDIENTES</Badge>}
                                            {isPrep && <Badge bg="info" className="px-3 py-3 w-100 text-start fw-bold shadow-sm text-white fs-6"><i className="bi bi-fire me-3"></i>PLATOS EN PREPARACIÓN</Badge>}
                                            {readyOrders.length > 0 && <Badge bg="success" className="px-3 py-3 w-100 text-start fw-bold shadow-sm fs-6"><i className="bi bi-stars me-3"></i>¡LISTO PARA SERVIR!</Badge>}
                                        </div>
                                        
                                        <div className="mt-auto pt-4 border-top border-opacity-10" style={{ borderColor: 'var(--color-border)' }}>
                                            <div className="d-grid gap-3">
                                                {readyOrders.length > 0 && (
                                                    <Button variant="success" className="w-100 fw-bold py-3 shadow-sm fs-5" onClick={() => handleEntregarPedidos(sessionOrders)}>
                                                        <i className="bi bi-check-all me-2"></i>
                                                        NOTIFICAR ENTREGA
                                                    </Button>
                                                )}

                                                {unpaidOrders.length > 0 && (
                                                    <Button variant="primary" className="w-100 fw-bold py-3 shadow-sm fs-5" onClick={() => handleCobrarPedidos(sessionOrders)}>
                                                        <i className="bi bi-send-check me-2"></i>
                                                        LIQUIDAR {unpaidTotal.toFixed(2)}€
                                                    </Button>
                                                )}

                                                {unpaidOrders.length === 0 && readyOrders.length === 0 && !isPrep && (
                                                    <Button variant="outline-failure" className="w-100 fw-bold py-3 border-2 fs-5" onClick={() => handleCerrarMesa(session.id, session.mesa?.numeroMesa)}>
                                                        <i className="bi bi-door-open-fill me-2"></i>
                                                        CERRAR SERVICIO
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
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
