import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Badge, Button, Form, InputGroup, Spinner, Modal } from 'react-bootstrap';
import { useUI } from '../context/UIContext';
import { usuarioService } from '../services/usuarioService';
import { PageHeader } from '../components/PageHeader';
import { BASE_URL } from '../services/apiConfig';

export const UsersPage: React.FC = () => {
    const { showToast, showConfirm } = useUI();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);
    const [formData, setFormData] = useState({
        nombre: '',
        apellidos: '',
        email: '',
        telefono: '',
        password: '',
        rolNombre: 'CLIENTE'
    });

    const loadData = async () => {
        try {
            const data = await usuarioService.listarTodos();
            setUsers(data);
        } catch (error) {
            showToast('Error', 'No se pudieron cargar los usuarios', 'danger');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleOpenModal = (user: any = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                nombre: user.nombre,
                apellidos: user.apellidos || '',
                email: user.email,
                telefono: user.telefono || '',
                password: '', 
                rolNombre: user.rolNombre
            });
        } else {
            setEditingUser(null);
            setFormData({
                nombre: '',
                apellidos: '',
                email: '',
                telefono: '',
                password: '',
                rolNombre: 'CLIENTE'
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingUser) {
                const payload = { ...formData };
                if (!payload.password) delete (payload as any).password;
                
                await usuarioService.actualizarUsuario(editingUser.id, payload);
                showToast('Éxito', 'Usuario actualizado correctamente');
            } else {
                await usuarioService.crearUsuario(formData);
                showToast('Éxito', 'Usuario creado correctamente');
            }
            
            setShowModal(false);
            setLoading(true);
            await loadData();
        } catch (error: any) {
            const msg = error.response?.data?.message || 'No se pudo guardar el usuario';
            showToast('Error', msg, 'danger');
        }
    };

    const handleDelete = (id: number, name: string) => {
        showConfirm(
            'Eliminar Usuario',
            `¿Estás seguro de que deseas eliminar a "${name}"? Esta acción no se puede deshacer.`,
            async () => {
                try {
                    await usuarioService.eliminarUsuario(id);
                    showToast('Eliminado', 'Usuario borrado del sistema');
                    loadData();
                } catch (error) {
                    showToast('Error', 'No se pudo eliminar el usuario', 'danger');
                }
            },
            true
        );
    };

    const filteredUsers = users.filter(u => 
        u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getRoleBadge = (role: string) => {
        if (!role) return 'secondary';
        const r = role.replace('ROLE_', '');
        switch (r) {
            case 'ADMIN': return 'danger';
            case 'CAMARERO': return 'primary';
            case 'COCINA': return 'success';
            default: return 'info';
        }
    };

    return (
        <div className="container-fluid py-4 fade-in pb-5">
            <PageHeader 
                title="Gestión de Usuarios" 
                description="Administración de personal de sala, cocina y base de datos de clientes"
                action={{
                    label: 'Nuevo Usuario',
                    icon: 'person-plus-fill',
                    onClick: () => handleOpenModal()
                }}
            />

            <Card className="border-0 shadow-sm p-4 overflow-hidden mb-4">
                <div className="mb-4">
                    <InputGroup className="w-auto" style={{ minWidth: '350px' }}>
                        <InputGroup.Text className="bg-light border-0 text-muted px-4">
                            <i className="bi bi-search fs-5"></i>
                        </InputGroup.Text>
                        <Form.Control
                            placeholder="BUSCAR POR NOMBRE O EMAIL..."
                            className="border-0 bg-light py-3 fw-bold"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </InputGroup>
                </div>

                {loading ? (
                    <div className="text-center py-5">
                        <Spinner animation="border" variant="primary" />
                        <p className="mt-3 text-muted fw-bold">Cargando base de datos...</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <Table hover className="align-middle mb-0">
                            <thead>
                                <tr>
                                    <th className="py-3 px-3">Usuario</th>
                                    <th className="py-3">Email / Teléfono</th>
                                    <th className="py-3">Rol</th>
                                    <th className="py-3 text-center">Puntos</th>
                                    <th className="py-3 text-end">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((u) => (
                                    <tr key={u.id}>
                                        <td className="py-3 px-3">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="bg-light rounded-circle d-flex align-items-center justify-content-center text-primary fw-bold" style={{ width: '45px', height: '45px' }}>
                                                    {u.imagenUrl ? (
                                                        <img src={u.imagenUrl.startsWith('http') ? u.imagenUrl : `${BASE_URL}${u.imagenUrl}`} alt="" className="w-100 h-100 rounded-circle object-fit-cover" />
                                                    ) : (
                                                        u.nombre.charAt(0)
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="fw-bold text-primary fs-5">{u.nombre} {u.apellidos}</div>
                                                    <small className="text-muted fw-bold">ID-#{u.id}</small>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3">
                                            <div className="fw-bold">{u.email}</div>
                                            <div className="small text-muted">{u.telefono || 'Sin teléfono'}</div>
                                        </td>
                                        <td className="py-3">
                                            <Badge bg={getRoleBadge(u.rolNombre)} className="px-3 py-2 fw-bold text-uppercase">
                                                {u.rolNombre.replace('ROLE_', '')}
                                            </Badge>
                                        </td>
                                        <td className="py-3 text-center">
                                            {(u.rolNombre === 'CLIENTE' || u.rolNombre === 'ROLE_CLIENTE') ? (
                                                <span className="fw-bold text-accent">{u.puntosAcumulados || 0} pts</span>
                                            ) : '-'}
                                        </td>
                                        <td className="py-3 text-end">
                                            <div className="d-flex justify-content-end gap-2">
                                                <Button variant="light" className="text-primary p-2 shadow-sm border-0" onClick={() => handleOpenModal(u)}>
                                                    <i className="bi bi-pencil-square fs-5"></i>
                                                </Button>
                                                <Button variant="light" className="text-danger p-2 shadow-sm border-0" onClick={() => handleDelete(u.id, u.nombre)}>
                                                    <i className="bi bi-trash3-fill fs-5"></i>
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                )}
            </Card>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
                <Modal.Header closeButton className="border-bottom-0 px-4 pt-4">
                    <Modal.Title className="fw-bold fs-2 text-primary">
                        {editingUser ? 'EDITAR USUARIO' : 'NUEVO USUARIO'}
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body className="px-4 py-3">
                        <Row className="g-4">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="small fw-bold text-muted text-uppercase">Nombre</Form.Label>
                                    <Form.Control required type="text" className="bg-light" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="small fw-bold text-muted text-uppercase">Apellidos</Form.Label>
                                    <Form.Control type="text" className="bg-light" value={formData.apellidos} onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })} />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="small fw-bold text-muted text-uppercase">Email</Form.Label>
                                    <Form.Control required type="email" className="bg-light" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="small fw-bold text-muted text-uppercase">Teléfono</Form.Label>
                                    <Form.Control type="tel" className="bg-light" value={formData.telefono} onChange={(e) => setFormData({ ...formData, telefono: e.target.value })} />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="small fw-bold text-muted text-uppercase">Rol en Sistema</Form.Label>
                                    <Form.Select className="bg-light fw-bold" value={formData.rolNombre} onChange={(e) => setFormData({ ...formData, rolNombre: e.target.value })}>
                                        <option value="CLIENTE">CLIENTE</option>
                                        <option value="CAMARERO">CAMARERO (SALA)</option>
                                        <option value="COCINA">COCINA</option>
                                        <option value="ADMIN">ADMINISTRADOR</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="small fw-bold text-muted text-uppercase">{editingUser ? 'Nueva Contraseña' : 'Contraseña'}</Form.Label>
                                    <Form.Control 
                                        required={!editingUser} 
                                        type="password" 
                                        className="bg-light" 
                                        placeholder={editingUser ? 'Dejar en blanco para mantener' : 'Mínimo 6 caracteres'}
                                        value={formData.password} 
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer className="border-top-0 px-4 pb-4 gap-3">
                        <Button variant="light" className="fw-bold border-0 py-3 text-muted" onClick={() => setShowModal(false)}>CANCELAR</Button>
                        <Button variant="primary" type="submit" className="px-5 py-3 fw-bold">
                            {editingUser ? 'GUARDAR CAMBIOS' : 'CREAR USUARIO'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};
