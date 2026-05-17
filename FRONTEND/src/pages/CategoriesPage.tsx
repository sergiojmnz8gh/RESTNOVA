import React, { useState, useEffect } from 'react';
import { Row, Col, Table, Button, Form, Spinner, Modal, Badge } from 'react-bootstrap';
import { useUI } from '../context/UIContext';
import { PageHeader } from '../components/PageHeader';
import { productoService } from '../services/productoService';

import type { Category } from '../types/CategoryTypes';

export const CategoriesPage: React.FC = () => {
    const { showToast, showConfirm } = useUI();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    
    
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [name, setName] = useState('');
    const [orden, setOrden] = useState(0);

    const loadData = async () => {
        try {
            const data = await productoService.listarCategorias();
            setCategories(data.sort((a, b) => a.orden - b.orden));
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
            setOrden(cat.orden);
        } else {
            setEditingCategory(null);
            setName('');
            setOrden(categories.length > 0 ? Math.max(...categories.map(c => c.orden)) + 1 : 1);
        }
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingCategory) {
                await productoService.actualizarCategoria(editingCategory.id, { nombre: name, orden: editingCategory.orden });
                showToast('Éxito', 'Categoría actualizada');
            } else {
                await productoService.crearCategoria({ nombre: name, orden });
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

    const handleMove = async (cat: Category, direction: 'up' | 'down') => {
        const index = categories.findIndex(c => c.id === cat.id);
        if (index === -1) return;
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === categories.length - 1) return;

        setLoading(true);
        try {
            
            const newCategories = categories.map(c => ({ ...c }));
            
            const targetIndex = direction === 'up' ? index - 1 : index + 1;
            const temp = newCategories[index];
            newCategories[index] = newCategories[targetIndex];
            newCategories[targetIndex] = temp;

            
            for (let i = 0; i < newCategories.length; i++) {
                newCategories[i].orden = i + 1;
            }

            
            for (const c of newCategories) {
                await productoService.actualizarCategoria(c.id, { nombre: c.nombre, orden: c.orden });
            }
            
            await loadData();
            showToast('Éxito', 'Orden de visualización actualizado');
        } catch (error) {
            showToast('Error', 'No se pudo cambiar el orden', 'danger');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id: number, catName: string) => {
        showConfirm(
            'Eliminar Categoría',
            `¿Estás seguro de que deseas eliminar "${catName}"? Esto ELIMINARÁ EN CASCADA todos los productos asociados.`,
            async () => {
                try {
                    await productoService.eliminarCategoria(id);
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
            
            <PageHeader 
                title="Gestión de Categorías" 
                description="Familias de productos y control de visualización en la carta"
                action={{
                    label: 'Nueva Categoría',
                    icon: 'plus-lg',
                    onClick: () => handleOpenModal()
                }}
            />

            <Row className="justify-content-center">
                <Col lg={12}>
                    <div>
                        {loading ? (
                            <div className="text-center py-5">
                                <Spinner animation="border" variant="primary" />
                                <p className="mt-3 text-muted fw-bold">Actualizando registros...</p>
                            </div>
                        ) : (
                            <div className="table-container shadow-premium rounded-4 overflow-hidden bg-white">
                                <Table hover className="align-middle mb-0">
                                <thead>
                                    <tr>
                                        <th className="py-3 px-4" style={{ width: '100px' }}>ORDEN</th>
                                        <th className="py-3">FAMILIA / CATEGORÍA</th>
                                        <th className="py-3 text-end px-4">ACCIONES</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {categories.map((cat, index) => (
                                        <tr key={cat.id}>
                                            <td className="px-4">
                                                <div className="d-flex flex-column align-items-center gap-1">
                                                    <Button variant="light" size="sm" className="p-0 border-0 text-primary" disabled={index === 0} onClick={() => handleMove(cat, 'up')}>
                                                        <i className="bi bi-chevron-up fs-5"></i>
                                                    </Button>
                                                    <Badge bg="primary" className="px-3">{cat.orden}</Badge>
                                                    <Button variant="light" size="sm" className="p-0 border-0 text-primary" disabled={index === categories.length - 1} onClick={() => handleMove(cat, 'down')}>
                                                        <i className="bi bi-chevron-down fs-5"></i>
                                                    </Button>
                                                </div>
                                            </td>
                                            <td className="py-4">
                                                <div className="fw-bold text-primary fs-4 text-uppercase">{cat.nombre}</div>
                                                <small className="text-muted fw-bold">REF-CAT-{cat.id}</small>
                                            </td>
                                            <td className="py-4 text-end px-4">
                                                <div className="d-flex justify-content-end gap-2">
                                                    <Button variant="light" className="text-primary p-2 shadow-sm rounded-3 border-0" onClick={() => handleOpenModal(cat)} title="Editar">
                                                        <i className="bi bi-pencil-square fs-5"></i>
                                                    </Button>
                                                    <Button variant="light" className="text-danger p-2 shadow-sm rounded-3 border-0" onClick={() => handleDelete(cat.id, cat.nombre)} title="Eliminar">
                                                        <i className="bi bi-trash3-fill fs-5"></i>
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {categories.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="text-center py-5 text-muted fw-bold">
                                                No hay categorías definidas en la carta.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </div>
                    )}
                    </div>
                </Col>
            </Row>

            {}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton className="border-bottom-0 px-4 pt-4">
                    <Modal.Title className="fw-bold fs-2 text-primary">
                        {editingCategory ? 'EDITAR FAMILIA' : 'NUEVA FAMILIA'}
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body className="px-4 py-3">
                        <Form.Group className="mb-4">
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

