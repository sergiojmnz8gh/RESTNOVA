import React, { useEffect, useState } from 'react';
import { Badge, Button, Card, Col, Form, Modal, Row, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import api from '../services/apiConfig';
import { mesaService } from '../services/mesaService';

import { PageHeader } from '../components/PageHeader';
import type { Mesa, SesionMesa } from '../types/TableTypes';

export const TablesPage: React.FC = () => {
    const { showToast, showConfirm } = useUI();
    const { user } = useAuth();
    const isAdmin = user?.rol?.includes('ADMIN');
    const [tables, setTables] = useState<Mesa[]>([]);
    const [sessions, setSessions] = useState<SesionMesa[]>([]);
    const [loading, setLoading] = useState(true);



    const [showTableModal, setShowTableModal] = useState(false);
    const [editingTable, setEditingTable] = useState<Mesa | null>(null);
    const [tableForm, setTableForm] = useState({ numeroMesa: '', capacidad: 2 });


    const [showQrModal, setShowQrModal] = useState(false);
    const [activeToken, setActiveToken] = useState<string | null>(null);
    const [activeMesaNum, setActiveMesaNum] = useState<string | null>(null);

    const loadData = async () => {
        try {
            const [tablesData, sessionsData] = await Promise.all([
                mesaService.listarTodas(),
                mesaService.listarSesionesActivas()
            ]);
            setTables(tablesData);
            setSessions(sessionsData.filter((s: SesionMesa) => !s.fechaCierre));
        } catch (error) {
            showToast('Error', 'No se pudieron sincronizar las mesas', 'danger');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);



    const handleOpenTableModal = (mesa: Mesa | null = null) => {
        if (mesa) {
            setEditingTable(mesa);
            setTableForm({ numeroMesa: mesa.numeroMesa, capacidad: mesa.capacidad });
        } else {
            setEditingTable(null);
            setTableForm({ numeroMesa: '', capacidad: 2 });
        }
        setShowTableModal(true);
    };

    const handleTableSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingTable) {
                await mesaService.actualizar(editingTable.id, tableForm);
                showToast('Éxito', 'Mesa actualizada');
            } else {
                await mesaService.crear(tableForm);
                showToast('Éxito', 'Nueva mesa añadida');
            }
            setShowTableModal(false);
            setEditingTable(null);
            loadData();
        } catch (error: any) {
            const msg = error.response?.data?.message || 'No se pudo procesar la mesa';
            showToast('Error', msg, 'danger');
        }
    };

    const handleDeleteTable = (id: number) => {
        showConfirm('Eliminar Mesa', '¿Estás seguro de eliminar esta mesa?', async () => {
            try {
                await api.delete(`/mesas/${id}`);
                showToast('Éxito', 'Mesa eliminada');
                loadData();
            } catch (error) {
                showToast('Error', 'No se pudo eliminar la mesa', 'danger');
            }
        });
    };


    const handleOpenSession = async (mesa: Mesa) => {
        try {
            const data = await mesaService.abrirSesion(mesa.id, user?.id || 0);
            setActiveToken(data.tokenQr);
            setActiveMesaNum(mesa.numeroMesa);
            setShowQrModal(true);
            loadData();
            showToast('Mesa Abierta', `Sesión iniciada en Mesa ${mesa.numeroMesa}`);
        } catch (error) {
            showToast('Error', 'No se pudo abrir la mesa', 'danger');
        }
    };


    const handlePrintQr = () => {
        setTimeout(() => {
            window.print();
        }, 100);
    };

    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedMesaDetails, setSelectedMesaDetails] = useState<Mesa | null>(null);
    const [mesaOrders, setMesaOrders] = useState<any[]>([]);

    const handleOpenDetails = async (mesa: Mesa) => {
        setSelectedMesaDetails(mesa);
        const session = sessions.find(s => s.mesaId === mesa.id);
        if (session) {
            try {
                const response = await api.get(`/pedidos/sesion/${session.id}`);
                const data = response.data;
                setMesaOrders(data);
            } catch (error) {
                setMesaOrders([]);
            }
        } else {
            setMesaOrders([]);
        }
        setShowDetailsModal(true);
    };

    const handleServeOrder = async (orderId: number) => {
        try {
            await api.put(`/pedidos/${orderId}/estado?status=SERVIDO`);
            showToast('Servido', `Pedido #${orderId} marcado como servido`);
            if (selectedMesaDetails) handleOpenDetails(selectedMesaDetails);
            loadData();
        } catch (error) {
            showToast('Error', 'No se pudo actualizar el pedido', 'danger');
        }
    };

    const handleCloseTable = async () => {
        if (!selectedMesaDetails) return;
        const s = sessions.find(s => s.mesaId === selectedMesaDetails.id);
        if (!s) return;

        showConfirm(
            'Finalizar Sesión',
            `¿Deseas cerrar la Mesa ${selectedMesaDetails.numeroMesa}? El código QR dejará de ser válido.`,
            async () => {
                try {
                    await mesaService.cerrarSesion(s.id);
                    showToast('Sesión Finalizada', 'La mesa ha sido liberada correctamente', 'success');
                    setShowDetailsModal(false);
                    loadData();
                } catch (error) {
                    showToast('Error', 'No se pudo cerrar la sesión', 'danger');
                }
            }
        );
    };

    return (
        <div className="container-fluid py-4 fade-in pb-5">
            <PageHeader
                title="Gestión de Sala"
                description="Monitor de ocupación y servicio de mesas"
                action={isAdmin ? {
                    label: 'Nueva Mesa',
                    icon: 'plus-lg',
                    onClick: () => handleOpenTableModal()
                } : undefined}
            />

            {loading ? (
                <div className="text-center py-5">
                    <Spinner animation="border" className="text-accent" />
                    <p className="mt-2 text-muted fw-bold text-uppercase tiny">Sincronizando sala...</p>
                </div>
            ) : (
                <Row className="g-4">
                    {tables.map(m => {
                        const session = sessions.find(s => s.mesaId === m.id);
                        const isOccupied = !!session;

                        return (
                            <Col key={m.id} xs={12} sm={6} md={4} lg={3}>
                                <Card
                                    className={`h-100 border-0 shadow-premium transition-all overflow-hidden table-card ${isOccupied ? 'occupied' : 'free'}`}
                                    onClick={() => isOccupied && handleOpenDetails(m)}
                                    style={{ cursor: isOccupied ? 'pointer' : 'default' }}
                                >
                                    <div className="table-card-header p-3 d-flex justify-content-between align-items-center bg-light bg-opacity-10">
                                        <div className="d-flex align-items-center gap-2">
                                            <Badge bg={isOccupied ? 'accent' : 'light'} className={isOccupied ? 'text-primary' : 'text-muted'}>
                                                {isOccupied ? 'EN SERVICIO' : 'DISPONIBLE'}
                                            </Badge>
                                            {isAdmin && !isOccupied && (
                                                <div className="admin-table-actions d-flex gap-1 ms-3">
                                                    <Button 
                                                        variant="link" 
                                                        size="sm" 
                                                        className="p-0 text-primary border-0 hover-scale transition-all" 
                                                        onClick={(e) => { e.stopPropagation(); handleOpenTableModal(m); }}
                                                        title="Editar Mesa"
                                                    >
                                                        <i className="bi bi-pencil-fill fs-5"></i>
                                                    </Button>
                                                    <Button 
                                                        variant="link" 
                                                        size="sm" 
                                                        className="p-0 text-danger border-0 hover-scale transition-all ms-1" 
                                                        onClick={(e) => { e.stopPropagation(); handleDeleteTable(m.id); }}
                                                        title="Eliminar Mesa"
                                                    >
                                                        <i className="bi bi-trash3-fill fs-5"></i>
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-muted small fw-bold"><i className="bi bi-people-fill me-1"></i>{m.capacidad}</div>
                                    </div>

                                    <Card.Body className="p-4 d-flex flex-column align-items-center text-center justify-content-center">
                                        <div className="table-icon-wrapper mb-3">
                                            <i className={`bi bi-${isOccupied ? 'person-check-fill' : 'aspect-ratio'} display-4`}></i>
                                        </div>
                                        <h3 className="h2 fw-bold mb-0">MESA {m.numeroMesa}</h3>
                                        {isOccupied && (
                                            <div className="mt-2 small opacity-75 fw-bold tracking-widest">
                                                CÓDIGO: {session.codigoAcceso}
                                            </div>
                                        )}
                                    </Card.Body>

                                    <div className="table-card-footer p-3 bg-light bg-opacity-10">
                                        {!isOccupied ? (
                                            <Button
                                                variant="primary"
                                                className="w-100 fw-bold py-3 border-0"
                                                onClick={(e) => { e.stopPropagation(); handleOpenSession(m); }}
                                            >
                                                ABRIR MESA
                                            </Button>
                                        ) : (
                                            <div className="d-flex gap-2">
                                                <Button
                                                    variant="accent"
                                                    className="fw-bold text-primary py-3 border-0 px-3"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActiveToken(session.tokenQr);
                                                        setActiveMesaNum(m.numeroMesa);
                                                        setShowQrModal(true);
                                                    }}
                                                >
                                                    <i className="bi bi-qr-code"></i>
                                                </Button>
                                                <Button
                                                    variant="outline-light"
                                                    className="flex-grow-1 fw-bold py-3 border-2"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleOpenDetails(m);
                                                    }}
                                                >
                                                    GESTIONAR
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            </Col>
                        );
                    })}
                </Row>
            )}

            {}
            <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg" centered>
                <Modal.Header closeButton className="border-bottom-0 px-4 pt-4">
                    <Modal.Title className="fw-bold fs-2 text-accent">DETALLES MESA {selectedMesaDetails?.numeroMesa}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-0">
                    <div className="p-4 border-bottom bg-light">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <div className="text-muted small fw-bold text-uppercase">Estado actual</div>
                                <div className="h4 mb-0 fw-bold text-primary">EN SERVICIO</div>
                            </div>
                            <div className="text-end">
                                <div className="text-muted small fw-bold text-uppercase">Código de Acceso</div>
                                <div className="h4 mb-0 fw-bold text-accent">{sessions.find(s => s.mesaId === selectedMesaDetails?.id)?.codigoAcceso}</div>
                            </div>
                        </div>
                    </div>

                    <div className="p-4">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h5 className="fw-bold text-primary text-uppercase mb-0">Consumo Acumulado</h5>
                            <div className="bg-primary text-white px-3 py-1 rounded-pill fw-bold">
                                TOTAL: {mesaOrders.reduce((sum, o) => sum + o.total, 0).toFixed(2)}€
                            </div>
                        </div>

                        {mesaOrders.length === 0 ? (
                            <div className="empty-state border-0 bg-transparent">
                                <i className="bi bi-inbox opacity-25"></i>
                                <p className="fw-bold">No hay consumiciones registradas.</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover align-middle border-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th className="border-0 small fw-bold text-muted">PRODUCTO</th>
                                            <th className="border-0 small fw-bold text-muted text-center">CANT.</th>
                                            <th className="border-0 small fw-bold text-muted text-end">SUBTOTAL</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Array.from(mesaOrders.flatMap(o => o.detalles).reduce((acc: Map<string, any>, d) => {
                                            const key = d.producto?.nombre || d.productoNombre;
                                            if (!acc.has(key)) acc.set(key, { cant: 0, price: d.precioUnitario });
                                            acc.get(key).cant += d.cantidad;
                                            return acc;
                                        }, new Map()).entries()).map((entry) => {
                                            const [name, data] = entry as [string, any];
                                            return (
                                                <tr key={name}>
                                                    <td className="fw-bold text-primary">{name}</td>
                                                    <td className="text-center">
                                                        <Badge bg="light" className="text-primary border">{data.cant}</Badge>
                                                    </td>
                                                    <td className="text-end fw-bold text-primary">{(data.cant * data.price).toFixed(2)}€</td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <div className="mt-5 pt-3 border-top">
                            <h6 className="fw-bold text-muted text-uppercase small mb-3">Comandas Activas (Servicio)</h6>
                            <div className="d-flex flex-wrap gap-2">
                                {mesaOrders.map(o => (
                                    <Badge key={o.id} bg={o.estado === 'LISTO_PARA_SERVIR' ? 'accent' : 'light'} className={`px-3 py-2 border ${o.estado === 'LISTO_PARA_SERVIR' ? 'text-primary' : 'text-muted'}`} style={{ cursor: 'pointer' }} onClick={() => o.estado === 'LISTO_PARA_SERVIR' && handleServeOrder(o.id)}>
                                        #{o.id} - {o.estado.replace(/_/g, ' ')} {o.estado === 'LISTO_PARA_SERVIR' && <i className="bi bi-bell-fill ms-1 animate-pulse"></i>}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer className="border-0 p-4 justify-content-between">
                    <Button variant="outline-danger" className="fw-bold px-4" onClick={handleCloseTable}>
                        <i className="bi bi-x-circle me-2"></i> CERRAR MESA
                    </Button>
                    <Button variant="outline-primary" className="fw-bold px-4" onClick={() => setShowDetailsModal(false)}>VOLVER</Button>
                </Modal.Footer>
            </Modal>

            {}
            <Modal show={showQrModal} onHide={() => setShowQrModal(false)} centered className="qr-modal">
                <Modal.Body className="text-center p-0">
                    <div id="printable-qr" className="bg-white">
                        <div className="print-header text-center">
                            <div className="h1 fw-bold text-dark border-top border-bottom py-4" style={{ fontSize: '4.5rem', borderTopWidth: '4px !important', borderBottomWidth: '4px !important' }}>MESA {activeMesaNum}</div>
                        </div>

                        <div className="qr-container my-5 p-4 bg-white border border-4 border-primary d-inline-block shadow-sm">
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=450x450&data=${window.location.origin}/pedido-cliente/${activeToken}`}
                                alt="Mesa QR"
                                className="img-fluid"
                                style={{ width: '450px' }}
                            />
                        </div>

                        <div className="print-footer mt-4 text-center">
                            <p className="text-muted text-uppercase fw-bold tracking-widest mb-2" style={{ letterSpacing: '4px', fontSize: '1rem' }}>Código de Acceso Manual</p>
                            <div className="qr-code-text" style={{ fontSize: '2.5rem', letterSpacing: '6px', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                                {sessions.find(s => s.tokenQr === activeToken)?.codigoAcceso || '------'}
                            </div>
                            <p className="mt-4 text-muted fw-medium px-5" style={{ fontSize: '1rem', lineHeight: '1.5' }}>Escanee el código QR o introduzca el código de 6 dígitos en la web para comenzar su pedido.</p>
                        </div>
                    </div>

                    <div className="p-4 bg-light border-top d-print-none">
                        <Button variant="primary" className="w-100 fw-bold py-3 mb-3 shadow-lg" onClick={handlePrintQr}>
                            <i className="bi bi-printer-fill me-2"></i> IMPRIMIR TICKET DE MESA
                        </Button>
                        <Button variant="outline-secondary" className="w-100 fw-bold py-2 border-0" onClick={() => setShowQrModal(false)}>Cerrar ventana</Button>
                    </div>
                </Modal.Body>
            </Modal>

            {}
            <style>{`
                .table-card {
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                    border-radius: 20px;
                }
                .table-card:hover {
                    transform: translateY(-10px);
                }
                .table-card.free {
                    background: #ffffff;
                    border: 1px solid var(--color-border);
                    color: var(--color-primary);
                }
                .table-card.occupied {
                    background: var(--color-primary);
                    color: #ffffff;
                }
                .table-icon-wrapper {
                    width: 100px;
                    height: 100px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    background: rgba(231, 158, 10, 0.1);
                    color: var(--color-accent);
                }
                .occupied .table-icon-wrapper {
                    background: rgba(255, 255, 255, 0.1);
                    color: var(--color-accent);
                }

                @media print {
                    @page { margin: 0; }
                    body * { visibility: hidden; }
                    #printable-qr, #printable-qr * { visibility: visible; }
                    #printable-qr {
                        position: fixed;
                        left: 0;
                        top: 0;
                        width: 100vw;
                        height: 100vh;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        padding: 40px;
                        background: white !important;
                    }
                    .print-header { width: 100%; margin-bottom: 60px; }
                    .qr-container { margin: 60px 0 !important; }
                    .qr-container img { width: 500px !important; }
                }
            `}</style>

            {}
            {}
            <Modal show={showTableModal} onHide={() => setShowTableModal(false)} centered>
                <Modal.Header closeButton className="border-bottom-0 px-4 pt-4">
                    <Modal.Title className="fw-bold fs-2 text-primary">
                        {editingTable ? 'EDITAR MESA' : 'NUEVA MESA'}
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleTableSubmit}>
                    <Modal.Body className="p-4">
                        <Row className="g-4">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="small fw-bold text-muted text-uppercase">Número de Mesa</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        required 
                                        value={tableForm.numeroMesa}
                                        onChange={(e) => setTableForm({...tableForm, numeroMesa: e.target.value})}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="small fw-bold text-muted text-uppercase">Capacidad</Form.Label>
                                    <Form.Control 
                                        type="number" 
                                        required 
                                        min="1"
                                        value={tableForm.capacidad}
                                        onChange={(e) => setTableForm({...tableForm, capacidad: parseInt(e.target.value)})}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer className="border-0 p-4 pt-0">
                        <Button variant="light" className="fw-bold" onClick={() => setShowTableModal(false)}>CANCELAR</Button>
                        <Button variant="primary" type="submit" className="px-5 py-3 fw-bold border-0">GUARDAR</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

