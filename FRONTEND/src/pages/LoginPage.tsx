import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Container, Form, InputGroup, Row, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { ErrorToast, SuccessToast } from '../components/Toasts';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../routes/routes';
import { GoogleLogin } from '@react-oauth/google';

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

    const { login, loginWithGoogle } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        document.body.classList.add('force-light-theme');
        
        const rememberedEmail = localStorage.getItem('rememberedEmail');
        if (rememberedEmail) {
            setEmail(rememberedEmail);
            setRememberMe(true);
        }

        return () => {
            document.body.classList.remove('force-light-theme');
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

    const handleGoogleSuccess = async (credentialResponse: any) => {
        if (!credentialResponse.credential) return;
        setLoading(true);
        try {
            await loginWithGoogle(credentialResponse.credential);
            setToast({ show: true, message: '¡Sesión iniciada con Google!', type: 'success' });
            
            const pendingToken = localStorage.getItem('pendingTableToken');
            if (pendingToken) {
                localStorage.removeItem('pendingTableToken');
                setTimeout(() => navigate(`/pedido-cliente/${pendingToken}`), 1200);
            } else {
                setTimeout(() => navigate(ROUTES.DASHBOARD), 1200);
            }
        } catch (error) {
            setToast({ show: true, message: 'Error al iniciar sesión con Google.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-wrapper d-flex align-items-center justify-content-center" style={{ backgroundImage: `url('/login-bg.png')`, minHeight: '100vh' }} data-theme="light">
            <Container>
                <Row className="justify-content-center">
                    <Col md={8} lg={6} xl={4}>
                        <Card className="racing-card fade-in bg-white border-0 shadow-lg position-relative">
                            <Card.Body className="p-3 p-md-4 d-flex flex-column justify-content-center">
                                <Button 
                                    variant="link" 
                                    className="position-absolute top-0 start-0 m-3 text-primary p-0 shadow-none hover-grow"
                                    onClick={() => navigate(ROUTES.LANDING)}
                                    title="Volver al inicio"
                                >
                                    <i className="bi bi-arrow-left-circle fs-3"></i>
                                </Button>
                                <div className="text-center mb-4">
                                    <div className="d-flex justify-content-center mb-3">
                                        <img src="/logo_navy.png" alt="Restnova Logo" style={{ height: '70px', width: 'auto' }} />
                                    </div>
                                    <div className="d-flex align-items-center justify-content-center gap-3">
                                        <div className="flex-grow-1 border-top border-2" style={{ borderColor: '#E79E0A' }}></div>
                                        <span className="small fw-bold text-primary" style={{ fontSize: '0.75rem', letterSpacing: '3px' }}>EL FUTURO COMIENZA AHORA</span>
                                        <div className="flex-grow-1 border-top border-2" style={{ borderColor: '#E79E0A' }}></div>
                                    </div>
                                </div>

                                <Form onSubmit={handleLogin}>
                                    <Form.Group className="mb-3" controlId="formBasicEmail">
                                        <Form.Label className="small fw-bold text-primary text-uppercase" style={{ fontSize: '0.85rem' }}>Correo Electrónico</Form.Label>
                                        <Form.Control
                                            type="email"
                                            placeholder="Introduce tu email"
                                            value={email}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                                            required
                                            className="bg-light border-0 py-2 text-dark fw-bold rounded-3"
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3" controlId="formBasicPassword">
                                        <Form.Label className="small fw-bold text-primary text-uppercase" style={{ fontSize: '0.85rem' }}>Contraseña</Form.Label>
                                        <InputGroup className="bg-light rounded-3 overflow-hidden">
                                            <Form.Control
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                value={password}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                                                required
                                                className="bg-transparent border-0 py-2 text-dark fw-bold shadow-none"
                                            />
                                            <Button
                                                variant="link"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="text-muted border-0 px-3 shadow-none"
                                            >
                                                <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
                                            </Button>
                                        </InputGroup>
                                    </Form.Group>

                                    <div className="mb-4">
                                        <Form.Check
                                            type="checkbox"
                                            label="Recordar sesión"
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                            className="small text-muted fw-bold"
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-100 btn-primary py-2 fw-bold fs-5 shadow-sm"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <Spinner animation="border" size="sm" className="me-2" />
                                        ) : 'INICIAR SESIÓN'}
                                    </Button>
                                </Form>

                                <div className="mt-4">
                                    <div className="d-flex align-items-center mb-4">
                                        <div className="flex-grow-1 border-bottom opacity-10"></div>
                                        <span className="mx-3 text-muted small fw-bold text-uppercase" style={{ letterSpacing: '1px' }}>O INICIAR CON GOOGLE</span>
                                        <div className="flex-grow-1 border-bottom opacity-10"></div>
                                    </div>
                                    <div className="d-flex justify-content-center">
                                        <GoogleLogin
                                            onSuccess={handleGoogleSuccess}
                                            onError={() => {
                                                setToast({ show: true, message: 'Fallo al conectar con Google', type: 'error' });
                                            }}
                                            theme="filled_blue"
                                            shape="pill"
                                            size="large"
                                            text="signin_with"
                                        />
                                    </div>
                                </div>

                                <div className="text-center mt-4 pt-2">
                                    <p className="small text-muted fw-bold mb-0">
                                        ¿Nuevo en RESTNOVA? <Button variant="link" className="text-primary text-decoration-none fw-bold p-0 ms-1" onClick={() => navigate(ROUTES.REGISTER)}>Crear Cuenta</Button>
                                    </p>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>

            {}
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

