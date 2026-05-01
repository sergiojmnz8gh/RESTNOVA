import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Badge } from 'react-bootstrap';
import { 
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import type { StatisticsData } from '../types/StatisticsTypes';
import api from '../services/apiConfig';

const LIGHT_COLORS = ['#040833', '#E79E0A', '#10b981', '#ef4444', '#6366f1'];
const DARK_COLORS = ['#E79E0A', '#10b981', '#ef4444', '#6366f1', '#f1f5f9'];

export const StatisticsPage: React.FC = () => {
    const { user } = useAuth();
    const { isDarkMode } = useUI();
    const [data, setData] = useState<StatisticsData | null>(null);
    const [loading, setLoading] = useState(true);

    const isAdmin = user?.rol === 'ADMIN';
    const chartTextColor = isDarkMode ? '#f1f5f9' : '#666';
    const chartGridColor = isDarkMode ? 'rgba(255,255,255,0.1)' : '#eee';
    const COLORS = isDarkMode ? DARK_COLORS : LIGHT_COLORS;

    useEffect(() => {
        const fetchStatistics = async () => {
            try {
                const response = await api.get('/estadisticas');
                setData(response.data);
            } catch (error) {
                console.error("Error fetching statistics", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStatistics();
    }, []);

    if (loading) {
        return (
            <div className="d-flex flex-column justify-content-center align-items-center vh-100 gap-4 bg-light">
                <Spinner animation="border" variant="accent" style={{width: '3.5rem', height: '3.5rem'}} />
                <h2 className="fw-bold text-primary m-0 italic">SINCRO DE DATOS...</h2>
            </div>
        );
    }

    // Preparar datos para gráficas
    const lineData = data?.ventasPorDia ? Object.entries(data.ventasPorDia).map(([fecha, total]) => ({
        fecha: fecha.split('-').slice(2).join('/'), // Solo día/mes
        ventas: total
    })).sort((a,b) => a.fecha.localeCompare(b.fecha)) : [];

    const pieData = data?.ventasPorCategoria ? Object.entries(data.ventasPorCategoria).map(([cat, total]) => ({
        name: cat,
        value: total
    })) : [];

    return (
        <Container fluid className="py-4 fade-in pb-5">
            <div className="mb-5">
                <h1 className="display-5 fw-bold mb-1">Estadísticas de Rendimiento</h1>
                <p className="text-muted fw-bold text-uppercase small">Reporte operativo consolidado: {new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(new Date()).toUpperCase()}</p>
            </div>

            {/* KPI Cards */}
            <Row className="g-4 mb-5">
                {isAdmin && (
                    <>
                        <Col xs={12} md={6} lg={3}>
                            <Card className="border-0 shadow-sm p-3 rounded-4 bg-primary text-white">
                                <Card.Body>
                                    <div className="text-accent small fw-bold text-uppercase mb-2 italic">Ingresos Mensuales</div>
                                    <h2 className="display-5 fw-bold mb-0">{data?.totalVentasMensual?.toFixed(2)}€</h2>
                                    <Badge bg="accent" text="dark" className="mt-3 py-2 px-3 fw-bold italic">+12% TREND</Badge>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col xs={12} md={6} lg={3}>
                            <Card className="border-0 shadow-sm p-3 rounded-4 bg-white border-start border-5 border-primary">
                                <Card.Body>
                                    <div className="text-primary small fw-bold text-uppercase mb-2 italic">Ticket Medio</div>
                                    <h2 className="display-5 fw-bold text-dark mb-0">{data?.ticketMedio?.toFixed(2)}€</h2>
                                    <div className="text-muted small mt-2 fw-bold">PROMEDIO DE VENTA</div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </>
                )}
                <Col xs={12} md={6} lg={isAdmin ? 3 : 6}>
                    <Card className="border-0 shadow-sm p-3 rounded-4 bg-white border-start border-5 border-primary">
                        <Card.Body>
                            <div className="text-primary small fw-bold text-uppercase mb-2 italic">Comandas Totales</div>
                            <h2 className="display-5 fw-bold text-dark mb-0">{data?.totalPedidosMensual}</h2>
                            <div className="text-muted small mt-2 fw-bold">REGISTRO DE SALA</div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xs={12} md={6} lg={isAdmin ? 3 : 6}>
                    <Card className="border-0 shadow-sm p-3 rounded-4 bg-white border-start border-5 border-primary">
                        <Card.Body>
                            <div className="text-primary small fw-bold text-uppercase mb-2 italic">Ocupación Media</div>
                            <h2 className="display-5 fw-bold text-dark mb-0">{data?.ocupacionMedia?.toFixed(1)}%</h2>
                            <ProgressBar now={data?.ocupacionMedia} variant="primary" style={{height: '10px'}} className="mt-4" />
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Charts Section */}
            <Row className="g-4">
                {isAdmin && (
                    <Col lg={8}>
                        <Card className="border-0 shadow-sm p-4 h-100 rounded-4">
                            <h3 className="h4 fw-bold mb-4 italic text-primary">FLUJO DE CAJA DIARIO</h3>
                            <div style={{ width: '100%', height: 350 }}>
                                <ResponsiveContainer>
                                    <LineChart data={lineData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartGridColor} />
                                        <XAxis dataKey="fecha" axisLine={false} tickLine={false} dy={10} tick={{fill: chartTextColor, fontWeight: 'bold'}} />
                                        <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `${val}€`} tick={{fill: chartTextColor, fontWeight: 'bold'}} />
                                        <Tooltip 
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)', background: isDarkMode ? '#0a1045' : '#040833', color: '#fff' }}
                                            itemStyle={{ color: '#E79E0A', fontWeight: 'bold' }}
                                            formatter={(value) => [`${value}€`, 'VENTAS']}
                                        />
                                        <Line 
                                            type="monotone" 
                                            dataKey="ventas" 
                                            stroke={isDarkMode ? '#E79E0A' : '#040833'} 
                                            strokeWidth={5} 
                                            dot={{ r: 6, fill: isDarkMode ? '#fff' : '#E79E0A', strokeWidth: 3, stroke: isDarkMode ? '#040833' : '#fff' }}
                                            activeDot={{ r: 10, fill: '#E79E0A' }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </Col>
                )}

                <Col lg={isAdmin ? 4 : 6}>
                    <Card className="border-0 shadow-sm p-4 h-100 rounded-4">
                        <h3 className="h4 fw-bold mb-4 italic text-primary">TOP PRODUCTOS</h3>
                        <div style={{ width: '100%', height: 350 }}>
                            <ResponsiveContainer>
                                <BarChart data={data?.topProductos} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={chartGridColor} />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="nombre" type="category" width={100} axisLine={false} tickLine={false} tick={{fill: chartTextColor, fontWeight: 'bold'}} />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '12px', border: 'none', background: isDarkMode ? '#0a1045' : '#040833', color: '#fff' }}
                                        cursor={{fill: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f8f9fa'}}
                                    />
                                    <Bar dataKey="cantidad" fill="#E79E0A" radius={[0, 10, 10, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </Col>

                {isAdmin && (
                    <Col lg={12}>
                        <Card className="border-0 shadow-sm p-4 rounded-4 mt-2">
                            <h3 className="h4 fw-bold mb-4 italic text-primary">MIX DE PRODUCTOS POR CATEGORÍA</h3>
                            <Row className="align-items-center">
                                <Col md={6}>
                                    <div style={{ width: '100%', height: 400 }}>
                                        <ResponsiveContainer>
                                            <PieChart>
                                                <Pie
                                                    data={pieData}
                                                    innerRadius={80}
                                                    outerRadius={140}
                                                    paddingAngle={8}
                                                    dataKey="value"
                                                >
                                                    {pieData.map((_, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip 
                                                    contentStyle={{ borderRadius: '12px', background: isDarkMode ? '#0a1045' : '#040833', border: 'none', color: '#fff' }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div className="d-flex flex-column gap-3">
                                        {pieData.map((entry, index) => (
                                            <div key={index} className="d-flex align-items-center justify-content-between p-3 rounded bg-light">
                                                <div className="d-flex align-items-center gap-3">
                                                    <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: COLORS[index % COLORS.length] }}></div>
                                                    <span className="fw-bold text-primary text-uppercase">{entry.name}</span>
                                                </div>
                                                <span className="h5 mb-0 fw-bold">{entry.value.toFixed(2)}€</span>
                                            </div>
                                        ))}
                                    </div>
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                )}
            </Row>
        </Container>
    );
};

// Simple Component for project requirements
const ProgressBar = ({now, variant, style, className}: any) => (
    <div className={`progress ${className}`} style={{backgroundColor: '#f1f1f1', borderRadius: '100px', overflow: 'hidden', ...style}}>
        <div 
            className="progress-bar progress-bar-striped progress-bar-animated" 
            style={{width: `${now}%`, backgroundColor: variant === 'primary' ? '#E79E0A' : '#040833'}}
        ></div>
    </div>
);
