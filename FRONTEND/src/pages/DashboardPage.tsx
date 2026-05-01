import React, { useState, useEffect } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import api from '../services/apiConfig';

export const DashboardPage: React.FC = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState([
        { label: 'Ocupación', value: '0%', detail: 'Cargando...', trend: 'stable', icon: 'bi-grid-3x3' },
        { label: 'Reservas', value: '0', detail: 'Para hoy', trend: 'stable', icon: 'bi-calendar-check' },
        { label: 'Productos', value: '0', detail: 'En menú', trend: 'stable', icon: 'bi-box-seam' },
        { label: 'Ventas Hoy', value: '0€', detail: 'Sincronizado', trend: 'stable', icon: 'bi-graph-up-arrow' },
    ]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [mesasRes, reservasRes, productosRes, sesionesRes, pedidosRes] = await Promise.all([
                    api.get('/mesas'),
                    api.get('/reservas'),
                    api.get('/productos'),
                    api.get('/sesiones-mesa'),
                    api.get('/pedidos')
                ]);

                const mesas = mesasRes.data;
                const reservas = reservasRes.data;
                const productos = productosRes.data;
                const sesionesActivas = sesionesRes.data.filter((s: any) => !s.fechaCierre);
                
                const todayStr = new Date().toISOString().split('T')[0];
                const todayPedidos = pedidosRes.data.filter((p: any) => 
                    p.estado === 'PAGADO' && p.fechaHora.startsWith(todayStr)
                );
                
                const ventasHoy = todayPedidos.reduce((sum: number, p: any) => sum + p.total, 0);

                const ocupadas = sesionesActivas.length; 
                const ocupacionPerc = Math.round((ocupadas / (mesas.length || 1)) * 100);
                const todayReservas = reservas.filter((r: any) => r.fecha === todayStr);

                setStats([
                    { 
                        label: 'Ocupación', 
                        value: `${ocupacionPerc}%`, 
                        detail: `${ocupadas}/${mesas.length} Mesas`, 
                        trend: 'stable', 
                        icon: 'bi-grid-3x3' 
                    },
                    { 
                        label: 'Reservas', 
                        value: todayReservas.length.toString().padStart(2, '0'), 
                        detail: 'Para hoy', 
                        trend: 'up', 
                        icon: 'bi-calendar-check' 
                    },
                    { 
                        label: 'Productos', 
                        value: productos.length.toString().padStart(2, '0'), 
                        detail: 'En carta activa', 
                        trend: 'up', 
                        icon: 'bi-box-seam' 
                    },
                    { 
                        label: 'Ventas Hoy', 
                        value: `${ventasHoy.toFixed(2)}€`, 
                        detail: 'Facturación real', 
                        trend: 'up', 
                        icon: 'bi-graph-up-arrow' 
                    },
                ]);
            } catch (error) {
                console.error("Error fetching dashboard stats", error);
            }
        };

        fetchStats();
    }, []);

    return (
        <div className="container-fluid py-4 fade-in pb-5">
            <div className="mb-5">
                <h1 className="display-5 fw-bold mb-1">Panel de Control</h1>
                <p className="text-muted fw-bold">Bienvenido, {user?.nombre || 'Administrador'}. Estado actual operativo.</p>
            </div>

            <Row className="g-4 mb-5">
                {stats.map((s, idx) => (
                    <Col key={idx} xs={12} md={6} lg={3}>
                        <Card className="h-100 p-3 stats-card border-0 shadow-sm">
                            <Card.Body>
                                <div className="d-flex align-items-center mb-3 text-primary small fw-bold text-uppercase">
                                    <i className={`bi ${s.icon} me-2 fs-5`}></i>
                                    {s.label}
                                </div>
                                <div className="d-flex align-items-baseline gap-2">
                                    <h2 className="mb-0 fw-bold display-5 text-dark">{s.value}</h2>
                                    <span className={`small ${s.trend === 'up' ? 'text-success' : 'text-muted'}`}>
                                        <i className={`bi bi-graph-up ms-1`}></i>
                                    </span>
                                </div>
                                <p className="small text-muted mt-2 mb-0 fw-bold">{s.detail}</p>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            <Row className="g-4">
                <Col lg={8}>
                    <Card className="h-100 border-0 p-4 shadow-sm">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h3 className="h4 mb-0 fw-bold">ACTIVIDAD RECIENTE</h3>
                            <button className="btn btn-primary px-4 shadow-sm italic">VER HISTORIAL</button>
                        </div>
                        <div className="py-5 text-center text-muted bg-white border rounded-4 d-flex flex-column align-items-center justify-content-center h-100" style={{ minHeight: '350px' }}>
                            <i className="bi bi-clock-history display-1 opacity-10 mb-3 text-accent animate-pulse"></i>
                            <p className="mb-0 fw-bold fs-5 text-primary">SINCRONIZANDO SALA...</p>
                            <small className="opacity-75 fw-bold text-uppercase">Monitoreo de flujo activo</small>
                        </div>
                    </Card>
                </Col>

                <Col lg={4}>
                    <Card className="h-100 border-0 p-4 shadow-sm">
                        <h3 className="h4 mb-4 fw-bold">OPERACIONES</h3>
                        <div className="mb-4 text-center py-5 rounded-4 bg-primary text-white position-relative overflow-hidden shadow-premium">
                            <div className="h1 fw-bold mb-0 text-accent italic">ON LINE</div>
                            <small className="opacity-75 fw-bold">SYSTEM STATUS: OPTIMAL</small>
                            <div className="position-absolute top-50 start-50 translate-middle opacity-10" style={{ fontSize: '12rem' }}>
                                <i className="bi bi-speedometer"></i>
                            </div>
                        </div>
                        
                        <div className="mt-2">
                            <div className="d-flex justify-content-between mb-2 small fw-bold text-uppercase">
                                <span className="text-muted">Rendimiento</span>
                                <span className="text-primary">12%</span>
                            </div>
                            <div className="progress overflow-hidden" style={{ height: '10px', borderRadius: '100px', backgroundColor: '#e2e8f0' }}>
                                <div className="progress-bar bg-accent" style={{ width: '12%' }}></div>
                            </div>
                        </div>
                        
                        <div className="mt-5 pt-4 border-top">
                            <h4 className="h6 fw-bold mb-3 text-uppercase small text-primary italic">Acceso Rápido</h4>
                            <div className="d-grid gap-3">
                                <button className="btn btn-primary text-start d-flex align-items-center justify-content-between py-3 fs-6 italic">
                                    <span>GESTIÓN DE RESERVAS</span>
                                    <i className="bi bi-chevron-right fs-5"></i>
                                </button>
                                <button className="btn btn-outline-primary text-start d-flex align-items-center justify-content-between py-3 fs-6 italic border-2 fw-bold">
                                    <span>AJUSTES DEL MENÚ</span>
                                    <i className="bi bi-chevron-right fs-5"></i>
                                </button>
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};
