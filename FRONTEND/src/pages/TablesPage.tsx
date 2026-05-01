import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Badge, Button, Spinner, Modal, Form } from 'react-bootstrap';
import api from '../services/apiConfig';
import { useUI } from '../context/UIContext';
import { useAuth } from '../context/AuthContext';

import type { Mesa, SesionMesa } from '../types/TableTypes';

export const TablesPage: React.FC = () => {
    const { showToast, showConfirm } = useUI();
    const { user } = useAuth();
    const [tables, setTables] = useState<Mesa[]>([]);
    const [sessions, setSessions] = useState<SesionMesa[]>([]);
    const [loading, setLoading] = useState(true);
    
    // CRUD Modals
    const [showTableModal, setShowTableModal] = useState(false);
    const [editingTable, setEditingTable] = useState<Mesa | null>(null);
    const [tableForm, setTableForm] = useState({ numeroMesa: '', capacidad: 2 });
    
    // QR Modal
    const [showQrModal, setShowQrModal] = useState(false);
    const [activeToken, setActiveToken] = useState<string | null>(null);
    const [activeMesaNum, setActiveMesaNum] = useState<string | null>(null);

    const loadData = async () => {
        try {
            const [tablesRes, sessionsRes] = await Promise.all([
                api.get('/mesas'),
                api.get('/sesiones-mesa')
            ]);
            setTables(tablesRes.data);
            setSessions(sessionsRes.data.filter((s: SesionMesa) => !s.fechaCierre));
        } catch (error) {
            showToast('Error', 'No se pudieron sincronizar las mesas', 'danger');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const getTableStatus = (mesaId: number) => {
        const activeSession = sessions.find(s => s.mesa?.id === mesaId);
        return activeSession ? 'Ocupada' : 'Libre';
    };

    const getSessionId = (mesaId: number) => {
        return sessions.find(s => s.mesa?.id === mesaId)?.id;
    };

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
                await api.put(`/mesas/${editingTable.id}`, tableForm);
                showToast('Éxito', 'Mesa actualizada');
            } else {
                await api.post('/mesas', tableForm);
                showToast('Éxito', 'Nueva mesa añadida');
            }
            setShowTableModal(false);
            setEditingTable(null);
            setLoading(true);
            await loadData();
        } catch (error: any) {
            const msg = error.response?.data?.message || 'No se pudo procesar la mesa';
            showToast('Error', msg, 'danger');
        }
    };

    const handleDeleteTable = (id: number, num: string) => {
        showConfirm(
            'Eliminar Mesa',
            `¿Estás seguro de que deseas eliminar permanentemente la Mesa ${num}? Esta acción se realizará en cascada si hay historial.`,
            async () => {
                try {
                    await api.delete(`/mesas/${id}`);
                    showToast('Eliminada', `Mesa ${num} eliminada correctamente`);
                    loadData();
                } catch (error) {
                    showToast('Error', 'No se pudo eliminar la mesa', 'danger');
                }
            },
            true
        );
    };

    const handleOpenSession = async (mesa: Mesa) => {
        try {
            const res = await api.post('/sesiones-mesa', {
                mesaId: mesa.id,
                camareroId: user?.id
            });
            setActiveToken(res.data.tokenQr);
            setActiveMesaNum(mesa.numeroMesa);
            setShowQrModal(true);
            loadData();
            showToast('Mesa Abierta', `Sesión iniciada en Mesa ${mesa.numeroMesa}`);
        } catch (error) {
            showToast('Error', 'No se pudo abrir la mesa', 'danger');
        }
    };

    const handleCloseSession = (mesaId: number, num: string) => {
        const sessionId = getSessionId(mesaId);
        if (!sessionId) return;

        showConfirm(
            'Finalizar Sesión',
            `¿Deseas cerrar la sesión de la Mesa ${num}? Asegúrate de que todos los pedidos están pagados.`,
            async () => {
                try {
                    await api.put(`/sesiones-mesa/${sessionId}/cerrar`);
                    showToast('Éxito', `Mesa ${num} liberada correctamente`);
                    setLoading(true);
                    await loadData();
                } catch (error: any) {
                    const msg = error.response?.data?.message || 'No se pudo cerrar la sesión';
                    showToast('Acción Requerida', msg, 'warning');
                }
            }
        );
    };

    return (
        <div className="container-fluid py-4 fade-in pb-5">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-3">
                <div>
                    <h1 className="display-5 fw-bold mb-1">Mapa de Mesas</h1>
                    <p className="text-muted fw-bold text-uppercase small">Control de sala y sesiones QR</p>
                </div>
                <div className="d-flex gap-3">
                    <Button variant="primary" className="px-5 py-3 fw-bold shadow-sm italic" onClick={() => handleOpenTableModal()}>
                        <i className="bi bi-plus-lg me-2"></i> NUEVA MESA
                    </Button>
                </div>
            </div>

            {/* Status Legend */}
            <div className="d-flex flex-wrap gap-4 mb-5 p-3 px-4 bg-white rounded-4 border shadow-sm w-fit mx-auto border-2" style={{ borderColor: '#04083320' }}>
                <div className="d-flex align-items-center gap-2 small fw-bold text-muted italic">
                    <span className="p-2 bg-success rounded-circle shadow-sm animate-pulse"></span> DISPONIBLE (PIT STOP READY)
                </div>
                <div className="d-flex align-items-center gap-2 small fw-bold text-muted italic">
                    <span className="p-2 bg-failure rounded-circle shadow-sm"></span> OCUPADA (IN RACE)
                </div>
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2 text-muted">Cargando mapa de mesas...</p>
                </div>
            ) : (
                <Row className="g-4">
                    {tables.map((m) => {
                        const status = getTableStatus(m.id);
                        return (
                            <Col key={m.id} xs={12} sm={6} md={4} lg={3}>
                                <Card className={`h-100 border-0 p-2 stats-card shadow-premium ${status === 'Ocupada' ? 'border-top border-danger border-4' : ''}`}>
                                    <div className="position-absolute top-0 end-0 p-2 d-flex gap-1 z-index-1">
                                        <Button variant="link" className="text-muted p-1 hover-bg-light rounded-circle" style={{width: '32px', height: '32px'}} onClick={() => handleOpenTableModal(m)}>
                                            <i className="bi bi-pencil-fill small"></i>
                                        </Button>
                                        <Button variant="link" className="text-danger p-1 hover-bg-light rounded-circle" style={{width: '32px', height: '32px'}} onClick={() => handleDeleteTable(m.id, m.numeroMesa)}>
                                            <i className="bi bi-x-circle-fill small"></i>
                                        </Button>
                                    </div>
                                    <Card.Body className="d-flex flex-column align-items-center text-center py-4">
                                        <div className={`mb-3 p-4 rounded-circle shadow-sm ${status === 'Ocupada' ? 'bg-failure text-white' : 'bg-light text-primary opacity-75'}`}>
                                            <i className={`bi bi-${status === 'Ocupada' ? 'people-fill' : 'door-open-fill'} fs-2`}></i>
                                        </div>
                                        <h3 className="h3 fw-bold text-primary mb-1">MESA {m.numeroMesa}</h3>
                                        <p className="small text-muted fw-bold mb-4">{m.capacidad} PERSONAS</p>
                                        
                                        <Badge bg={status === 'Libre' ? 'success' : 'failure'} className="mb-4 px-4 py-2 shadow-sm fw-bold">
                                            {status.toUpperCase()}
                                        </Badge>

                                        <div className="mt-auto w-100 pt-2 px-2">
                                            {status === 'Libre' ? (
                                                <Button 
                                                    variant="primary" 
                                                    className="w-100 fw-bold py-3 shadow-sm italic fs-5"
                                                    onClick={() => handleOpenSession(m)}
                                                >
                                                    ABRIR SERVICIO
                                                </Button>
                                            ) : (
                                                <Button 
                                                    variant="danger" 
                                                    className="w-100 fw-bold py-3 shadow-sm italic fs-5 group"
                                                    onClick={() => handleCloseSession(m.id, m.numeroMesa)}
                                                >
                                                    <i className="bi bi-flag-fill me-2"></i> LIBERAR MESA
                                                </Button>
                                            )}
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        );
                    })}
                </Row>
            )}

            {/* Mesa Create/Edit Modal */}
            <Modal show={showTableModal} onHide={() => setShowTableModal(false)} centered>
                <Modal.Header closeButton className="border-bottom-0 px-4 pt-4">
                    <Modal.Title className="fw-bold fs-2 text-primary">
                        {editingTable ? `EDITAR MESA ${editingTable.numeroMesa}` : 'NUEVA MESA'}
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleTableSubmit}>
                    <Modal.Body className="px-4 py-3">
                        <Form.Group className="mb-4">
                            <Form.Label className="small fw-bold text-muted text-uppercase">Identificador de Mesa</Form.Label>
                            <Form.Control
                                required
                                type="text"
                                className="bg-light"
                                placeholder="Ej: 5, VIP-1, Terraza-2"
                                value={tableForm.numeroMesa}
                                onChange={(e) => setTableForm({ ...tableForm, numeroMesa: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label className="small fw-bold text-muted text-uppercase">Capacidad Máxima</Form.Label>
                            <Form.Control
                                required
                                type="number"
                                min="1"
                                className="bg-light fw-bold"
                                value={tableForm.capacidad}
                                onChange={(e) => setTableForm({ ...tableForm, capacidad: parseInt(e.target.value) })}
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer className="border-top-0 px-4 pb-4 gap-3">
                        <Button variant="light" className="fw-bold border-0 py-3 text-muted" onClick={() => setShowTableModal(false)}>CANCELAR</Button>
                        <Button variant="primary" type="submit" className="px-5 py-3 fw-bold">GUARDAR CAMBIOS</Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* QR Modal Racing Style */}
            <Modal show={showQrModal} onHide={() => setShowQrModal(false)} centered>
                <Modal.Header closeButton className="border-bottom-0 px-4 pt-4">
                    <Modal.Title className="fw-bold fs-2 text-center w-100">ACCESO QR - MESA {activeMesaNum}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center py-5 px-4">
                    <div className="bg-white p-4 rounded-4 border-2 border-primary mx-auto mb-4" style={{ width: 'fit-content' }}>
                        <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${window.location.origin}/pedido-cliente/${activeToken}`} 
                            alt="Mesa QR"
                            className="img-fluid"
                        />
                    </div>
                    <p className="text-primary fw-bold text-uppercase mb-4 italic">El cliente puede escanear para pedir</p>
                    <div className="d-grid gap-3">
                        <Button variant="primary" className="fw-bold py-3 fs-5" onClick={() => window.print()}>
                            <i className="bi bi-printer-fill me-2"></i> IMPRIMIR TICKET DE MESA
                        </Button>
                        <div className="mt-3 p-4 bg-light rounded-4 text-center border-0">
                            <p className="small text-muted fw-bold mb-3">ENLACE MANUAL</p>
                            <code className="d-block p-3 bg-white border-dashed border-2 rounded-3 text-primary mb-3 text-break" style={{ fontSize: '0.85rem' }}>
                                {`${window.location.origin}/pedido-cliente/${activeToken}`}
                            </code>
                            <Button variant="outline-primary" size="sm" className="fw-bold px-4 py-2" onClick={() => {
                                navigator.clipboard.writeText(`${window.location.origin}/pedido-cliente/${activeToken}`);
                                showToast('Copiado', 'Enlace copiado');
                            }}>
                                <i className="bi bi-clipboard2-plus-fill me-2"></i> COPIAR ENLACE
                            </Button>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    );
};
