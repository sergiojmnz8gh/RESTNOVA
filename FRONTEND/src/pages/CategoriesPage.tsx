import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Button, Form, Spinner, Modal } from 'react-bootstrap';
import api from '../services/apiConfig';
import { useUI } from '../context/UIContext';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../routes/routes';

import type { Category } from '../types/CategoryTypes';

export const CategoriesPage: React.FC = () => {
    const { showToast, showConfirm } = useUI();
    const navigate = useNavigate();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [name, setName] = useState('');

    const loadData = async () => {
        try {
            const res = await api.get('/categorias');
            setCategories(res.data);
        } catch (error) {
            showToast('Error', 'No se pudieron cargar las categorías', 'danger');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleOpenModal = (cat: Category | null = null) => {
        if (cat) {
            setEditingCategory(cat);
            setName(cat.nombre);
        } else {
            setEditingCategory(null);
            setName('');
        }
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingCategory) {
                await api.put(`/categorias/${editingCategory.id}`, { nombre: name });
                showToast('Éxito', 'Categoría actualizada');
            } else {
                await api.post('/categorias', { nombre: name });
                showToast('Éxito', 'Categoría creada');
            }
            setShowModal(false);
            setEditingCategory(null);
            setLoading(true);
            await loadData();
        } catch (error: any) {
            const msg = error.response?.data?.message || 'No se pudo guardar la categoría';
            showToast('Error', msg, 'danger');
        }
    };

    const handleDelete = (id: number, catName: string) => {
        showConfirm(
            'Eliminar Categoría',
            `¿Estás seguro de que deseas eliminar "${catName}"? Esto ELIMINARÁ EN CASCADA todos los productos asociados.`,
            async () => {
                try {
                    await api.delete(`/categorias/${id}`);
                    showToast('Eliminada', 'Categoría y productos asociados eliminados');
                    loadData();
                } catch (error) {
                    showToast('Error', 'No se pudo eliminar la categoría', 'danger');
                }
            },
            true
        );
    };

    return (
        <div className="container-fluid py-4 fade-in pb-5">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-3">
                <div className="d-flex align-items-center gap-3">
                    <Button variant="link" className="text-primary p-0 shadow-none hover-bg-light rounded-circle" style={{ width: '45px', height: '45px' }} onClick={() => navigate(ROUTES.ADMIN_PRODUCTOS)}>
                        <i className="bi bi-arrow-left-circle-fill fs-1"></i>
                    </Button>
                    <div>
                        <h1 className="display-5 fw-bold mb-1">Categorías</h1>
                        <p className="text-muted fw-bold text-uppercase small">Familias de productos activos</p>
                    </div>
                </div>
                <Button variant="primary" className="px-4 py-3 fw-bold shadow-sm" onClick={() => handleOpenModal()}>
                    <i className="bi bi-plus-lg me-2"></i> NUEVA CATEGORÍA
                </Button>
            </div>

            <Row className="justify-content-center">
                <Col lg={10}>
                    <Card className="border-0 shadow-sm p-4 overflow-hidden">
                        {loading ? (
                            <div className="text-center py-5">
                                <Spinner animation="border" variant="primary" />
                                <p className="mt-3 text-muted fw-bold italic">Actualizando registros...</p>
                            </div>
                        ) : (
                            <Table hover className="align-middle mb-0">
                                <thead>
                                    <tr>
                                        <th className="py-3">FAMILIA / CATEGORÍA</th>
                                        <th className="py-3 text-end">ACCIONES</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {categories.map((cat) => (
                                        <tr key={cat.id}>
                                            <td className="py-4">
                                                <div className="fw-bold text-dark fs-4 text-uppercase">{cat.nombre}</div>
                                                <small className="text-primary fw-bold">REF-CAT-{cat.id.toString().padStart(3, '0')}</small>
                                            </td>
                                            <td className="py-4 text-end">
                                                <div className="d-flex justify-content-end gap-2">
                                                    <Button variant="primary" className="px-3" onClick={() => handleOpenModal(cat)} title="Editar">
                                                        <i className="bi bi-pencil-square"></i>
                                                    </Button>
                                                    <Button variant="failure" className="px-3 text-white" onClick={() => handleDelete(cat.id, cat.nombre)} title="Eliminar">
                                                        <i className="bi bi-trash3-fill"></i>
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {categories.length === 0 && (
                                        <tr>
                                            <td colSpan={2} className="text-center py-5 text-muted fw-bold">
                                                No hay categorías definidas en la carta.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        )}
                    </Card>
                </Col>
            </Row>

            {/* Category Modal Update */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton className="border-bottom-0 px-4 pt-4">
                    <Modal.Title className="fw-bold fs-2 text-primary">
                        {editingCategory ? 'EDITAR FAMILIA' : 'NUEVA FAMILIA'}
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body className="px-4 py-3">
                        <Form.Group>
                            <Form.Label className="small fw-bold text-muted text-uppercase">Nombre Descriptivo</Form.Label>
                            <Form.Control
                                required
                                type="text"
                                className="bg-light border-0 py-3"
                                placeholder="Ej: Carnes, Pescados, Bebidas..."
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                autoFocus
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer className="border-top-0 px-4 pb-4 gap-3">
                        <Button variant="light" className="fw-bold border-0 py-3 text-muted" onClick={() => setShowModal(false)}>CANCELAR</Button>
                        <Button variant="primary" type="submit" className="px-5 py-3 fw-bold">
                            {editingCategory ? 'GUARDAR CAMBIOS' : 'CREAR CATEGORÍA'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};
