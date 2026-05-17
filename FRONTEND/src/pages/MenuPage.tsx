import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { productoService } from '../services/productoService';

export const MenuPage: React.FC = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [topProductIds, setTopProductIds] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [prods, cats, topProds] = await Promise.all([
                    productoService.listarTodos(),
                    productoService.listarCategorias(),
                    productoService.obtenerTop().catch(() => [])
                ]);
                setProducts(prods);
                setCategories(cats);
                setTopProductIds(topProds.map((p: any) => p.id));
            } catch (error) {
                console.error("Error loading menu", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    useEffect(() => {
        document.body.classList.add('force-light-theme');
        return () => {
            document.body.classList.remove('force-light-theme');
        };
    }, []);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100 bg-primary">
                <Spinner animation="border" className="text-accent" style={{ width: '4rem', height: '4rem' }} />
            </div>
        );
    }

    return (
        <div className="menu-page min-vh-100 bg-white" data-theme="light">
            <Navbar transparentInitially={true} />

            {}
            <section 
                className="menu-hero py-5 position-relative overflow-hidden"
                style={{
                    backgroundColor: 'var(--color-primary)',
                    backgroundImage: `linear-gradient(rgba(4, 8, 51, 0.6), rgba(4, 8, 51, 0.9)), url('/restaurant_interior.png')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    minHeight: '45vh',
                    display: 'flex',
                    alignItems: 'center',
                    paddingTop: '120px'
                }}
            >
                <div className="position-absolute w-100 h-100" style={{ background: 'radial-gradient(circle at center, transparent 0%, rgba(4,8,51,0.4) 100%)' }}></div>
                <Container className="position-relative z-index-1 text-center py-5">
                    <div className="fade-in">
                        <div className="d-flex align-items-center justify-content-center gap-3 mb-3">
                            <div className="bg-accent" style={{ width: '30px', height: '1px' }}></div>
                            <span className="text-white fw-bold text-uppercase tracking-widest small" style={{ letterSpacing: '4px' }}>Gastronomía de Autor</span>
                            <div className="bg-accent" style={{ width: '30px', height: '1px' }}></div>
                        </div>
                        <h1 className="display-1 fw-bold text-accent mb-0" style={{ letterSpacing: '-2px' }}>NUESTRA CARTA</h1>
                        <p className="lead text-white opacity-50 mt-3 fw-light text-uppercase tracking-widest" style={{ fontSize: '0.9rem' }}>Un viaje sensorial a través de la tradición mediterránea</p>
                    </div>
                </Container>
            </section>

            <Container className="py-5 mt-4">
                {categories.map((cat, catIdx) => {
                    const catProducts = products
                        .filter(p => p.categoria && p.categoria.id === cat.id)
                        .sort((a, b) => {
                            if (a.disponible === b.disponible) return 0;
                            return a.disponible ? 1 : -1;
                        });
                    if (catProducts.length === 0) return null;

                    return (
                        <div key={cat.id} className="mb-5 pb-5 fade-in" style={{ animationDelay: `${catIdx * 0.1}s` }}>
                            <div className="text-center mb-5">
                                <h2 className="display-5 fw-bold text-primary text-uppercase mb-2" style={{ letterSpacing: '5px' }}>{cat.nombre}</h2>
                                <div className="d-flex align-items-center justify-content-center gap-2 mb-4">
                                    <div className="bg-accent" style={{ width: '20px', height: '2px' }}></div>
                                    <div className="bg-accent opacity-50" style={{ width: '10px', height: '2px' }}></div>
                                    <div className="bg-accent opacity-25" style={{ width: '5px', height: '2px' }}></div>
                                </div>
                            </div>
                            
                             <Row className="g-5">
                                {catProducts.map(p => {
                                    const isTop3 = topProductIds.slice(0, 3).includes(p.id);
                                    return (
                                        <Col key={p.id} xs={12} md={6}>
                                            <div 
                                                className="menu-item-elegant d-flex gap-4 pb-5 border-bottom border-light align-items-start transition-all h-100 position-relative"
                                                style={{ filter: p.disponible ? 'none' : 'grayscale(50%) opacity(0.7)' }}
                                            >
                                                <div className="flex-shrink-0" style={{ width: '140px', height: '140px' }}>
                                                    <img 
                                                        src={`/productos/${p.id}.png`} 
                                                        alt={p.nombre}
                                                        className="w-100 h-100 object-fit-cover rounded-circle shadow-sm border border-light p-1 bg-white"
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement;
                                                            target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=300&auto=format&fit=crop';
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex-grow-1 pt-2">
                                                    <div className="d-flex align-items-center gap-2 mb-3">
                                                        <h4 className="fw-bold text-primary mb-0 text-uppercase fs-5" style={{ letterSpacing: '1px' }}>{p.nombre}</h4>
                                                        {!p.disponible ? (
                                                            <span className="badge bg-danger text-white px-3 py-1 tiny shadow-sm fw-bold rounded-pill">
                                                                <i className="bi bi-slash-circle me-1"></i> AGOTADO
                                                            </span>
                                                        ) : isTop3 && (
                                                            <span className="badge bg-accent text-primary px-3 py-1 tiny shadow-sm fw-bold rounded-pill">
                                                                <i className="bi bi-fire-fill me-1 text-danger"></i> TOP VENTAS
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-secondary mb-3 lh-sm small pe-4" style={{ fontWeight: '600', minHeight: '3em', color: 'var(--color-text-muted)' }}>
                                                        {p.descripcion || "Una creación magistral preparada con técnicas tradicionales y vanguardistas."}
                                                    </p>
                                                    <div className="fw-bold text-primary fs-4">{p.precio.toFixed(2)}€</div>
                                                </div>
                                            </div>
                                        </Col>
                                    );
                                })}
                            </Row>
                        </div>
                    );
                })}
            </Container>

            <Footer />

            <style>{`
                .menu-item-elegant:hover {
                    background-color: rgba(231, 158, 10, 0.02);
                    padding-left: 10px;
                }
                .menu-item-elegant img {
                    transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
                }
                .menu-item-elegant:hover img {
                    transform: scale(1.05) rotate(5deg);
                    border-color: var(--color-accent) !important;
                }
            `}</style>
        </div>
    );
};
