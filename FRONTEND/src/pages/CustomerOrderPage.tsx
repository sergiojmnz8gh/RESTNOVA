import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, ListGroup, Spinner, Form } from 'react-bootstrap';
import { useUI } from '../context/UIContext';
import { useAuth } from '../context/AuthContext';
import { mesaService } from '../services/mesaService';
import { productoService } from '../services/productoService';
import { pedidoService } from '../services/pedidoService';
import { BASE_URL } from '../services/apiConfig';

import { usuarioService } from '../services/usuarioService';

import type { Product, CartItem } from '../types/ProductTypes';
import type { SesionMesa } from '../types/TableTypes';

export const CustomerOrderPage: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const { showToast } = useUI();
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    
    const [session, setSession] = useState<SesionMesa | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isPaying, setIsPaying] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'CASH'>('CARD');
    const [usaPuntos, setUsaPuntos] = useState(false);

    useEffect(() => {
        
        if (!user) {
            localStorage.setItem('pendingTableToken', token || '');
            showToast('Identificación Necesaria', 'Por favor, inicia sesión para realizar tu pedido.', 'info');
            navigate('/login');
            return;
        }

        const loadInitialData = async () => {
            try {
                
                if (!token) throw new Error('Token is required');
                const sessionData = await mesaService.obtenerSesionPorToken(token);
                setSession(sessionData);

                
                const allProds = await productoService.listarTodos();
                setProducts(allProds.filter((p: Product) => p.disponible));
            } catch (error: any) {
                const errorMsg = error.response?.data?.message || 'Sesión no válida o expirada';
                if (errorMsg.includes('cerrada')) {
                    showToast('Mesa Cerrada', 'Esta mesa ha sido cerrada. Por favor, pague su cuenta si no lo ha hecho.', 'warning');
                } else {
                    showToast('Error', errorMsg, 'danger');
                }
                navigate('/');
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, [token, user]);

    const addToCart = (product: Product) => {
        setCart((prev: CartItem[]) => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => item.id === product.id ? { ...item, cantidad: item.cantidad + 1 } : item);
            }
            return [...prev, { ...product, cantidad: 1 }];
        });
        showToast('Añadido', `${product.nombre} añadido al pedido`);
    };

    const removeFromCart = (productId: number) => {
        setCart((prev: CartItem[]) => prev.filter(item => item.id !== productId));
    };

    const calculateTotal = () => {
        return cart.reduce((sum: number, item: CartItem) => sum + (item.precio * item.cantidad), 0);
    };

    const handleProcessPayment = async () => {
        if (cart.length === 0) return;
        
        setIsPaying(true);

        try {
            const orderPayload = {
                sesionMesaId: session?.id,
                usuarioId: user?.id,
                formaPago: paymentMethod,
                usaPuntos: usaPuntos,
                detalles: cart.map(item => ({
                    productoId: item.id,
                    cantidad: item.cantidad
                }))
            };

            const createdOrder = await pedidoService.crear(orderPayload as any);
            
            
            try {
                const profileData = await usuarioService.obtenerPerfil();
                updateUser(profileData);
            } catch (err) {
                console.error("Error al actualizar los puntos del usuario tras realizar pedido", err);
            }

            setCart([]);
            setIsPaying(false);

            if (paymentMethod === 'CARD') {
                navigate(`/pago-redsys/${createdOrder.id}`);
            } else {
                showToast('Pedido Enviado', 'Su pedido ha sido enviado. Por favor, pague al personal.', 'success');
                navigate('/?pedido=enviado');
            }
        } catch (error) {
            showToast('Error', 'No se pudo procesar el pedido', 'danger');
            setIsPaying(false);
        }
    };

    const handleCallWaiter = async () => {
        try {
            await fetch('/api/notificaciones', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mensaje: `¡ATENCIÓN! La Mesa ${session?.numeroMesa} solicita asistencia.`,
                    tipo: 'LLAMAR_CAMARERO',
                    mesa: { id: session?.mesaId }
                })
            });
            showToast('Aviso', 'El personal ha sido notificado y acudirá a su mesa', 'info');
        } catch (error) {
            showToast('Error', 'No se pudo avisar al personal', 'danger');
        }
    };

    if (loading || !session) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100 flex-column gap-3">
                <Spinner animation="grow" variant="primary" />
                <p className="text-primary brand-font">Sincronizando con RESTNOVA...</p>
            </div>
        );
    }

    return (
        <div className="min-vh-100 pb-5">
            {}
            <div className="bg-transparent p-3 mb-4 text-center">
                <Container>
                    <h2 className="brand-font h3 mb-2 text-primary">CARTA INTERACTIVA</h2>
                    <div className="d-flex justify-content-center align-items-center gap-3">
                        <Badge bg="accent" text="dark" className="fw-bold fs-6 shadow-sm px-3 py-2">
                            <i className="bi bi-person-fill me-2"></i>{user?.nombre}
                        </Badge>
                        <Badge bg="primary" className="fw-bold fs-6 shadow-sm px-3 py-2 border border-accent">
                            Mesa {session?.numeroMesa || '...'}
                        </Badge>
                    </div>
                </Container>
            </div>

            <Container>
                <Row className="g-4">
                    {}
                    <Col lg={8}>
                        <h3 className="h5 fw-bold mb-3 d-flex align-items-center gap-2 text-primary text-uppercase tracking-widest">
                            <i className="bi bi-journal-richtext"></i>
                            Nuestra Carta
                        </h3>
                        <Row className="g-3">
                            {products.map(p => (
                                <Col key={p.id} xs={12} md={6}>
                                    <Card className="border-0 shadow-premium h-100 p-2 card-premium overflow-hidden">
                                        <Card.Body className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3">
                                            <div className="bg-light rounded-4 overflow-hidden flex-shrink-0" style={{ width: '100%', height: '120px', maxWidth: '120px' }}>
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
                                            <div className="flex-grow-1">
                                                <Badge bg="primary" className="mb-2 tiny opacity-75">{p.categoria.nombre}</Badge>
                                                <h4 className="h6 fw-bold text-primary mb-1 text-uppercase">{p.nombre}</h4>
                                                <p className="small text-secondary mb-2 text-truncate-2" style={{ fontWeight: '500' }}>{p.descripcion}</p>
                                                <div className="fw-bold fs-5 text-accent">{p.precio.toFixed(2)}€</div>
                                            </div>
                                            <Button 
                                                variant="primary" 
                                                className="rounded-circle p-0 shadow-none flex-shrink-0 align-self-end mt-auto mt-md-0"
                                                onClick={() => addToCart(p)}
                                                style={{ width: '45px', height: '45px' }}
                                            >
                                                <i className="bi bi-plus-lg fs-4"></i>
                                            </Button>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </Col>

                    {}
                    <Col lg={4}>
                        <div className="sticky-top" style={{ top: '100px' }}>
                            <Card className="border-0 shadow-premium p-4 rounded-4">
                                <h3 className="h5 fw-bold mb-4 d-flex align-items-center gap-2 text-primary text-uppercase tracking-widest">
                                    <i className="bi bi-cart3"></i>
                                    Tu Pedido
                                </h3>
                                
                                {cart.length === 0 ? (
                                    <div className="text-center py-5 text-muted opacity-50">
                                        <i className="bi bi-basket-fill display-1 mb-3"></i>
                                        <p className="fw-bold">TU CESTA ESTÁ VACÍA</p>
                                    </div>
                                ) : (
                                    <>
                                        <ListGroup variant="flush" className="mb-4">
                                            {cart.map(item => (
                                                <ListGroup.Item key={item.id} className="px-0 py-3 border-light bg-transparent">
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <div className="d-flex align-items-center gap-3">
                                                            <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: '30px', height: '30px', fontSize: '0.8rem' }}>{item.cantidad}</div>
                                                            <div>
                                                                <div className="fw-bold small text-primary">{item.nombre}</div>
                                                                <small className="text-muted">{(item.precio * item.cantidad).toFixed(2)}€</small>
                                                            </div>
                                                        </div>
                                                        <Button variant="link" className="text-danger p-0" onClick={() => removeFromCart(item.id)}>
                                                            <i className="bi bi-trash fs-5"></i>
                                                        </Button>
                                                    </div>
                                                </ListGroup.Item>
                                            ))}
                                        </ListGroup>

                                        <div className="bg-light p-4 rounded-4 mb-4 border border-accent border-opacity-10">
                                            {user && (
                                                <div className="mb-4 border-bottom border-accent border-opacity-10 pb-4">
                                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                                        <span className="tiny fw-bold text-muted">Fidelización</span>
                                                        <Badge bg="accent" className="rounded-pill px-3 py-2 text-primary shadow-sm fw-bold">
                                                            {user?.puntosAcumulados || 0} PUNTOS
                                                        </Badge>
                                                    </div>
                                                    
                                                    <div className={`p-3 rounded-4 transition-all ${(user?.puntosAcumulados || 0) >= 500 ? 'bg-white shadow-sm border border-accent border-opacity-20' : 'bg-secondary bg-opacity-5 opacity-75'}`}>
                                                        <Form.Check 
                                                            type="switch"
                                                            id="use-points-switch"
                                                            label={
                                                                <div className="ms-2">
                                                                    <div className="fw-bold text-primary small">Canjear Puntos</div>
                                                                    <div className="small text-muted">
                                                                        Descuento: <span className="text-accent fw-bold">
                                                                            {(Math.min(user?.puntosAcumulados || 0, calculateTotal() * 100) / 100).toFixed(2)}€
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            }
                                                            disabled={!((user?.puntosAcumulados || 0) >= 500)}
                                                            checked={usaPuntos}
                                                            onChange={(e) => setUsaPuntos(e.target.checked)}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                            
                                            <div className="d-flex justify-content-between h4 fw-bold mb-0">
                                                <span className="text-muted small align-self-center">TOTAL</span>
                                                <span className="text-primary fs-2">
                                                    {usaPuntos 
                                                        ? Math.max(0, calculateTotal() - ((user?.puntosAcumulados || 0) * 0.01)).toFixed(2)
                                                        : calculateTotal().toFixed(2)}€
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <Form.Label className="tiny fw-bold text-muted mb-2">Método de Pago</Form.Label>
                                            <div className="d-grid gap-2">
                                                <Button 
                                                    variant={paymentMethod === 'CARD' ? 'primary' : 'outline-primary'} 
                                                    className="text-start d-flex justify-content-between align-items-center py-3 border-1 rounded-3"
                                                    onClick={() => setPaymentMethod('CARD')}
                                                >
                                                    <span className="small fw-bold"><i className="bi bi-credit-card me-2"></i> TARJETA</span>
                                                    {paymentMethod === 'CARD' && <i className="bi bi-check-circle-fill"></i>}
                                                </Button>
                                                <Button 
                                                    variant={paymentMethod === 'CASH' ? 'primary' : 'outline-primary'} 
                                                    className="text-start d-flex justify-content-between align-items-center py-3 border-1 rounded-3"
                                                    onClick={() => setPaymentMethod('CASH')}
                                                >
                                                    <span className="small fw-bold"><i className="bi bi-cash-stack me-2"></i> EFECTIVO</span>
                                                    {paymentMethod === 'CASH' && <i className="bi bi-check-circle-fill"></i>}
                                                </Button>
                                            </div>
                                        </div>

                                        <Button 
                                            variant="primary" 
                                            className="w-100 py-3 fw-bold shadow-lg rounded-3 border-0 text-white" 
                                            disabled={isPaying}
                                            onClick={handleProcessPayment}
                                        >
                                            {isPaying ? (
                                                <span className="d-flex align-items-center justify-content-center gap-2">
                                                    <Spinner animation="border" size="sm" /> 
                                                    PROCESANDO...
                                                </span>
                                            ) : (
                                                `REALIZAR PEDIDO`
                                            )}
                                        </Button>
                                    </>
                                )}
                            </Card>
                        </div>
                    </Col>
                </Row>
            </Container>

            {}
            <Button 
                variant="accent" 
                className="position-fixed bottom-0 end-0 m-4 rounded-circle shadow-lg p-0 d-flex align-items-center justify-content-center transition-all hover-scale"
                style={{ width: '70px', height: '70px', zIndex: 1000 }}
                onClick={handleCallWaiter}
            >
                <i className="bi bi-bell-fill fs-3 text-primary"></i>
            </Button>



            <style>{`
                @keyframes loadingBar {
                    from { width: 0%; }
                    to { width: 100%; }
                }
                .text-truncate-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .card-hover:hover {
                    transform: translateY(-5px);
                    transition: transform 0.3s ease;
                }
            `}</style>
        </div>
    );
};

