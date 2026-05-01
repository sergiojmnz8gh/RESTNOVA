import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Badge, Button, Form, InputGroup, Spinner, Modal } from 'react-bootstrap';
import api from '../services/apiConfig';
import { useUI } from '../context/UIContext';

import type { Product } from '../types/ProductTypes';
import type { Category } from '../types/CategoryTypes';

export const ProductsPage: React.FC = () => {
    const { showToast, showConfirm } = useUI();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todas');
    
    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        precio: '',
        categoriaId: '',
        disponible: true
    });

    const loadData = async () => {
        try {
            const [prodRes, catRes] = await Promise.all([
                api.get('/productos'),
                api.get('/categorias')
            ]);
            setProducts(prodRes.data);
            setCategories(catRes.data);
        } catch (error) {
            showToast('Error', 'No se pudieron cargar los datos', 'danger');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleOpenModal = (product: Product | null = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                nombre: product.nombre,
                descripcion: product.descripcion || '',
                precio: product.precio.toString(),
                categoriaId: product.categoria?.id.toString() || '',
                disponible: product.disponible
            });
        } else {
            setEditingProduct(null);
            setFormData({
                nombre: '',
                descripcion: '',
                precio: '',
                categoriaId: categories.length > 0 ? categories[0].id.toString() : '',
                disponible: true
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const catId = parseInt(formData.categoriaId);
            if (isNaN(catId)) {
                showToast('Error', 'Debes seleccionar una categoría válida', 'warning');
                return;
            }

            const payload = {
                ...formData,
                precio: parseFloat(formData.precio),
                categoriaId: catId
            };

            if (editingProduct) {
                await api.put(`/productos/${editingProduct.id}`, payload);
                showToast('Éxito', 'Producto actualizado correctamente');
            } else {
                await api.post('/productos', payload);
                showToast('Éxito', 'Producto creado correctamente');
            }
            
            // Cerrar modal y limpiar estado antes de refrescar
            setShowModal(false);
            setEditingProduct(null);
            
            // Refrescar datos y asegurar que el spinner se vea si tarda
            setLoading(true);
            await loadData();
        } catch (error: any) {
            const msg = error.response?.data?.message || 'No se pudo guardar el producto';
            showToast('Error', msg, 'danger');
        }
    };

    const handleDelete = (id: number, name: string) => {
        showConfirm(
            'Desactivar Producto',
            `¿Estás seguro de que deseas marcar "${name}" como no disponible? Podrás activarlo de nuevo después editándolo.`,
            async () => {
                try {
                    await api.delete(`/productos/${id}`);
                    showToast('Desactivado', 'El producto ya no está disponible para clientes');
                    loadData();
                } catch (error) {
                    showToast('Error', 'No se pudo desactivar el producto', 'danger');
                }
            },
            true // Marked as a "delete" action for styling
        );
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'Todas' || p.categoria?.nombre === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="container-fluid py-4 fade-in pb-5">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-3">
                <div>
                    <h1 className="display-5 fw-bold mb-1">Carta de Productos</h1>
                    <p className="text-muted fw-bold text-uppercase small">Inventario operativo de RESTNOVA</p>
                </div>
                <Button variant="primary" className="px-4 py-3 fw-bold shadow-sm" onClick={() => handleOpenModal()}>
                    <i className="bi bi-plus-lg me-2"></i> NUEVO PRODUCTO
                </Button>
            </div>

            <Card className="border-0 shadow-sm p-4 overflow-hidden mb-4">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                    <InputGroup className="w-auto" style={{ minWidth: '350px' }}>
                        <InputGroup.Text className="bg-light border-0 text-muted px-4">
                            <i className="bi bi-search fs-5"></i>
                        </InputGroup.Text>
                        <Form.Control
                            placeholder="BUSCAR EN LA CARTA..."
                            className="border-0 bg-light py-3 fw-bold"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </InputGroup>
                    
                    <Form.Select 
                        className="w-auto border-2 bg-white fw-bold text-primary px-4 py-3"
                        style={{ borderColor: '#040833' }}
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        <option value="Todas">TODAS LAS CATEGORÍAS</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.nombre}>{cat.nombre.toUpperCase()}</option>
                        ))}
                    </Form.Select>
                </div>

                {loading ? (
                    <div className="text-center py-5">
                        <Spinner animation="border" variant="primary" />
                        <p className="mt-3 text-muted fw-bold">Actualizando carta...</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <Table hover className="align-middle mb-0">
                            <thead>
                                <tr className="text-muted small text-uppercase">
                                    <th className="py-3">Producto</th>
                                    <th className="py-3">Categoría</th>
                                    <th className="py-3 text-end">Precio</th>
                                    <th className="py-3 text-center">Estado</th>
                                    <th className="py-3 text-end">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map((p) => (
                                    <tr key={p.id}>
                                        <td className="py-3">
                                            <div className="fw-bold text-dark fs-5">{p.nombre}</div>
                                            <small className="text-muted fw-bold opacity-75">REF-{p.id.toString().padStart(4, '0')}</small>
                                        </td>
                                        <td className="py-3">
                                            <Badge bg="primary" className="px-3 py-2 fw-bold text-uppercase">
                                                {p.categoria?.nombre || 'General'}
                                            </Badge>
                                        </td>
                                        <td className="py-3 text-end fw-bold text-dark fs-5">{p.precio.toFixed(2)}€</td>
                                        <td className="py-3 text-center">
                                            <Badge 
                                                bg={p.disponible ? 'success' : 'failure'} 
                                                className="px-3 py-2 shadow-sm"
                                                style={{ minWidth: '100px' }}
                                            >
                                                {p.disponible ? 'EN SERVICIO' : 'AGOTADO'}
                                            </Badge>
                                        </td>
                                        <td className="py-3 text-end">
                                            <div className="d-flex justify-content-end gap-1">
                                                <Button variant="link" className="text-primary p-2 hover-bg-light" onClick={() => handleOpenModal(p)} title="Editar">
                                                    <i className="bi bi-pencil-fill"></i>
                                                </Button>
                                                <Button variant="link" className="text-danger p-2 hover-bg-light" onClick={() => handleDelete(p.id, p.nombre)} title="Eliminar">
                                                    <i className="bi bi-trash3-fill"></i>
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

            {/* Admin Modal Update */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
                <Modal.Header closeButton className="border-bottom-0 px-4 pt-4">
                    <Modal.Title className="fw-bold fs-2 text-primary">
                        {editingProduct ? 'EDITAR PRODUCTO' : 'NUEVO PRODUCTO'}
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body className="px-4 py-3">
                        <Row className="g-4">
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label className="small fw-bold text-muted text-uppercase">Nombre</Form.Label>
                                    <Form.Control
                                        required
                                        type="text"
                                        className="bg-light"
                                        placeholder="Ej: Solomillo al Whisky"
                                        value={formData.nombre}
                                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="small fw-800 text-muted text-uppercase letter-spacing-1">Categoría</Form.Label>
                                    <Form.Select
                                        required
                                        className="premium-input bg-light border-0 fw-bold"
                                        value={formData.categoriaId}
                                        onChange={(e) => setFormData({ ...formData, categoriaId: e.target.value })}
                                    >
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="small fw-800 text-muted text-uppercase letter-spacing-1">Precio Unitario (€)</Form.Label>
                                    <Form.Control
                                        required
                                        type="number"
                                        step="0.01"
                                        className="premium-input bg-light border-0 fw-bold text-primary"
                                        placeholder="0.00"
                                        value={formData.precio}
                                        onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label className="small fw-800 text-muted text-uppercase letter-spacing-1">Descripción / Ingredientes</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        className="premium-input bg-light border-0"
                                        placeholder="Escribe los detalles aquí..."
                                        value={formData.descripcion}
                                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <div className="d-flex align-items-center justify-content-between p-3 bg-light rounded-4">
                                    <span className="fw-800 text-primary">Estado de Venta</span>
                                    <Form.Check
                                        type="switch"
                                        id="disponible-switch"
                                        label={formData.disponible ? "Disponible" : "No Disponible"}
                                        className="fw-bold fs-5 text-accent"
                                        checked={formData.disponible}
                                        onChange={(e) => setFormData({ ...formData, disponible: e.target.checked })}
                                    />
                                </div>
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer className="border-top-0 px-4 pb-4 gap-3">
                        <Button variant="light" className="px-4 py-3 border-0 fw-bold text-muted" onClick={() => setShowModal(false)}>
                            CANCELAR
                        </Button>
                        <Button variant="primary" type="submit" className="px-5 py-3 fw-bold">
                            {editingProduct ? 'GUARDAR CAMBIOS' : 'AÑADIR A LA CARTA'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};
