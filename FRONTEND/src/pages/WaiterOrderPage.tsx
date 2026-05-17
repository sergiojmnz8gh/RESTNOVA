import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, ListGroup, Spinner } from 'react-bootstrap';
import { useUI } from '../context/UIContext';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../routes/routes';
import { mesaService } from '../services/mesaService';
import { productoService } from '../services/productoService';
import { pedidoService } from '../services/pedidoService';
import { BASE_URL } from '../services/apiConfig';

import type { Product, CartItem } from '../types/ProductTypes';
import type { SesionMesa } from '../types/TableTypes';

export const WaiterOrderPage: React.FC = () => {
    const { mesaId } = useParams<{ mesaId: string }>();
    const { showToast } = useUI();
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [session, setSession] = useState<SesionMesa | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const sessions = await mesaService.listarSesionesActivas();
                const activeSession = sessions.find((s: SesionMesa) => s.mesaId === Number(mesaId) && !s.fechaCierre);
                
                if (!activeSession) {
                    showToast('Error', 'La mesa no tiene una sesión activa', 'danger');
                    navigate(ROUTES.ADMIN_MESAS);
                    return;
                }
                setSession(activeSession);

                const allProds = await productoService.listarTodos();
                setProducts(allProds.filter((p: Product) => p.disponible));
            } catch (error) {
                showToast('Error', 'No se pudieron cargar los datos', 'danger');
                navigate(ROUTES.ADMIN_MESAS);
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, [mesaId, navigate, showToast]);

    const addToCart = (product: Product) => {
        setCart((prev: CartItem[]) => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => item.id === product.id ? { ...item, cantidad: item.cantidad + 1 } : item);
            }
            return [...prev, { ...product, cantidad: 1 }];
        });
    };

    const removeFromCart = (productId: number) => {
        setCart((prev: CartItem[]) => prev.filter(item => item.id !== productId));
    };

    const calculateTotal = () => {
        return cart.reduce((sum: number, item: CartItem) => sum + (item.precio * item.cantidad), 0);
    };

    const handleSendOrder = async () => {
        if (cart.length === 0) return;
        
        setIsSending(true);

        try {
            const orderPayload = {
                sesionMesaId: session?.id,
                usuarioId: user?.id,
                formaPago: 'CASH', 
                detalles: cart.map(item => ({
                    productoId: item.id,
                    cantidad: item.cantidad
                }))
            };

            await pedidoService.crear(orderPayload as any);
            
            showToast('Comanda Enviada', 'El pedido se ha enviado a cocina con éxito', 'success');
            
            setCart([]);
            setIsSending(false);
            navigate(ROUTES.ADMIN_MESAS);
        } catch (error) {
            showToast('Error', 'No se pudo enviar la comanda', 'danger');
            setIsSending(false);
        }
    };

    if (loading || !session) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100 flex-column gap-3">
                <Spinner animation="border" variant="primary" />
                <p className="text-primary fw-bold">Sincronizando TPV...</p>
            </div>
        );
    }

    return (
        <div className="min-vh-100 pb-5 bg-light">
            {}
            <div className="bg-surface shadow-sm p-3 mb-4 sticky-top border-bottom border-4 border-primary">
                <Container fluid className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-3">
                        <Button variant="light" className="rounded-circle text-muted" onClick={() => navigate(ROUTES.ADMIN_MESAS)}>
                            <i className="bi bi-arrow-left fs-5"></i>
                        </Button>
                        <div>
                            <h2 className="fw-bold mb-0 text-primary">TPV CAMARERO</h2>
                            <small className="fw-bold text-accent">MESA {session?.numeroMesa}</small>
                        </div>
                    </div>
                    <Badge bg="primary" className="fw-bold fs-6 p-2 shadow-sm">
                        <i className="bi bi-person-fill me-2"></i>{user?.nombre}
                    </Badge>
                </Container>
            </div>

            <Container fluid className="px-4">
                <Row className="g-4">
                    {}
                    <Col lg={8} xl={9}>
                        <Row className="g-3">
                            {products.map(p => (
                                <Col key={p.id} xs={6} md={4} xl={3}>
                                    <Card 
                                        className="border-0 shadow-sm h-100 cursor-pointer hover-lift overflow-hidden" 
                                        onClick={() => addToCart(p)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div className="bg-light" style={{ height: '80px' }}>
                                            <img 
                                                src={p.imagenUrl ? (p.imagenUrl.startsWith('http') ? p.imagenUrl : `${BASE_URL}${p.imagenUrl}`) : `${BASE_URL}/productos/${p.id}.png`} 
                                                alt={p.nombre} 
                                                className="w-100 h-100 object-fit-cover"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    if (target.src.endsWith('.png')) {
                                                        target.src = `${BASE_URL}/productos/${p.id}.jpg`;
                                                    } else {
                                                        target.style.display = 'none';
                                                        target.parentElement!.innerHTML = '<div class="h-100 d-flex align-items-center justify-content-center text-muted"><i class="bi bi-image"></i></div>';
                                                    }
                                                }}
                                            />
                                        </div>
                                        <Card.Body className="d-flex flex-column text-center p-2">
                                            <Badge bg="light" text="primary" className="mb-1 align-self-center small fw-bold">
                                                {p.categoria.nombre}
                                            </Badge>
                                            <h5 className="h6 fw-bold text-primary mb-auto text-uppercase" style={{ fontSize: '0.75rem' }}>{p.nombre}</h5>
                                            <div className="fw-bold fs-6 text-accent mt-1">{p.precio.toFixed(2)}€</div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </Col>

                    {}
                    <Col lg={4} xl={3}>
                        <div className="sticky-top" style={{ top: '90px' }}>
                            <Card className="border-0 shadow-premium p-0 overflow-hidden">
                                <div className="bg-primary text-white p-3 text-center">
                                    <h3 className="h5 fw-bold mb-0">NUEVA COMANDA</h3>
                                </div>
                                
                                <div className="p-3" style={{ maxHeight: '50vh', overflowY: 'auto' }}>
                                    {cart.length === 0 ? (
                                        <div className="text-center py-4 text-muted">
                                            <i className="bi bi-receipt display-4 opacity-25 mb-2"></i>
                                            <p className="small fw-bold">Comanda vacía</p>
                                        </div>
                                    ) : (
                                        <ListGroup variant="flush">
                                            {cart.map(item => (
                                                <ListGroup.Item key={item.id} className="px-0 py-2 border-bottom-dashed">
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <div className="d-flex align-items-center gap-2">
                                                            <Badge bg="accent" text="dark" className="rounded-pill p-2 fw-bold">{item.cantidad}</Badge>
                                                            <div className="fw-bold text-primary small text-uppercase" style={{ maxWidth: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                {item.nombre}
                                                            </div>
                                                        </div>
                                                        <div className="d-flex align-items-center gap-2">
                                                            <small className="fw-bold text-muted">{(item.precio * item.cantidad).toFixed(2)}€</small>
                                                            <Button variant="link" className="text-danger p-0 ms-1" onClick={(e) => { e.stopPropagation(); removeFromCart(item.id); }}>
                                                                <i className="bi bi-x-circle-fill"></i>
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </ListGroup.Item>
                                            ))}
                                        </ListGroup>
                                    )}
                                </div>

                                <div className="p-3 bg-light border-top border-2 border-primary">
                                    <div className="d-flex justify-content-between h4 fw-bold mb-3">
                                        <span>Total:</span>
                                        <span className="text-primary">{calculateTotal().toFixed(2)}€</span>
                                    </div>
                                    
                                    <Button 
                                        variant="primary" 
                                        className="w-100 py-3 fw-bold fs-5 shadow-sm" 
                                        disabled={isSending || cart.length === 0}
                                        onClick={handleSendOrder}
                                    >
                                        {isSending ? (
                                            <Spinner animation="border" size="sm" />
                                        ) : (
                                            <><i className="bi bi-send-fill me-2"></i> ENVIAR A COCINA</>
                                        )}
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    </Col>
                </Row>
            </Container>
            
            <style>{`
                .border-bottom-dashed { border-bottom: 1px dashed rgba(4, 8, 51, 0.1); }
                .hover-lift { transition: transform 0.1s ease-in-out, box-shadow 0.1s ease-in-out; }
                .hover-lift:active { transform: scale(0.98); }
            `}</style>
        </div>
    );
};

