import React, { useState, useEffect } from 'react';
import { Button, Card, Col, Container, Form, InputGroup, Row, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { ErrorToast, SuccessToast } from '../components/Toasts';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../routes/routes';
import { GoogleLogin } from '@react-oauth/google';

export const RegisterPage: React.FC = () => {
    const { register, loginWithGoogle } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        nombre: '',
        apellidos: '',
        email: '',
        password: '',
        confirmPassword: '',
        telefono: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
        show: false,
        message: '',
        type: 'success'
    });

    useEffect(() => {
        document.body.classList.add('force-light-theme');
        return () => {
            document.body.classList.remove('force-light-theme');
        };
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            setToast({ show: true, message: 'Las contraseñas no coinciden.', type: 'error' });
            return;
        }

        setLoading(true);

        try {
            await register({
                email: formData.email,
                password: formData.password,
                nombre: formData.nombre,
                apellidos: formData.apellidos,
                telefono: formData.telefono,
                rolNombre: 'CLIENTE'
            });

            setToast({ show: true, message: '¡Cuenta creada con éxito!', type: 'success' });
            
            const pendingToken = localStorage.getItem('pendingTableToken');
            setTimeout(() => {
                if (pendingToken) {
                    localStorage.removeItem('pendingTableToken');
                    navigate(`/pedido-cliente/${pendingToken}`);
                } else {
                    navigate(ROUTES.DASHBOARD);
                }
            }, 1500);

        } catch (error: any) {
            let message = 'Error al crear la cuenta. Inténtelo de nuevo.';
            if (error.response?.data?.message) {
                message = error.response.data.message;
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
            setToast({ show: true, message: '¡Cuenta creada con Google!', type: 'success' });
            
            const pendingToken = localStorage.getItem('pendingTableToken');
            setTimeout(() => {
                if (pendingToken) {
                    localStorage.removeItem('pendingTableToken');
                    navigate(`/pedido-cliente/${pendingToken}`);
                } else {
                    navigate(ROUTES.DASHBOARD);
                }
            }, 1200);
        } catch (error) {
            setToast({ show: true, message: 'Error al registrarse con Google.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-wrapper d-flex align-items-center justify-content-center" style={{ backgroundImage: `url('/login-bg.png')`, minHeight: '100vh' }} data-theme="light">
            <Container>
                <Row className="justify-content-center">
                    <Col md={10} lg={8} xl={5}>
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
                                        <img src="/logo_navy.png" alt="Restnova Logo" style={{ height: '65px', width: 'auto' }} />
                                    </div>
                                    <div className="d-flex align-items-center justify-content-center gap-3">
                                        <div className="flex-grow-1 border-top border-2" style={{ borderColor: '#E79E0A' }}></div>
                                        <span className="small fw-bold text-primary" style={{ fontSize: '0.75rem', letterSpacing: '3px' }}>ÚNETE AL EQUIPO</span>
                                        <div className="flex-grow-1 border-top border-2" style={{ borderColor: '#E79E0A' }}></div>
                                    </div>
                                </div>

                                <Form onSubmit={handleRegister}>
                                    <Row className="g-2">
                                        <Col md={6}>
                                            <Form.Group className="mb-2">
                                                <Form.Label className="small fw-bold text-primary text-uppercase mb-1" style={{ fontSize: '0.8rem' }}>Nombre</Form.Label>
                                                <Form.Control
                                                    required
                                                    name="nombre"
                                                    placeholder="Tu nombre"
                                                    value={formData.nombre}
                                                    onChange={handleChange}
                                                    className="bg-light border-0 py-2 text-dark fw-bold rounded-3"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-2">
                                                <Form.Label className="small fw-bold text-primary text-uppercase mb-1" style={{ fontSize: '0.8rem' }}>Apellidos</Form.Label>
                                                <Form.Control
                                                    name="apellidos"
                                                    placeholder="Tus apellidos"
                                                    value={formData.apellidos}
                                                    onChange={handleChange}
                                                    className="bg-light border-0 py-2 text-dark fw-bold rounded-3"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-2">
                                                <Form.Label className="small fw-bold text-primary text-uppercase mb-1" style={{ fontSize: '0.8rem' }}>Correo Electrónico</Form.Label>
                                                <Form.Control
                                                    required
                                                    type="email"
                                                    name="email"
                                                    placeholder="ejemplo@email.com"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    className="bg-light border-0 py-2 text-dark fw-bold rounded-3"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-2">
                                                <Form.Label className="small fw-bold text-primary text-uppercase mb-1" style={{ fontSize: '0.8rem' }}>Teléfono</Form.Label>
                                                <Form.Control
                                                    name="telefono"
                                                    placeholder="600 000 000"
                                                    value={formData.telefono}
                                                    onChange={handleChange}
                                                    className="bg-light border-0 py-2 text-dark fw-bold rounded-3"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="small fw-bold text-primary text-uppercase mb-1" style={{ fontSize: '0.8rem' }}>Contraseña</Form.Label>
                                                <InputGroup className="bg-light rounded-3 overflow-hidden">
                                                    <Form.Control
                                                        required
                                                        type={showPassword ? "text" : "password"}
                                                        name="password"
                                                        placeholder="••••••••"
                                                        value={formData.password}
                                                        onChange={handleChange}
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
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="small fw-bold text-primary text-uppercase mb-1" style={{ fontSize: '0.8rem' }}>Confirmar Contraseña</Form.Label>
                                                <InputGroup className="bg-light rounded-3 overflow-hidden">
                                                    <Form.Control
                                                        required
                                                        type={showConfirmPassword ? "text" : "password"}
                                                        name="confirmPassword"
                                                        placeholder="••••••••"
                                                        value={formData.confirmPassword}
                                                        onChange={handleChange}
                                                        className="bg-transparent border-0 py-2 text-dark fw-bold shadow-none"
                                                    />
                                                    <Button
                                                        variant="link"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        className="text-muted border-0 px-3 shadow-none"
                                                    >
                                                        <i className={`bi bi-eye${showConfirmPassword ? '-slash' : ''}`}></i>
                                                    </Button>
                                                </InputGroup>
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Button
                                        type="submit"
                                        className="w-100 btn-primary py-2 fw-bold fs-5 shadow-sm mt-1"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <Spinner animation="border" size="sm" className="me-2" />
                                        ) : 'COMPLETAR REGISTRO'}
                                    </Button>
                                </Form>

                                <div className="mt-4">
                                    <div className="d-flex align-items-center mb-4">
                                        <div className="flex-grow-1 border-bottom opacity-10"></div>
                                        <span className="mx-3 text-muted small fw-bold text-uppercase" style={{ letterSpacing: '1px' }}>O REGISTRAR CON GOOGLE</span>
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
                                            text="signup_with"
                                        />
                                    </div>
                                </div>

                                <div className="text-center mt-3 pt-1">
                                    <p className="small text-muted fw-bold mb-0">
                                        ¿Ya tienes cuenta? <Button variant="link" className="text-primary text-decoration-none fw-bold p-0 ms-1" onClick={() => navigate(ROUTES.LOGIN)}>Iniciar Sesión</Button>
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

