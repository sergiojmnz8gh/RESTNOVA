import React from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { ROUTES } from '../routes/routes';
import { useUI } from '../context/UIContext';
export const Footer: React.FC = () => {
    const { isDarkMode } = useUI();
    return (
        <footer className="py-5 border-top border-light" style={{ backgroundColor: 'var(--color-footer-bg)', color: 'var(--color-text)' }}>
            <Container>
                <Row className="g-5 justify-content-between">
                    <Col lg={3} md={6}>
                        <div className="pe-lg-2">
                            <img src={isDarkMode ? "/logo_white.png" : "/logo_navy.png"} alt="Restnova Logo" style={{ height: '50px', marginBottom: '1.5rem' }} onError={(e) => { (e.target as HTMLImageElement).src = '/logo_navy.png'; }} />
                            <p className="small text-muted mb-4">Gestión gastronómica de vanguardia. Uniendo tradición y tecnología para ofrecer la mejor experiencia culinaria.</p>
                            <div className="d-flex gap-3">
                                <a href="#" className="text-primary fs-4 transition-all hover-scale"><i className="bi bi-instagram"></i></a>
                                <a href="#" className="text-primary fs-4 transition-all hover-scale"><i className="bi bi-facebook"></i></a>
                                <a href="#" className="text-primary fs-4 transition-all hover-scale"><i className="bi bi-twitter-x"></i></a>
                            </div>
                        </div>
                    </Col>

                    <Col lg={3} md={6} className="text-center d-flex flex-column align-items-center">
                        <h5 className="fw-bold text-primary text-uppercase mb-4 text-center w-100" style={{ letterSpacing: '2px' }}>Ubicación</h5>
                        <div className="d-flex flex-column gap-3 text-center align-items-center">
                            <div className="d-flex align-items-center gap-2">
                                <i className="bi bi-geo-alt-fill text-accent fs-5"></i>
                                <span className="text-muted small">Calle Gastronomía, 1. Jaén</span>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                                <i className="bi bi-telephone-fill text-accent fs-5"></i>
                                <span className="text-muted small">+34 953 456 789</span>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                                <i className="bi bi-envelope-fill text-accent fs-5"></i>
                                <span className="text-muted small">contacto@restnova.com</span>
                            </div>
                        </div>
                    </Col>

                    <Col lg={3} md={6} className="text-center d-flex flex-column align-items-center">
                        <h5 className="fw-bold text-primary text-uppercase mb-4 text-center w-100" style={{ letterSpacing: '2px' }}>Horarios</h5>
                        <div className="d-flex flex-column gap-3 text-center align-items-center">
                            <div>
                                <div className="small fw-bold text-primary text-uppercase mb-1 opacity-75">Martes a Domingo</div>
                                <div className="text-muted small">Lunes cerrado por descanso</div>
                            </div>
                            <div>
                                <div className="small fw-bold text-primary text-uppercase mb-1 opacity-75">Turnos de Servicio</div>
                                <div className="text-muted small">Comida: 13:00 - 16:00</div>
                                <div className="text-muted small">Cena: 20:00 - 23:30</div>
                            </div>
                        </div>
                    </Col>

                    <Col lg={3} md={6} className="text-center d-flex flex-column align-items-center">
                        <h5 className="fw-bold text-primary text-uppercase mb-4 text-center w-100" style={{ letterSpacing: '2px' }}>Enlaces</h5>
                        <div className="d-flex flex-column gap-2 text-center align-items-center">
                            <Link to={ROUTES.LANDING} className="text-muted text-decoration-none hover-accent small fw-bold tracking-widest text-uppercase py-1">Inicio</Link>
                            <Link to={ROUTES.MENU} className="text-muted text-decoration-none hover-accent small fw-bold tracking-widest text-uppercase py-1">La Carta</Link>
                            <Link to={ROUTES.RESERVA_CLIENTE} className="text-muted text-decoration-none hover-accent small fw-bold tracking-widest text-uppercase py-1">Reservar</Link>
                            <Link to="/politica-privacidad" className="text-muted text-decoration-none hover-accent small fw-bold tracking-widest text-uppercase py-1">Privacidad</Link>
                        </div>
                    </Col>
                </Row>
                <hr className="mt-5 mb-3 border-dark border-opacity-10" />
                <div className="text-center pb-3">
                    <p className="small mb-0 footer-copyright" style={{ letterSpacing: '2px' }}>© 2026 RESTNOVA PROJECT. TODOS LOS DERECHOS RESERVADOS.</p>
                </div>
            </Container>

            <style>{`
                .hover-accent:hover {
                    color: var(--color-accent) !important;
                    transition: color 0.2s ease;
                }
            `}</style>
        </footer>
    );
};
