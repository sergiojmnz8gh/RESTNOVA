import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Container, Form, InputGroup, Row, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { ErrorToast, SuccessToast } from '../components/common/Toasts';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../routes/routes';

export const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
        show: false,
        message: '',
        type: 'success'
    });

    const { login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Forzar tema claro en el login sin importar la preferencia global
        const originalTheme = document.documentElement.getAttribute('data-theme');
        document.documentElement.setAttribute('data-theme', 'light');
        
        const rememberedEmail = localStorage.getItem('rememberedEmail');
        if (rememberedEmail) {
            setEmail(rememberedEmail);
            setRememberMe(true);
        }

        return () => {
            // Restaurar tema original al salir del login
            if (originalTheme) {
                document.documentElement.setAttribute('data-theme', originalTheme);
            } else {
                document.documentElement.removeAttribute('data-theme');
            }
        };
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await login({ email, password }, rememberMe);
            setToast({ show: true, message: '¡Sesión iniciada con éxito!', type: 'success' });

            const pendingToken = localStorage.getItem('pendingTableToken');
            if (pendingToken) {
                localStorage.removeItem('pendingTableToken');
                setTimeout(() => navigate(`/pedido-cliente/${pendingToken}`), 1200);
            } else {
                setTimeout(() => navigate(ROUTES.DASHBOARD), 1200);
            }
        } catch (error: any) {
            let message = 'Error al iniciar sesión. Compruebe sus credenciales.';
            if (error.response?.status === 401) {
                message = 'Credenciales incorrectas.';
            } else if (error.code === 'ERR_NETWORK') {
                message = 'El servidor no responde.';
            }
            setToast({ show: true, message, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-wrapper" style={{ backgroundImage: `url('/login-bg.png')` }} data-theme="light">
            <Container>
                <Row className="justify-content-center">
                    <Col md={10} lg={8} xl={5}>
                        <Card className="racing-card fade-in bg-white border-0 shadow-lg" style={{ minHeight: '650px' }}>
                            <Card.Body className="p-4 p-md-5 d-flex flex-column justify-content-center">
                                <div className="text-center mb-5">
                                    <div className="d-flex justify-content-center mb-4">
                                        <img src="/logo_navy.png" alt="Restnova Logo" style={{ height: '140px', width: 'auto' }} />
                                    </div>
                                    <div className="d-flex align-items-center justify-content-center gap-3">
                                        <div className="flex-grow-1 border-top border-2" style={{ borderColor: '#E79E0A' }}></div>
                                        <span className="small fw-bold text-primary" style={{ fontSize: '0.8rem', letterSpacing: '3px' }}>FUTURE STARTS NOW</span>
                                        <div className="flex-grow-1 border-top border-2" style={{ borderColor: '#E79E0A' }}></div>
                                    </div>
                                </div>

                                <Form onSubmit={handleLogin}>
                                    <Form.Group className="mb-4" controlId="formBasicEmail">
                                        <Form.Label className="small fw-bold text-primary text-uppercase" style={{ fontSize: '0.85rem' }}>Correo Electrónico</Form.Label>
                                        <Form.Control
                                            type="email"
                                            placeholder="Introduce tu email"
                                            value={email}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                                            required
                                            className="bg-light border-0 py-3 text-dark fw-bold italic"
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-4" controlId="formBasicPassword">
                                        <Form.Label className="small fw-bold text-primary text-uppercase" style={{ fontSize: '0.85rem' }}>Contraseña</Form.Label>
                                        <InputGroup>
                                            <Form.Control
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                value={password}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                                                required
                                                className="bg-light border-0 py-3 text-dark fw-bold italic"
                                            />
                                            <Button
                                                variant="light"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="bg-light text-muted border-0 px-3"
                                            >
                                                <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
                                            </Button>
                                        </InputGroup>
                                    </Form.Group>

                                    <div className="mb-5">
                                        <Form.Check
                                            type="checkbox"
                                            label="Recordar sesión"
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                            className="small text-muted fw-bold italic fs-6"
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-100 btn-primary py-3 fw-bold fs-4 shadow-sm italic"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <Spinner animation="border" size="sm" className="me-2" />
                                        ) : 'INICIAR SESIÓN'}
                                    </Button>
                                </Form>

                                <div className="text-center mt-5 pt-3">
                                    <p className="small text-muted fw-bold mb-0 italic fs-6">
                                        ¿Nuevo en RESTNOVA? <Button variant="link" className="text-primary text-decoration-none fw-bold p-0 ms-1 italic fs-6" onClick={() => navigate(ROUTES.REGISTER)}>Crear Cuenta</Button>
                                    </p>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>

            {/* Notifications */}
            {toast.show && (
                toast.type === 'success' ? (
                    <SuccessToast
                        show={toast.show}
                        message={toast.message}
                        onClose={() => setToast({ ...toast, show: false })}
                    />
                ) : (
                    <ErrorToast
                        show={toast.show}
                        message={toast.message}
                        onClose={() => setToast({ ...toast, show: false })}
                    />
                )
            )}
        </div>
    );
};
