import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { ROUTES } from '../routes/routes';
import { reservaService } from '../services/reservaService';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export const CustomerReservationPage: React.FC = () => {
    const { user } = useAuth();
    const { showToast, isDarkMode } = useUI();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [maxCapacity, setMaxCapacity] = useState<number>(12);

    const [formData, setFormData] = useState({
        fecha: '',
        hora: '',
        numPersonas: 2
    });
    const [availableTimes, setAvailableTimes] = useState<string[]>([]);
    const [fetchingTimes, setFetchingTimes] = useState(false);

    useEffect(() => {
        if (!user) {
            showToast('Identificación Necesaria', 'Por favor, inicia sesión para solicitar una reserva.', 'info');
            navigate('/login');
        }
    }, [user, navigate]);

    useEffect(() => {
        const fetchMaxCapacity = async () => {
            try {
                const data = await reservaService.obtenerMaxCapacidad();
                if (data) setMaxCapacity(data);
            } catch (error) {
                console.error("Error fetching max capacity", error);
            }
        };
        if (user) {
            fetchMaxCapacity();
        }
    }, [user]);

    useEffect(() => {
        if (formData.fecha && formData.numPersonas && formData.numPersonas <= maxCapacity) {
            const fetchAvailability = async () => {
                setFetchingTimes(true);
                try {
                    const times = await reservaService.consultarDisponibilidad(formData.fecha, formData.numPersonas);
                    setAvailableTimes(times);
                    
                    if (formData.hora && !times.includes(formData.hora)) {
                        setFormData(prev => ({ ...prev, hora: '' }));
                    }
                } catch (error) {
                    console.error("Error fetching availability", error);
                    showToast('Error', 'No se pudo consultar la disponibilidad', 'danger');
                } finally {
                    setFetchingTimes(false);
                }
            };
            fetchAvailability();
        } else {
            setAvailableTimes([]);
        }
    }, [formData.fecha, formData.numPersonas, maxCapacity]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.hora) {
            showToast('Error', 'Seleccione una hora válida', 'warning');
            return;
        }

        const [hours, minutes] = formData.hora.split(':').map(Number);
        const selectedTime = hours * 60 + minutes;

        const inicioComida = 13 * 60;
        const finComida = 16 * 60;
        const inicioCena = 20 * 60;
        const finCena = 23 * 60 + 30;

        let isValidShift = false;
        let limitTime = 0;

        if (selectedTime >= inicioComida && selectedTime < finComida) {
            isValidShift = true;
            limitTime = finComida - 60;
        } else if (selectedTime >= inicioCena && selectedTime < finCena) {
            isValidShift = true;
            limitTime = finCena - 60;
        }

        if (!isValidShift) {
            showToast('Horario Inválido', 'Por favor, selecciona una hora dentro de nuestros turnos (13:00-16:00 o 20:00-23:30)', 'warning');
            return;
        }

        if (selectedTime > limitTime) {
            showToast('Horario Límite', 'Las reservas deben realizarse al menos 1 hora antes del cierre del turno.', 'warning');
            return;
        }

        
        if (formData.numPersonas > maxCapacity) {
            showToast('Grupo Grande', `Para reservas de más de ${maxCapacity} personas, contacte directamente con nosotros.`, 'info');
            return;
        }

        setLoading(true);
        try {
            await reservaService.crear({
                usuarioId: user?.id,
                fecha: formData.fecha,
                hora: formData.hora.length === 5 ? formData.hora + ':00' : formData.hora,
                numPersonas: formData.numPersonas,
                estado: 'PENDIENTE'
            } as any);

            showToast('¡Reserva Realizada!', 'Tu solicitud ha sido enviada. Te esperamos.', 'success');
            setTimeout(() => navigate(ROUTES.LANDING), 2000);
        } catch (error: any) {
            const msg = error.response?.data?.message || 'No se pudo procesar la reserva';
            showToast('Disponibilidad', msg, 'danger');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="reservation-page-wrapper min-vh-100 pb-0" style={{ backgroundColor: 'var(--color-bg)' }}>
            <Navbar transparentInitially={true} />

            {}
            <section 
                className="reservation-hero py-5 position-relative overflow-hidden"
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
                            <span className="text-white fw-bold text-uppercase tracking-widest small" style={{ letterSpacing: '4px' }}>Experiencia Gourmet</span>
                            <div className="bg-accent" style={{ width: '30px', height: '1px' }}></div>
                        </div>
                        <h1 className="display-1 fw-bold mb-0" style={{ color: 'var(--color-accent)', letterSpacing: '-2px' }}>RESERVAR MESA</h1>
                        <p className="lead text-white opacity-50 mt-3 fw-light text-uppercase tracking-widest" style={{ fontSize: '0.9rem' }}>Asegura tu lugar en una experiencia sensorial inolvidable</p>
                    </div>
                </Container>
            </section>

            <Container className="fade-in py-5 my-4">
                <Row className="justify-content-center">
                    <Col lg={11} xl={10}>
                        <Card className="border-0 shadow-premium overflow-hidden rounded-4" style={{ backgroundColor: 'var(--color-surface)' }}>
                            <Row className="g-0">
                                <Col md={5} className="p-4 p-lg-5 text-white d-flex flex-column justify-content-center" style={{ backgroundColor: isDarkMode ? 'var(--color-bg)' : 'var(--color-primary)', borderRight: isDarkMode ? '1px solid rgba(255, 255, 255, 0.05)' : 'none' }}>
                                    <div className="mb-4">
                                        <i className="bi bi-clock-history mb-3 d-block display-5" style={{ color: 'var(--color-accent)' }}></i>
                                        <h2 className="fw-bold text-uppercase tracking-widest mb-3">Horario Premium</h2>
                                        <p className="opacity-75 mb-5">Turnos exclusivos diseñados para ofrecerte una experiencia gastronómica sin precedentes.</p>
                                    </div>

                                    <div className="schedule-box p-4 rounded-4 border border-white border-opacity-10" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                                        <div className="mb-4 pb-3 border-bottom border-white border-opacity-10 text-center">
                                            <div className="fw-bold text-uppercase tracking-widest small mb-1" style={{ color: 'var(--color-accent)' }}>Martes a Domingo</div>
                                            <div className="tiny opacity-50">Lunes: Cerrado por descanso</div>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between mb-4 border-bottom border-white border-opacity-10 pb-3">
                                            <div className="d-flex align-items-center gap-3">
                                                <i className="bi bi-sun fs-4" style={{ color: 'var(--color-accent)' }}></i>
                                                <span className="fw-bold text-uppercase small tracking-widest">Comida</span>
                                            </div>
                                            <span className="fs-5 fw-bold" style={{ color: 'var(--color-accent)' }}>13:00 - 16:00</span>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between">
                                            <div className="d-flex align-items-center gap-3">
                                                <i className="bi bi-moon-stars fs-4" style={{ color: 'var(--color-accent)' }}></i>
                                                <span className="fw-bold text-uppercase small tracking-widest">Cena</span>
                                            </div>
                                            <span className="fs-5 fw-bold" style={{ color: 'var(--color-accent)' }}>20:00 - 23:30</span>
                                        </div>
                                    </div>

                                    <div className="mt-5 pt-4 border-top border-white border-opacity-10 opacity-50 small">
                                        <p className="mb-0"><i className="bi bi-info-circle me-2"></i> Las reservas se cierran 1 hora antes del fin de cada turno.</p>
                                    </div>
                                </Col>
                                <Col md={7}>
                                    <Card.Body className="p-4 p-lg-5">
                                        <div className="mb-5">
                                            <h3 className="fw-bold text-primary text-uppercase mb-2" style={{ letterSpacing: '1px' }}>Solicitud de Reserva</h3>
                                            <p className="text-muted small">Completa los detalles para asegurar tu mesa en Restnova.</p>
                                        </div>

                                        <Form onSubmit={handleSubmit}>
                                            <Row>
                                                <Col md={6}>
                                                    <Form.Group className="mb-4">
                                                        <Form.Label className="small fw-bold text-muted text-uppercase tracking-widest mb-2">Fecha de Reserva</Form.Label>
                                                        <Form.Control 
                                                            required
                                                            type="date" 
                                                            min={new Date().toISOString().split('T')[0]}
                                                            value={formData.fecha}
                                                            onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group className="mb-4">
                                                        <Form.Label className="small fw-bold text-muted text-uppercase tracking-widest mb-2">Hora del Turno</Form.Label>
                                                        <Form.Select 
                                                            required
                                                            value={formData.hora}
                                                            onChange={(e) => setFormData({...formData, hora: e.target.value})}
                                                            disabled={!formData.fecha || availableTimes.length === 0 || fetchingTimes}
                                                        >
                                                            <option value="">{fetchingTimes ? 'Consultando...' : (!formData.fecha ? 'Seleccione una fecha' : (availableTimes.length === 0 ? 'Sin mesas disponibles' : 'Seleccione una hora'))}</option>
                                                            {availableTimes.map(time => (
                                                                <option key={time} value={time}>{time.substring(0, 5)}</option>
                                                            ))}
                                                        </Form.Select>
                                                    </Form.Group>
                                                </Col>
                                            </Row>

                                            <Form.Group className="mb-5">
                                                <Form.Label className="small fw-bold text-muted text-uppercase tracking-widest mb-2">Número de Comensales</Form.Label>
                                                <Form.Control 
                                                    type="number"
                                                    min={1}
                                                    max={maxCapacity + 10}
                                                    value={formData.numPersonas}
                                                    onChange={(e) => setFormData({...formData, numPersonas: parseInt(e.target.value) || 1})}
                                                />
                                            </Form.Group>

                                            {formData.numPersonas > maxCapacity && (
                                                <div className="mb-4 p-4 border border-primary border-opacity-10 rounded-4 text-center shadow-sm" style={{ backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.02)' : 'var(--color-bg)' }}>
                                                    <i className="bi bi-chat-left-dots mb-3 d-block display-6 text-primary"></i>
                                                    <h5 className="fw-bold text-primary mb-2">Reserva Especial</h5>
                                                    <p className="small text-muted mb-3">Para grupos superiores a {maxCapacity} personas, nuestro equipo de eventos coordinará una experiencia personalizada para vosotros.</p>
                                                    <div className="d-flex flex-wrap justify-content-center gap-4 mt-2">
                                                        <div className="d-flex align-items-center gap-2">
                                                            <div className="bg-accent bg-opacity-20 p-2 rounded-3">
                                                                <i className="bi bi-phone text-primary"></i>
                                                            </div>
                                                            <span className="fw-bold small">+34 900 123 456</span>
                                                        </div>
                                                        <div className="d-flex align-items-center gap-2">
                                                            <div className="bg-accent bg-opacity-20 p-2 rounded-3">
                                                                <i className="bi bi-envelope text-primary"></i>
                                                            </div>
                                                            <span className="fw-bold small">eventos@restnova.com</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <Button 
                                                variant="primary" 
                                                type="submit" 
                                                className="w-100 py-3 fw-bold fs-5 shadow-lg border-0 rounded-3 transition-all hover-lift d-flex align-items-center justify-content-center" 
                                                style={{ minHeight: '58px', height: '58px' }}
                                                disabled={loading || !formData.fecha || !formData.hora || formData.numPersonas <= 0 || formData.numPersonas > maxCapacity}
                                            >
                                                <div style={{ width: '24px', height: '24px' }} className="d-flex align-items-center justify-content-center me-2">
                                                    {loading ? <Spinner size="sm" animation="border" /> : <i className="bi bi-check2-circle fs-5"></i>}
                                                </div>
                                                SOLICITAR RESERVA
                                            </Button>
                                        </Form>

                                        <div className="mt-5 p-3 rounded-4 border-start border-accent border-4 d-flex align-items-center shadow-sm" style={{ backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.02)' : '#ffffff', border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.05)' : 'none' }}>
                                            <i className="bi bi-shield-check fs-3 me-3" style={{ color: 'var(--color-accent)' }}></i>
                                            <p className="small text-muted mb-0 lh-sm">
                                                Tu solicitud será procesada de inmediato. La confirmación final depende de la disponibilidad en tiempo real de nuestra sala.
                                            </p>
                                        </div>
                                    </Card.Body>
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                </Row>
            </Container>
            <Footer />
        </div>
    );
};
