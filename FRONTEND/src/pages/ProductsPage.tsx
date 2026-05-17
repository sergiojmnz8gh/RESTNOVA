import React, { useEffect, useState } from 'react';
import { Badge, Button, Card, Col, Form, InputGroup, Modal, Row, Spinner, Table } from 'react-bootstrap';
import { PageHeader } from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { BASE_URL } from '../services/apiConfig';
import { productoService } from '../services/productoService';

import type { Category } from '../types/CategoryTypes';
import type { Product } from '../types/ProductTypes';

export const ProductsPage: React.FC = () => {
    const { showToast, showConfirm } = useUI();
    const { user } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todas');


    const isAdmin = user?.rol?.includes('ADMIN');
    const isKitchen = user?.rol?.includes('COCINA') || isAdmin;
    const isWaiter = user?.rol?.includes('CAMARERO') || isAdmin;


    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        precio: '',
        categoriaId: '',
        disponible: true
    });

    const loadData = async () => {
        try {
            const [prods, cats] = await Promise.all([
                productoService.listarTodos(),
                productoService.listarCategorias()
            ]);
            setProducts(prods);
            setCategories(cats);
        } catch (error) {
            showToast('Error', 'No se pudieron cargar los datos', 'danger');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 10000);
        return () => clearInterval(interval);
    }, []);

    const toggleAvailability = async (product: Product) => {
        try {
            const newStatus = !product.disponible;
            await productoService.actualizar(product.id, {
                ...product,
                disponible: newStatus,
                categoriaId: product.categoria?.id
            });
            showToast('Actualizado', `${product.nombre} ahora está ${newStatus ? 'EN SERVICIO' : 'AGOTADO'}`, 'success');
            loadData();
        } catch (error) {
            showToast('Error', 'No se pudo cambiar el estado del producto', 'danger');
        }
    };

    const handleOpenModal = (product: Product | null = null) => {
        if (!isAdmin) return;
        setImageFile(null);
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

            let productId;
            if (editingProduct) {
                await productoService.actualizar(editingProduct.id, payload);
                productId = editingProduct.id;
                showToast('Éxito', 'Producto actualizado correctamente');
            } else {
                const res = await productoService.crear(payload);
                productId = res.id;
                showToast('Éxito', 'Producto creado correctamente');
            }


            if (imageFile && productId) {
                const imgFormData = new FormData();
                imgFormData.append('imagen', imageFile);

                const api = (await import('../services/apiConfig')).default;
                await api.post(`/productos/${productId}/imagen`, imgFormData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            setShowModal(false);
            setEditingProduct(null);
            setImageFile(null);
            setLoading(true);
            await loadData();
        } catch (error: any) {
            const msg = error.response?.data?.message || 'No se pudo guardar el producto';
            showToast('Error', msg, 'danger');
        }
    };

    const handleDelete = (id: number, name: string) => {
        if (!isAdmin) return;
        showConfirm(
            'Eliminar Producto',
            `¿Estás seguro de que deseas eliminar permanentemente "${name}" de la carta?`,
            async () => {
                try {
                    await productoService.eliminar(id);
                    showToast('Eliminado', 'El producto ha sido eliminado de la carta');
                    loadData();
                } catch (error) {
                    showToast('Error', 'No se pudo eliminar el producto', 'danger');
                }
            },
            true
        );
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'Todas' || p.categoria?.nombre === selectedCategory;
        return matchesSearch && matchesCategory;
    }).sort((a, b) => {
        const dispA = a.disponible ? 1 : 0;
        const dispB = b.disponible ? 1 : 0;
        if (dispA !== dispB) {
            return dispA - dispB;
        }
        return a.nombre.localeCompare(b.nombre);
    });

    return (
        <div className="container-fluid py-4 fade-in pb-5">
            <PageHeader
                title="Productos y Stock"
                description="Control de disponibilidad en tiempo real e inventario operativo"
                action={isAdmin ? {
                    label: 'Nuevo Producto',
                    icon: 'plus-lg',
                    onClick: () => handleOpenModal()
                } : undefined}
            />

            <Card className="border-0 shadow-sm p-4 overflow-hidden mb-4">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-4">
                    <InputGroup className="premium-input-group shadow-sm flex-grow-1" style={{ maxWidth: '80%' }}>
                        <InputGroup.Text className="bg-light border-0 text-muted px-4">
                            <i className="bi bi-search fs-5"></i>
                        </InputGroup.Text>
                        <Form.Control
                            placeholder="Buscar por nombre de plato, ingredientes..."
                            className="border-0 bg-light py-3 fw-bold"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </InputGroup>

                    <Form.Select
                        className="premium-select border-0 bg-light fw-bold text-primary px-4 py-3 shadow-sm rounded-3"
                        style={{ width: '180px' }}
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        <option value="Todas">TODAS</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.nombre}>{cat.nombre.toUpperCase()}</option>
                        ))}
                    </Form.Select>
                </div>

                {loading && products.length === 0 ? (
                    <div className="text-center py-5">
                        <Spinner animation="border" variant="accent" style={{ width: '3rem', height: '3rem' }} />
                        <p className="mt-3 text-muted fw-bold text-uppercase tiny">Sincronizando Carta...</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        {filteredProducts.length === 0 ? (
                            <div className="empty-state py-5">
                                <i className="bi bi-search display-1 opacity-10"></i>
                                <h5 className="fw-bold mt-3">Sin resultados</h5>
                                <p className="text-muted">No hemos encontrado ningún plato con esos filtros.</p>
                            </div>
                        ) : (
                            <Table hover className="align-middle mb-0">
                                <thead className="bg-light">
                                    <tr>
                                        <th className="py-3 px-4 border-0 small fw-bold text-muted" style={{ width: '45%' }}>PRODUCTO</th>
                                        <th className="py-3 border-0 small fw-bold text-muted text-center" style={{ width: '15%' }}>CATEGORÍA</th>
                                        <th className="py-3 border-0 small fw-bold text-muted text-center" style={{ width: '12%' }}>PRECIO</th>
                                        <th className="py-3 border-0 small fw-bold text-muted text-center" style={{ width: '13%' }}>ESTADO</th>
                                        <th className="py-3 border-0 small fw-bold text-muted text-end px-4" style={{ width: '15%' }}>ACCIONES</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProducts.map((p) => (
                                        <tr key={p.id} className={`border-bottom border-light ${!p.disponible ? 'bg-light bg-opacity-50' : ''}`}>
                                            <td className="py-3 px-4">
                                                <div className="d-flex align-items-center gap-3">
                                                    <div className="product-img-wrapper rounded-3 overflow-hidden shadow-sm" style={{ width: '55px', height: '55px' }}>
                                                        <img
                                                            src={p.imagenUrl ? (p.imagenUrl.startsWith('http') ? p.imagenUrl : `${BASE_URL}${p.imagenUrl}`) : `${BASE_URL}/productos/${p.id}.png`}
                                                            alt={p.nombre}
                                                            className="w-100 h-100 object-fit-cover"
                                                            onError={(e) => (e.currentTarget.src = 'https://placehold.co/100x100/2c3e50/white?text=RestNova')}
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="fw-bold text-primary fs-5 text-uppercase">{p.nombre}</div>
                                                        <small className="text-muted fw-bold">ID-#{p.id}</small>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 text-center">
                                                <Badge bg="light" className="text-muted border px-3 py-2 fw-bold text-uppercase">
                                                    {p.categoria?.nombre || 'SIN CATEGORÍA'}
                                                </Badge>
                                            </td>
                                            <td className="py-3 text-center fw-bold text-accent fs-5">
                                                {p.precio.toFixed(2)}€
                                            </td>
                                            <td className="py-3 text-center">
                                                <Badge bg={p.disponible ? 'success' : 'danger'} className="px-3 py-2 fw-bold text-uppercase">
                                                    {p.disponible ? 'DISPONIBLE' : 'AGOTADO'}
                                                </Badge>
                                            </td>
                                            <td className="py-3 text-end px-4">
                                                <div className="d-flex justify-content-end gap-2 align-items-center">
                                                    {(isAdmin || isKitchen || isWaiter) && (
                                                        <Button
                                                            variant={p.disponible ? "outline-danger" : "outline-success"}
                                                            size="sm"
                                                            className="fw-bold px-3 py-2 text-uppercase"
                                                            style={{ borderRadius: '8px', fontSize: '0.75rem' }}
                                                            onClick={() => toggleAvailability(p)}
                                                        >
                                                            {p.disponible ? 'Marcar como Agotado' : 'Marcar como Disponible'}
                                                        </Button>
                                                    )}
                                                    {isAdmin && (
                                                        <div className="d-flex gap-1 ms-2">
                                                            <Button variant="light" className="text-primary p-2 border-0 bg-transparent hover-bg-light" onClick={() => handleOpenModal(p)} title="Editar">
                                                                <i className="bi bi-pencil-square fs-5"></i>
                                                            </Button>
                                                            <Button variant="light" className="text-danger p-2 border-0 bg-transparent hover-bg-light" onClick={() => handleDelete(p.id, p.nombre)} title="Eliminar">
                                                                <i className="bi bi-trash3-fill fs-5"></i>
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        )}
                    </div>
                )}
            </Card>

            { }
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
                                    <Form.Label className="small fw-800 text-muted text-uppercase letter-spacing-1">Descripción y Detalles (Incluir Ingredientes)</Form.Label>
                                    <Form.Control
                                        required
                                        as="textarea"
                                        rows={3}
                                        className="premium-input bg-light border-0"
                                        placeholder="Ej: Pasta fresca con tomate San Marzano, mozzarella fior di latte..."
                                        value={formData.descripcion}
                                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label className="small fw-800 text-muted text-uppercase letter-spacing-1">Fotografía del Producto</Form.Label>
                                    <Form.Control
                                        type="file"
                                        accept="image/*"
                                        className="premium-input bg-light border-0"
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                            if (e.target.files && e.target.files.length > 0) {
                                                setImageFile(e.target.files[0]);
                                            }
                                        }}
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

