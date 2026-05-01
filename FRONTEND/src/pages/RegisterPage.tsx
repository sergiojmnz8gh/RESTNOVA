import React, { useState } from 'react';
import { Button, Card, Col, Container, Form, InputGroup, Row, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { ErrorToast, SuccessToast } from '../components/common/Toasts';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../routes/routes';

export const RegisterPage: React.FC = () => {
    const { register } = useAuth();
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
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
        show: false,
        message: '',
        type: 'success'
    });

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
                rolNombre: 'CLIENTE' // Default role for public registration
            });

            setToast({ show: true, message: '¡Cuenta creada con éxito!', type: 'success' });
            
            // Redirect to customer order if coming from a QR link, otherwise dashboard
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

    return (
        <div className="login-wrapper" style={{ backgroundImage: `url('/login-bg.png')` }} data-theme="light">
            <Container>
                <Row className="justify-content-center">
                    <Col md={12} lg={10} xl={7}>
                        <Card className="racing-card fade-in bg-white border-0 shadow-lg" style={{ minHeight: '700px' }}>
                            <Card.Body className="p-4 p-md-5 d-flex flex-column justify-content-center">
                                <div className="text-center mb-4">
                                    <div className="d-flex justify-content-center mb-3">
                                        <img src="/logo_navy.png" alt="Restnova Logo" style={{ height: '110px', width: 'auto' }} />
                                    </div>
                                    <h2 className="text-primary fw-bold mb-1 italic">ÚNETE AL EQUIPO</h2>
                                    <p className="text-muted small fw-bold italic">REGISTRA TU CUENTA PARA EMPEZAR LA EXPERIENCIA</p>
                                </div>

                                <Form onSubmit={handleRegister}>
                                    <Row className="g-3">
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="small fw-bold text-primary text-uppercase">Nombre</Form.Label>
                                                <Form.Control
                                                    required
                                                    name="nombre"
                                                    placeholder="Tu nombre"
                                                    value={formData.nombre}
                                                    onChange={handleChange}
                                                    className="bg-light border-0 py-3 text-dark fw-bold italic"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="small fw-bold text-primary text-uppercase">Apellidos</Form.Label>
                                                <Form.Control
                                                    name="apellidos"
                                                    placeholder="Tus apellidos"
                                                    value={formData.apellidos}
                                                    onChange={handleChange}
                                                    className="bg-light border-0 py-3 text-dark fw-bold italic"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="small fw-bold text-primary text-uppercase">Correo Electrónico</Form.Label>
                                                <Form.Control
                                                    required
                                                    type="email"
                                                    name="email"
                                                    placeholder="ejemplo@email.com"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    className="bg-light border-0 py-3 text-dark fw-bold italic"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="small fw-bold text-primary text-uppercase">Teléfono</Form.Label>
                                                <Form.Control
                                                    name="telefono"
                                                    placeholder="600 000 000"
                                                    value={formData.telefono}
                                                    onChange={handleChange}
                                                    className="bg-light border-0 py-3 text-dark fw-bold italic"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="small fw-bold text-primary text-uppercase">Contraseña</Form.Label>
                                                <InputGroup>
                                                    <Form.Control
                                                        required
                                                        type={showPassword ? "text" : "password"}
                                                        name="password"
                                                        placeholder="••••••••"
                                                        value={formData.password}
                                                        onChange={handleChange}
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
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-4">
                                                <Form.Label className="small fw-bold text-primary text-uppercase">Confirmar Contraseña</Form.Label>
                                                <Form.Control
                                                    required
                                                    type="password"
                                                    name="confirmPassword"
                                                    placeholder="••••••••"
                                                    value={formData.confirmPassword}
                                                    onChange={handleChange}
                                                    className="bg-light border-0 py-3 text-dark fw-bold italic"
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Button
                                        type="submit"
                                        className="w-100 btn-primary py-3 fw-bold fs-4 shadow-sm italic mt-2"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <Spinner animation="border" size="sm" className="me-2" />
                                        ) : 'COMPLETAR REGISTRO'}
                                    </Button>
                                </Form>

                                <div className="text-center mt-4 pt-2">
                                    <p className="small text-muted fw-bold mb-0 italic fs-6">
                                        ¿Ya tienes cuenta? <Button variant="link" className="text-primary text-decoration-none fw-bold p-0 ms-1 italic fs-6" onClick={() => navigate(ROUTES.LOGIN)}>Iniciar Sesión</Button>
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
