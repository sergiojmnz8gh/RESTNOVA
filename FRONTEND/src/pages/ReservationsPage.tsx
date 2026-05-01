import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Badge, Button, Spinner, Modal, Form } from 'react-bootstrap';
import api from '../services/apiConfig';
import { useUI } from '../context/UIContext';
import type { Reserva } from '../types/ReservationTypes';

export const ReservationsPage: React.FC = () => {
    const { showToast, showConfirm } = useUI();
    const [reservations, setReservations] = useState<Reserva[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editingReserva, setEditingReserva] = useState<Reserva | null>(null);
    const [formData, setFormData] = useState({
        usuarioId: '',
        fecha: '',
        hora: '',
        numPersonas: 2,
        estado: 'PENDIENTE'
    });

    const loadData = async () => {
        try {
            const [resRes, userRes] = await Promise.all([
                api.get('/reservas'),
                api.get('/usuarios')
            ]);
            setReservations(resRes.data);
            setUsers(userRes.data);
        } catch (error) {
            showToast('Error', 'No se pudieron cargar las reservas', 'danger');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleOpenModal = (res: Reserva | null = null) => {
        if (res) {
            setEditingReserva(res);
            setFormData({
                usuarioId: res.usuarioId?.toString() || '',
                fecha: res.fecha,
                hora: res.hora.substring(0, 5),
                numPersonas: res.numPersonas,
                estado: res.estado
            });
        } else {
            setEditingReserva(null);
            const today = new Date();
            today.setDate(today.getDate() + 1); // Tomorrow by default
            const dateStr = today.toISOString().split('T')[0];
            setFormData({
                usuarioId: '',
                fecha: dateStr,
                hora: '14:00',
                numPersonas: 2,
                estado: 'PENDIENTE'
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                usuarioId: parseInt(formData.usuarioId),
                numPersonas: parseInt(formData.numPersonas.toString()),
                hora: formData.hora + ":00"
            };

            if (editingReserva) {
                await api.put(`/reservas/${editingReserva.id}`, payload);
                showToast('Éxito', 'Reserva actualizada');
            } else {
                await api.post('/reservas', payload);
                showToast('Éxito', 'Reserva creada correctamente');
            }
            setShowModal(false);
            setEditingReserva(null);
            setLoading(true);
            await loadData();
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || 'No se pudo procesar la reserva';
            showToast('Error', errorMsg, 'danger');
        }
    };

    const handleDelete = (id: number, cliente: string) => {
        showConfirm(
            'Eliminar Reserva',
            `¿Estás seguro de que deseas eliminar permanentemente la reserva de ${cliente}?`,
            async () => {
                try {
                    await api.delete(`/reservas/${id}`);
                    showToast('Eliminada', 'Reserva borrada satisfactoriamente');
                    loadData();
                } catch (error) {
                    showToast('Error', 'No se pudo eliminar la reserva', 'danger');
                }
            },
            true
        );
    };

    const updateStatus = async (res: Reserva, newStatus: string) => {
        try {
            await api.put(`/reservas/${res.id}`, {
                ...res,
                estado: newStatus,
                hora: res.hora.substring(0, 8)
            });
            showToast('Estatus Actualizado', `Reserva #${res.id} marcada como ${newStatus}`);
            loadData();
        } catch (error) {
            showToast('Error', 'No se pudo actualizar el estatus', 'danger');
        }
    };

    const getBadgeVariant = (estado: string) => {
        switch (estado) {
            case 'CONFIRMADA': return 'success';
            case 'PENDIENTE': return 'warning';
            case 'CANCELADA': return 'danger';
            case 'COMPLETADA': return 'info';
            default: return 'secondary';
        }
    };

    return (
        <div className="container-fluid py-4 fade-in pb-5">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-3">
                <div>
                    <h1 className="display-5 fw-bold mb-1">Libro de Reservas</h1>
                    <p className="text-muted fw-bold text-uppercase small">Gestión de agenda y aforo</p>
                </div>
                <Button variant="primary" className="px-4 py-3 fw-bold shadow-sm" onClick={() => handleOpenModal()}>
                    <i className="bi bi-calendar-plus-fill me-2"></i> NUEVA RESERVA
                </Button>
            </div>

            <Card className="border-0 shadow-sm p-4 overflow-hidden">
                {loading ? (
                    <div className="text-center py-5">
                        <Spinner animation="border" variant="primary" />
                        <p className="mt-3 text-muted fw-bold">Sincronizando agenda...</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <Table hover className="align-middle mb-0">
                            <thead>
                                <tr>
                                    <th className="py-3">CLIENTE</th>
                                    <th className="py-3">FECHA Y HORA</th>
                                    <th className="py-3 text-center">COMENSALES</th>
                                    <th className="py-3 text-center">ESTADO</th>
                                    <th className="py-3 text-end">ACCIONES</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reservations.map((r) => (
                                    <tr key={r.id}>
                                        <td className="py-4">
                                            <div className="fw-bold text-dark fs-5 text-uppercase">{r.usuarioNombre}</div>
                                            <small className="text-primary fw-bold">RES-#{r.id.toString().padStart(4, '0')}</small>
                                        </td>
                                        <td className="py-4">
                                            <div className="fw-bold text-dark fs-5">{r.fecha}</div>
                                            <div className="small text-muted fw-bold italic">{r.hora.substring(0, 5)} HORAS</div>
                                        </td>
                                        <td className="py-4 text-center">
                                            <div className="d-flex align-items-center justify-content-center gap-2">
                                                <span className="fs-4 fw-bold text-dark">{r.numPersonas}</span>
                                                <i className="bi bi-people-fill text-primary opacity-50 fs-5"></i>
                                            </div>
                                        </td>
                                        <td className="py-4 text-center">
                                            <Badge bg={getBadgeVariant(r.estado)} className="shadow-sm px-3 py-2 fw-bold">
                                                {r.estado}
                                            </Badge>
                                        </td>
                                        <td className="py-4 text-end">
                                            <div className="d-flex justify-content-end gap-2">
                                                {r.estado === 'PENDIENTE' && (
                                                    <Button variant="primary" className="px-3" onClick={() => updateStatus(r, 'CONFIRMADA')} title="Confirmar">
                                                        <i className="bi bi-check-lg"></i>
                                                    </Button>
                                                )}
                                                <Button variant="outline-primary" className="px-3" onClick={() => handleOpenModal(r)} title="Editar">
                                                    <i className="bi bi-pencil-square"></i>
                                                </Button>
                                                <Button variant="failure" className="px-3 text-white" onClick={() => handleDelete(r.id, r.usuarioNombre)} title="Eliminar">
                                                    <i className="bi bi-trash3-fill"></i>
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {reservations.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="text-center py-5 text-muted fw-bold">
                                            No hay reservas programadas en el sistema.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>
                )}
            </Card>

            {/* Reservation Modal Update */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
                <Modal.Header closeButton className="border-bottom-0 px-4 pt-4">
                    <Modal.Title className="fw-bold fs-2 text-primary">
                        {editingReserva ? 'EDITAR RESERVA' : 'NUEVA RESERVA'}
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body className="px-4 py-3">
                        <Row className="g-4">
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label className="small fw-800 text-muted text-uppercase letter-spacing-1">Seleccionar Cliente</Form.Label>
                                    <Form.Select
                                        required
                                        className="premium-input bg-light border-0 fw-bold"
                                        value={formData.usuarioId}
                                        onChange={(e) => setFormData({ ...formData, usuarioId: e.target.value })}
                                    >
                                        <option value="">Buscar en base de datos...</option>
                                        {users.map(u => (
                                            <option key={u.id} value={u.id}>{u.nombre} {u.apellidos} ({u.email})</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="small fw-800 text-muted text-uppercase letter-spacing-1">Fecha del Servicio</Form.Label>
                                    <Form.Control
                                        required
                                        type="date"
                                        className="premium-input bg-light border-0"
                                        value={formData.fecha}
                                        onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label className="small fw-800 text-muted text-uppercase letter-spacing-1">Hora</Form.Label>
                                    <Form.Control
                                        required
                                        type="time"
                                        className="premium-input bg-light border-0 fw-bold text-primary"
                                        value={formData.hora}
                                        onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label className="small fw-800 text-muted text-uppercase letter-spacing-1">Personas</Form.Label>
                                    <Form.Control
                                        required
                                        type="number"
                                        min="1"
                                        className="premium-input bg-light border-0 fw-bold"
                                        value={formData.numPersonas}
                                        onChange={(e) => setFormData({ ...formData, numPersonas: parseInt(e.target.value) })}
                                    />
                                </Form.Group>
                            </Col>
                            {editingReserva && (
                                <Col md={12}>
                                    <Form.Group>
                                        <Form.Label className="small fw-800 text-muted text-uppercase letter-spacing-1">Estado Administrativo</Form.Label>
                                        <Form.Select
                                            className="premium-input bg-light border-0 fw-bold"
                                            value={formData.estado}
                                            onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                                        >
                                            <option value="PENDIENTE">PENDIENTE</option>
                                            <option value="CONFIRMADA">CONFIRMADA</option>
                                            <option value="COMPLETADA">COMPLETADA</option>
                                            <option value="CANCELADA">CANCELADA</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            )}
                        </Row>
                    </Modal.Body>
                    <Modal.Footer className="border-top-0 px-4 pb-4 gap-3">
                        <Button variant="light" className="fw-bold border-0 py-3 text-muted" onClick={() => setShowModal(false)}>CANCELAR</Button>
                        <Button variant="primary" type="submit" className="px-5 py-3 fw-bold">
                            {editingReserva ? 'GUARDAR CAMBIOS' : 'AGENDAR RESERVA'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};
