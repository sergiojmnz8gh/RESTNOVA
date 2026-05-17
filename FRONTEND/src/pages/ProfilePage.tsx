import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { usuarioService } from '../services/usuarioService';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export const ProfilePage: React.FC = () => {
    const { user, updateUser } = useAuth();
    const { showToast } = useUI();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nombre: user?.nombre || '',
        apellidos: user?.apellidos || '',
        email: user?.email || '',
        telefono: user?.telefono || '',
        password: '',
        confirmPassword: ''
    });
    const [previewImage, setPreviewImage] = useState<string | null>(
        user?.imagenUrl ? (user.imagenUrl.startsWith('http') ? user.imagenUrl : `http://localhost:8080${user.imagenUrl}`) : null
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password && formData.password !== formData.confirmPassword) {
            showToast('Error', 'Las contraseñas no coinciden', 'danger');
            return;
        }

        setLoading(true);
        try {
            const payload: any = {
                nombre: formData.nombre,
                apellidos: formData.apellidos,
                email: formData.email,
                telefono: formData.telefono
            };
            if (formData.password) payload.password = formData.password;

            const resData = await usuarioService.actualizarPerfil(payload);
            updateUser(resData);
            showToast('Éxito', 'Perfil actualizado correctamente', 'success');
        } catch (error) {
            showToast('Error', 'No se pudo actualizar el perfil', 'danger');
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setPreviewImage(URL.createObjectURL(file));

            try {
                const imageUrl = await usuarioService.subirImagen(file);
                
                if (user) {
                    updateUser({ ...user, imagenUrl: imageUrl });
                }
                showToast('Éxito', 'Foto de perfil actualizada', 'success');
            } catch (error) {
                showToast('Error', 'No se pudo subir la foto', 'danger');
            }
        }
    };

    return (
        <div className="profile-page-wrapper bg-light min-vh-100 pb-0" data-theme="light">
            <Navbar transparentInitially={true} />

            {}
            <section 
                className="profile-hero py-5 position-relative overflow-hidden"
                style={{
                    backgroundColor: 'var(--color-primary)',
                    backgroundImage: `linear-gradient(rgba(4, 8, 51, 0.6), rgba(4, 8, 51, 0.9)), url('/restaurant_interior.png')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    minHeight: '40vh',
                    display: 'flex',
                    alignItems: 'center',
                    paddingTop: '120px'
                }}
            >
                <div className="position-absolute w-100 h-100" style={{ background: 'radial-gradient(circle at center, transparent 0%, rgba(4,8,51,0.4) 100%)' }}></div>
                <Container className="position-relative z-index-1 text-center py-5">
                    <div className="fade-in">
                        <div className="d-flex align-items-center justify-content-center gap-3 mb-3">
                            <div className="bg-accent" style={{ width: '30px', height: '1px' }}></div>
                            <span className="text-white fw-bold text-uppercase tracking-widest small" style={{ letterSpacing: '4px' }}>Área de Cliente</span>
                            <div className="bg-accent" style={{ width: '30px', height: '1px' }}></div>
                        </div>
                        <h1 className="display-1 fw-bold mb-0" style={{ color: 'var(--color-accent)', letterSpacing: '-2px' }}>MI PERFIL</h1>
                        <p className="lead text-white opacity-50 mt-3 fw-light text-uppercase tracking-widest" style={{ fontSize: '0.9rem' }}>Gestiona tus datos personales and configuración de cuenta</p>
                    </div>
                </Container>
            </section>

            <Container className="fade-in py-5 my-4">



            <Row className="justify-content-center">
                <Col lg={8}>
                    <Card className="border-0 shadow-premium p-4 mb-4">
                        <Card.Body className="text-center">
                            <div className="position-relative d-inline-block mb-3">
                                {previewImage ? (
                                    <img 
                                        src={previewImage} 
                                        alt="Perfil" 
                                        className="rounded-circle object-fit-cover border border-3 border-accent shadow-sm"
                                        style={{ width: '120px', height: '120px' }}
                                    />
                                ) : (
                                    <div className="rounded-circle bg-light d-flex align-items-center justify-content-center border border-3 border-accent shadow-sm" style={{ width: '120px', height: '120px' }}>
                                        <i className="bi bi-person text-secondary" style={{ fontSize: '4rem' }}></i>
                                    </div>
                                )}
                                <label 
                                    htmlFor="profile-image" 
                                    className="position-absolute bottom-0 end-0 bg-primary text-white rounded-circle cursor-pointer shadow d-flex align-items-center justify-content-center" 
                                    style={{ cursor: 'pointer', width: '38px', height: '38px' }}
                                >
                                    <i className="bi bi-camera-fill"></i>
                                </label>
                                <input 
                                    type="file" 
                                    id="profile-image" 
                                    accept="image/*" 
                                    className="d-none" 
                                    onChange={handleImageChange}
                                />
                            </div>
                            <h4 className="fw-bold mb-1">{user?.nombre} {user?.apellidos}</h4>
                            <p className="text-muted small mb-0">{user?.email}</p>
                            
                            {user?.rol === 'CLIENTE' && (
                                <div className="mt-3">
                                    <div className="d-inline-block bg-light px-4 py-2 rounded-pill border border-warning shadow-sm">
                                        <i className="bi bi-star-fill text-warning me-2"></i>
                                        <span className="fw-bold text-dark">{user.puntosAcumulados || 0} Puntos Restnova</span>
                                    </div>
                                    <p className="mt-2 text-muted small fw-bold">
                                        <i className="bi bi-info-circle me-1"></i>
                                        Acumulas 8 puntos por cada 1€ gastado. <br />
                                        <span className="text-accent">500 puntos = 5€ de descuento automático.</span>
                                    </p>
                                </div>
                            )}
                        </Card.Body>
                    </Card>

                    <Card className="border-0 shadow-premium p-4">
                        <Card.Body>
                            <Form onSubmit={handleSubmit}>
                                <Row className="g-4">
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="small fw-bold text-muted text-uppercase">Nombre</Form.Label>
                                            <Form.Control
                                                required
                                                type="text"
                                                className="bg-light border-0 py-3"
                                                value={formData.nombre}
                                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="small fw-bold text-muted text-uppercase">Apellidos</Form.Label>
                                            <Form.Control
                                                required
                                                type="text"
                                                className="bg-light border-0 py-3"
                                                value={formData.apellidos}
                                                onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="small fw-bold text-muted text-uppercase">Email</Form.Label>
                                            <Form.Control
                                                required
                                                type="email"
                                                className="bg-light border-0 py-3"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="small fw-bold text-muted text-uppercase">Teléfono</Form.Label>
                                            <Form.Control
                                                required
                                                type="tel"
                                                className="bg-light border-0 py-3"
                                                value={formData.telefono}
                                                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                            />
                                        </Form.Group>
                                    </Col>
                                    
                                    <div className="sidebar-divider my-4"></div>
                                    <h5 className="h6 fw-bold text-primary mb-0">CAMBIAR CONTRASEÑA (Opcional)</h5>

                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="small fw-bold text-muted text-uppercase">Nueva Contraseña</Form.Label>
                                            <Form.Control
                                                type="password"
                                                className="bg-light border-0 py-3"
                                                placeholder="Dejar en blanco para mantener"
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="small fw-bold text-muted text-uppercase">Confirmar Contraseña</Form.Label>
                                            <Form.Control
                                                type="password"
                                                className="bg-light border-0 py-3"
                                                value={formData.confirmPassword}
                                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                            />
                                        </Form.Group>
                                    </Col>

                                    <Col md={12} className="text-end mt-5">
                                        <Button 
                                            variant="primary" 
                                            type="submit" 
                                            className="px-5 py-3 fw-bold shadow"
                                            disabled={loading}
                                        >
                                            {loading ? <Spinner animation="border" size="sm" /> : 'GUARDAR CAMBIOS'}
                                        </Button>
                                    </Col>
                                </Row>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
        <Footer />
        </div>
    );
};

