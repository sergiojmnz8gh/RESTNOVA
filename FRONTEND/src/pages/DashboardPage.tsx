import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col, Card, ButtonGroup, Button, Table, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../routes/routes';
import { useAuth } from '../context/AuthContext';
import { mesaService } from '../services/mesaService';
import { reservaService } from '../services/reservaService';
import { productoService } from '../services/productoService';
import { pedidoService } from '../services/pedidoService';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';

import { PageHeader } from '../components/PageHeader';

type TimeFilter = 'day' | 'week' | 'month' | 'all';

export const DashboardPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const isAdmin = user?.rol?.includes('ADMIN');
    const [timeFilter, setTimeFilter] = useState<TimeFilter>('week');
    const [rawData, setRawData] = useState<any>({
        mesas: [],
        reservas: [],
        productos: [],
        sesiones: [],
        pedidos: [],
        categorias: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAdmin) {
            if (user?.rol?.includes('COCINA')) {
                navigate(ROUTES.KITCHEN);
            } else if (user?.rol?.includes('CAMARERO')) {
                navigate(ROUTES.ADMIN_MESAS);
            }
        }
    }, [user, isAdmin, navigate]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [mesas, reservas, productos, sesiones, pedidos, categorias] = await Promise.all([
                    mesaService.listarTodas(),
                    reservaService.listarTodas(),
                    productoService.listarTodos(),
                    mesaService.listarSesionesActivas(),
                    pedidoService.listarTodos(),
                    productoService.listarCategorias()
                ]);

                setRawData({
                    mesas,
                    reservas,
                    productos,
                    sesiones,
                    pedidos,
                    categorias
                });
            } catch (error) {
                console.error("Error fetching dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredData = useMemo(() => {
        const now = new Date();
        let startDate = new Date();
        
        if (timeFilter === 'day') startDate.setHours(0, 0, 0, 0);
        else if (timeFilter === 'week') startDate.setDate(now.getDate() - 7);
        else if (timeFilter === 'month') startDate.setMonth(now.getMonth() - 1);
        else startDate = new Date(0); 

        const pedidos = rawData.pedidos.filter((p: any) => new Date(p.fechaHora) >= startDate && p.estado === 'PAGADO');
        const reservas = rawData.reservas.filter((r: any) => new Date(r.fecha) >= startDate);
        
        return { pedidos, reservas };
    }, [rawData, timeFilter]);

    const stats = useMemo(() => {
        const totalVentas = filteredData.pedidos.reduce((sum: number, p: any) => sum + p.total, 0);
        const totalPedidos = filteredData.pedidos.length;
        const ticketMedio = totalPedidos > 0 ? totalVentas / totalPedidos : 0;
        const ocupacionActual = Math.round((rawData.sesiones.filter((s: any) => !s.fechaCierre).length / (rawData.mesas.length || 1)) * 100);

        const baseStats = [
            { label: 'Ocupación Actual', value: `${ocupacionActual}%`, icon: 'bi-grid-3x3', color: 'info' },
            { label: 'Nº Reservas', value: filteredData.reservas.length.toString(), icon: 'bi-calendar-check', color: 'primary' },
        ];

        if (isAdmin) {
            return [
                { label: 'Ventas Totales', value: `${totalVentas.toFixed(2)}€`, icon: 'bi-currency-euro', color: 'accent' },
                { label: 'Ticket Medio', value: `${ticketMedio.toFixed(2)}€`, icon: 'bi-calculator', color: 'success' },
                ...baseStats
            ];
        }

        return baseStats;
    }, [filteredData, rawData]);

    const chartData = useMemo(() => {
        
        const salesByDate: Record<string, number> = {};
        filteredData.pedidos.forEach((p: any) => {
            const date = p.fechaHora?.split('T')[0] || 'N/A';
            salesByDate[date] = (salesByDate[date] || 0) + p.total;
        });

        const timeSeries = Object.entries(salesByDate)
            .map(([date, total]) => ({ date, total }))
            .sort((a, b) => a.date.localeCompare(b.date));

        
        const salesByCategory: Record<string, number> = {};
        filteredData.pedidos.forEach((p: any) => {
            p.detalles?.forEach((lp: any) => {
                const catName = lp.productoCategoria || 'Otros';
                salesByCategory[catName] = (salesByCategory[catName] || 0) + lp.cantidad;
            });
        });

        const categoryData = Object.entries(salesByCategory)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);

        
        const salesByPayment: Record<string, number> = {};
        filteredData.pedidos.forEach((p: any) => {
            const method = p.metodoPago || 'EFECTIVO';
            salesByPayment[method] = (salesByPayment[method] || 0) + p.total;
        });

        const paymentData = Object.entries(salesByPayment)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);

        return { timeSeries, categoryData, paymentData };
    }, [filteredData]);

    const topProducts = useMemo(() => {
        const productsCount: Record<string, { nombre: string, qty: number, total: number }> = {};
        filteredData.pedidos.forEach((p: any) => {
            p.detalles?.forEach((lp: any) => {
                if (!productsCount[lp.productoId]) {
                    productsCount[lp.productoId] = { nombre: lp.productoNombre, qty: 0, total: 0 };
                }
                productsCount[lp.productoId].qty += lp.cantidad;
                productsCount[lp.productoId].total += (lp.precioUnitario * lp.cantidad);
            });
        });

        return Object.values(productsCount)
            .sort((a, b) => b.qty - a.qty)
            .slice(0, 5);
    }, [filteredData]);


    if (loading) return <div className="p-5 text-center fw-bold text-primary">CARGANDO DATOS...</div>;

    return (
        <div className="container-fluid py-4 fade-in pb-5">
            <PageHeader 
                title="Panel de Control" 
                description={`Bienvenido/a, ${user?.nombre}. Análisis de rendimiento estratégico y métricas clave.`}
            />
            
            <div className="d-flex justify-content-end mb-4">
                <ButtonGroup className="shadow-sm rounded-4 overflow-hidden">
                    {(['day', 'week', 'month', 'all'] as TimeFilter[]).map((f) => (
                        <Button 
                            key={f}
                            variant={timeFilter === f ? 'primary' : 'outline-primary'}
                            onClick={() => setTimeFilter(f)}
                            className="px-4 py-2 fw-bold text-uppercase small"
                        >
                            {f === 'day' ? 'Hoy' : f === 'week' ? 'Semana' : f === 'month' ? 'Mes' : 'Siempre'}
                        </Button>
                    ))}
                </ButtonGroup>
            </div>

            {}
            <Row className="g-4 mb-5">
                {stats.map((s, idx) => (
                    <Col key={idx} xs={12} md={6} lg={3}>
                        <Card className="h-100 border-0 shadow-premium p-2 overflow-hidden position-relative">
                            <Card.Body>
                                <div className="d-flex align-items-center mb-3 text-muted small fw-bold text-uppercase">
                                    <i className={`bi ${s.icon} me-2 fs-5 text-${s.color}`}></i>
                                    {s.label}
                                </div>
                                <h2 className="mb-0 fw-bold display-6">{s.value}</h2>
                                <div className="position-absolute bottom-0 end-0 opacity-05" style={{ fontSize: '4rem', transform: 'translate(10%, 20%)' }}>
                                    <i className={`bi ${s.icon}`}></i>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            {isAdmin && (
                <>
                <Row className="g-4 mb-5">
                    {}
                    <Col lg={8}>
                        <Card className="h-100 border-0 shadow-premium p-4">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h3 className="h5 fw-bold mb-0 text-primary">RENDIMIENTO DE VENTAS</h3>
                                <Badge bg="primary" className="px-3 py-2 fw-bold text-uppercase">INGRESOS (€)</Badge>
                            </div>
                            <div style={{ width: '100%', height: 350 }}>
                                <ResponsiveContainer>
                                    <AreaChart data={chartData.timeSeries}>
                                        <defs>
                                            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#E79E0A" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#E79E0A" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                                        <XAxis dataKey="date" stroke="var(--color-text-muted)" fontSize={12} tickMargin={10} />
                                        <YAxis stroke="var(--color-text-muted)" fontSize={12} tickFormatter={(val) => `${val}€`} />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-accent)', borderRadius: '12px' }}
                                            itemStyle={{ color: 'var(--color-accent)', fontWeight: 'bold' }}
                                        />
                                        <Area type="monotone" dataKey="total" stroke="#E79E0A" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </Col>

                    <Col lg={4}>
                        <Card className="h-100 border-0 shadow-premium p-4">
                            <h3 className="h5 fw-bold mb-4 text-primary">MÉTODOS DE PAGO</h3>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie
                                            data={chartData.paymentData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {chartData.paymentData.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={['#E79E0A', '#3B82F6', '#10B981'][index % 3]} />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: 'var(--color-surface)', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                            formatter={(value: any) => `${Number(value).toFixed(2)}€`}
                                        />
                                        <Legend verticalAlign="bottom" height={36}/>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-auto pt-3">
                                {chartData.paymentData.map((d, idx) => (
                                    <div key={idx} className="d-flex justify-content-between align-items-center mb-2">
                                        <span className="small fw-bold text-muted text-uppercase">{d.name}</span>
                                        <span className="fw-bold text-primary">{d.value.toFixed(2)}€</span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </Col>
                </Row>

                <Row className="g-4 mb-5">
                    <Col lg={6}>
                        <Card className="h-100 border-0 shadow-premium p-4">
                            <h3 className="h5 fw-bold mb-4 text-primary">PLATOS ESTRELLA (RANKING)</h3>
                            <div className="table-responsive">
                                <Table hover className="align-middle border-0">
                                    <thead>
                                        <tr>
                                            <th className="bg-transparent text-muted small fw-bold border-0 border-bottom">PRODUCTO</th>
                                            <th className="bg-transparent text-muted small fw-bold text-center border-0 border-bottom">UNIDADES</th>
                                            <th className="bg-transparent text-muted small fw-bold text-end border-0 border-bottom">TOTAL (€)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {topProducts.map((p, idx) => (
                                            <tr key={idx} className="border-bottom border-light">
                                                <td className="fw-bold py-3 border-0">
                                                    <div className="d-flex align-items-center gap-3">
                                                        <span className={`badge rounded-circle bg-light text-primary d-flex align-items-center justify-content-center`} style={{width: '24px', height: '24px'}}>{idx + 1}</span>
                                                        <span className="text-primary">{p.nombre}</span>
                                                    </div>
                                                </td>
                                                <td className="text-center fw-bold border-0">
                                                    <Badge bg="light" className="text-primary border px-3 py-2">{p.qty}</Badge>
                                                </td>
                                                <td className="text-end fw-bold text-accent border-0">
                                                    {p.total.toFixed(2)}€
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        </Card>
                    </Col>
                    
                    <Col lg={6}>
                        <Card className="h-100 border-0 shadow-premium p-4">
                            <h3 className="h5 fw-bold mb-4 text-primary">VENTAS POR CATEGORÍA</h3>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <BarChart data={chartData.categoryData.slice(0, 6)} layout="vertical" margin={{ left: 40 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-border)" />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" stroke="var(--color-text-muted)" fontSize={11} width={80} />
                                        <Tooltip 
                                            cursor={{fill: 'transparent'}}
                                            contentStyle={{ backgroundColor: 'var(--color-surface)', borderRadius: '12px' }}
                                        />
                                        <Bar dataKey="value" fill="var(--color-accent)" radius={[0, 5, 5, 0]} barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </Col>
                </Row>
                </>
            )}


        </div>
    );
};

