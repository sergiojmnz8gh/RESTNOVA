import React, { useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export const PrivacyPolicyPage: React.FC = () => {
    useEffect(() => {
        document.body.classList.add('force-light-theme');
        window.scrollTo(0, 0);
        return () => {
            document.body.classList.remove('force-light-theme');
        };
    }, []);

    return (
        <div className="privacy-policy-page min-vh-100 bg-white" data-theme="light">
            <Navbar transparentInitially={true} />

            {}
            <section 
                className="privacy-hero py-5 position-relative overflow-hidden"
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
                            <span className="fw-bold text-uppercase tracking-widest small" style={{ color: 'var(--color-accent)', letterSpacing: '4px' }}>Seguridad y Confianza</span>
                            <div className="bg-accent" style={{ width: '30px', height: '1px' }}></div>
                        </div>
                        <h1 className="display-1 fw-bold text-white mb-0" style={{ letterSpacing: '-2px' }}>POLÍTICA DE <span style={{ color: 'var(--color-accent)' }}>PRIVACIDAD</span></h1>
                        <p className="lead text-white opacity-50 mt-3 fw-light text-uppercase tracking-widest" style={{ fontSize: '0.9rem' }}>Tu privacidad y seguridad son nuestro mayor compromiso</p>
                    </div>
                </Container>
            </section>

            <Container className="py-5 my-5">
                <Row className="justify-content-center">
                    <Col lg={10}>
                        <Card className="border-0 shadow-premium p-4 p-md-5 rounded-4 bg-white mb-5">
                            <Card.Body className="fade-in" style={{ animationDelay: '0.2s' }}>
                                <h3 className="fw-bold text-primary mb-4 text-uppercase">1. Responsable del Tratamiento</h3>
                                <p className="text-muted mb-5 leading-relaxed">
                                    El responsable del tratamiento de los datos recabados a través de esta plataforma web es <strong>RESTNOVA S.L.</strong>, 
                                    con domicilio social en Calle Gastronomía, 1, Jaén, España, y dirección de correo electrónico de contacto: 
                                    <a href="mailto:contacto@restnova.com" className="text-primary text-decoration-none fw-bold ms-1 hover-accent">contacto@restnova.com</a>.
                                    Garantizamos la confidencialidad y protección de los datos de carácter personal conforme a las normativas vigentes (RGPD y LOPDGDD).
                                </p>

                                <h3 className="fw-bold text-primary mb-4 text-uppercase">2. Datos que Recopilamos</h3>
                                <p className="text-muted mb-3 leading-relaxed">
                                    Recopilamos únicamente la información necesaria para brindarte la mejor experiencia gastronómica tanto digital como física en nuestro establecimiento:
                                </p>
                                <ul className="text-muted mb-5 ps-4 leading-relaxed">
                                    <li className="mb-2"><strong>Datos de Registro:</strong> Nombre, apellidos, dirección de correo electrónico y teléfono de contacto.</li>
                                    <li className="mb-2"><strong>Datos de Reserva:</strong> Fecha, hora del turno seleccionado, número de comensales y preferencias especiales.</li>
                                    <li className="mb-2"><strong>Control de Sesión de Mesa (QR):</strong> Registros de vinculación de pedidos y transacciones para la mesa correspondiente.</li>
                                    <li className="mb-2"><strong>Sistema de Fidelización:</strong> Puntos Restnova acumulados para la aplicación automática de descuentos promocionales.</li>
                                </ul>

                                <h3 className="fw-bold text-primary mb-4 text-uppercase">3. Finalidad del Tratamiento</h3>
                                <p className="text-muted mb-3 leading-relaxed">
                                    Tratamos tus datos con el fin de gestionar la relación contigo y optimizar el servicio del restaurante:
                                </p>
                                <ul className="text-muted mb-5 ps-4 leading-relaxed">
                                    <li className="mb-2">Gestionar la reserva en tiempo real y coordinar los turnos de comida y cena de forma eficiente.</li>
                                    <li className="mb-2">Permitir la facturación, el control de pedidos en mesa y el procesamiento seguro de pagos.</li>
                                    <li className="mb-2">Mantener al día tus puntos acumulados de fidelidad (8 puntos por cada 1€ de consumo) para aplicarte el descuento automático de 5€ cada 500 puntos.</li>
                                    <li className="mb-2">Comunicar cambios operativos en las reservas o actualizaciones del estado del servicio.</li>
                                </ul>

                                <h3 className="fw-bold text-primary mb-4 text-uppercase">4. Seguridad y Encriptación</h3>
                                <p className="text-muted mb-5 leading-relaxed">
                                    Toda la información personal transmitida a través de nuestra web se encripta mediante protocolos de transferencia segura (HTTPS/SSL). 
                                    Las contraseñas de las cuentas de usuario se almacenan de forma segura utilizando sistemas avanzados de hashing y encriptación de nivel bancario (BCrypt), 
                                    lo que garantiza que nadie, ni siquiera los administradores de la base de datos, puedan conocer tu contraseña en texto plano.
                                </p>

                                <h3 className="fw-bold text-primary mb-4 text-uppercase">5. Tus Derechos</h3>
                                <p className="text-muted mb-3 leading-relaxed">
                                    Como usuario de RestNova, ostentas plenos derechos sobre tus datos personales:
                                </p>
                                <ul className="text-muted mb-0 ps-4 leading-relaxed">
                                    <li className="mb-2"><strong>Acceso y Rectificación:</strong> Consultar qué datos tenemos sobre ti y solicitar su corrección si son inexactos.</li>
                                    <li className="mb-2"><strong>Supresión (Derecho al Olvido):</strong> Solicitar la eliminación total de tu cuenta de usuario e historial.</li>
                                    <li className="mb-2"><strong>Oposición y Limitación:</strong> Oponerte al tratamiento de tus datos para fines promocionales o informativos.</li>
                                </ul>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>

            <Footer />
        </div>
    );
};
