import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Button, Form, Spinner, Row, Col } from 'react-bootstrap';
import api from '../services/apiConfig';
import { useUI } from '../context/UIContext';

export const RedsysMockPage: React.FC = () => {
    const { pedidoId } = useParams<{ pedidoId: string }>();
    const navigate = useNavigate();
    const { showToast } = useUI();
    
    const [amount, setAmount] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        
        const loadOrderData = async () => {
            try {
                
                
                const res = await api.get('/pedidos');
                const order = res.data.find((o: any) => o.id === Number(pedidoId));
                
                if (!order) {
                    showToast('Error', 'Pedido no encontrado para pago', 'danger');
                    navigate('/');
                    return;
                }
                
                if (order.estado !== 'PENDIENTE_PAGO') {
                    showToast('Aviso', 'Este pedido ya está pagado o procesado', 'info');
                    navigate('/');
                    return;
                }
                
                setAmount(order.total);
            } catch (error) {
                showToast('Error', 'No se pudo conectar con la pasarela', 'danger');
                navigate('/');
            } finally {
                setLoading(false);
            }
        };
        
        loadOrderData();
    }, [pedidoId, navigate, showToast]);

    const simulatePayment = async (success: boolean) => {
        setProcessing(true);
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        try {
            
            const responseCode = success ? '0000' : '9999';
            await api.post(`/pedidos/${pedidoId}/pago-callback`, { responseCode });
            
            if (success) {
                showToast('Pago Aceptado', 'La transacción se ha completado con éxito', 'success');
                
                navigate('/?pago=success');
            } else {
                showToast('Pago Denegado', 'La tarjeta ha sido rechazada', 'danger');
                setProcessing(false);
            }
        } catch (error) {
            showToast('Error crítico', 'Error en la comunicación con el banco', 'danger');
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100 flex-column gap-3 bg-light">
                <Spinner animation="grow" variant="primary" />
                <p className="fw-bold text-muted">Conectando con entorno seguro...</p>
            </div>
        );
    }

    return (
        <div className="vh-100 d-flex justify-content-center align-items-center bg-light fade-in">
            <Container style={{ maxWidth: '500px' }}>
                <Card className="border-0 shadow-lg overflow-hidden rounded-4">
                    {}
                    <div className="bg-primary p-4 text-center text-white border-bottom border-4 border-accent">
                        <h2 className="mb-0 fw-bold d-flex align-items-center justify-content-center gap-2">
                            <i className="bi bi-shield-lock-fill"></i> PASARELA SEGURA
                        </h2>
                        <small className="opacity-75 tracking-widest text-uppercase">Entorno de Pruebas Restnova</small>
                    </div>

                    <Card.Body className="p-4 p-md-5">
                        <div className="text-center mb-4">
                            <h4 className="text-muted fw-bold small text-uppercase">Importe a Pagar</h4>
                            <h1 className="display-4 fw-bold text-primary">{amount?.toFixed(2)}€</h1>
                            <div className="text-muted small">Nº de Pedido: #{pedidoId}</div>
                        </div>

                        {processing ? (
                            <div className="text-center py-4">
                                <Spinner animation="border" variant="accent" style={{ width: '3rem', height: '3rem' }} />
                                <p className="mt-3 fw-bold text-muted animate-pulse">Contactando con entidad emisora...</p>
                            </div>
                        ) : (
                            <Form>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold text-muted">Número de Tarjeta (SIMULADO)</Form.Label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light"><i className="bi bi-credit-card-2-front text-primary"></i></span>
                                        <Form.Control type="text" value="4548 8100 0000 0000" readOnly className="bg-light fw-bold text-muted" />
                                    </div>
                                </Form.Group>

                                <Row className="mb-4">
                                    <Col xs={6}>
                                        <Form.Group>
                                            <Form.Label className="small fw-bold text-muted">Caducidad</Form.Label>
                                            <Form.Control type="text" value="12/28" readOnly className="bg-light text-center" />
                                        </Form.Group>
                                    </Col>
                                    <Col xs={6}>
                                        <Form.Group>
                                            <Form.Label className="small fw-bold text-muted">CVV</Form.Label>
                                            <Form.Control type="text" value="***" readOnly className="bg-light text-center" />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <div className="d-grid gap-3 mt-4">
                                    <Button 
                                        variant="primary" 
                                        className="py-3 fw-bold fs-5 shadow-sm"
                                        onClick={() => simulatePayment(true)}
                                    >
                                        <i className="bi bi-check-circle-fill me-2"></i> AUTORIZAR PAGO
                                    </Button>
                                    <Button 
                                        variant="outline-danger" 
                                        className="py-2 fw-bold"
                                        onClick={() => simulatePayment(false)}
                                    >
                                        SIMULAR FALLO / DENEGAR
                                    </Button>
                                </div>
                            </Form>
                        )}
                    </Card.Body>
                    
                    <div className="bg-light p-3 text-center text-muted border-top border-opacity-10" style={{ fontSize: '0.75rem' }}>
                        <i className="bi bi-lock-fill me-1"></i>
                        Esta es una pasarela simulada. No introduzca datos reales.
                    </div>
                </Card>
            </Container>
        </div>
    );
};

