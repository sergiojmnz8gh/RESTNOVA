import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { Scanner } from '@yudiel/react-qr-scanner';
import { useUI } from '../context/UIContext';
import { mesaService } from '../services/mesaService';

export const CustomerQRScannerPage: React.FC = () => {
    const navigate = useNavigate();
    const { showToast } = useUI();
    const [token, setToken] = useState('');
    const [isValidating, setIsValidating] = useState(false);

    const handleValidateAndNavigate = async (tokenToValidate: string) => {
        if (tokenToValidate.length === 0) return;
        
        setIsValidating(true);
        try {
            await mesaService.obtenerSesionPorToken(tokenToValidate);
            navigate(`/pedido-cliente/${tokenToValidate}`);
        } catch (error) {
            showToast('Error', 'El código introducido no es válido o la sesión ha expirado.', 'danger');
        } finally {
            setIsValidating(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleValidateAndNavigate(token);
    };

    return (
        <Container className="py-5 fade-in min-vh-100 d-flex flex-column">
            <PageHeader 
                title="Conectar con Mesa" 
                description="Escanea el código QR de tu mesa o introduce el código manual para empezar a pedir."
            />

            <Row className="justify-content-center flex-grow-1 align-items-center">
                <Col lg={6} md={8}>
                    <Card className="border-0 shadow-premium overflow-hidden rounded-4 bg-white">
                        <Card.Body className="p-5 text-center">
                            
                            {}
                            <div className="position-relative mx-auto mb-5 rounded-4 overflow-hidden shadow-sm" style={{ width: '250px', height: '250px' }}>
                                <Scanner 
                                    onScan={(result) => {
                                        if (result && result.length > 0) {
                                            const scannedText = result[0].rawValue;
                                            
                                            
                                            const tokenMatch = scannedText.match(/([A-Z0-9]{6})$/i);
                                            if (tokenMatch) {
                                                handleValidateAndNavigate(tokenMatch[1].toUpperCase());
                                            } else {
                                                handleValidateAndNavigate(scannedText);
                                            }
                                        }
                                    }}
                                    onError={(error) => console.log(error)}
                                    formats={['qr_code']}
                                    components={{
                                        onOff: true,
                                        torch: false,
                                        zoom: false,
                                        finder: false
                                    }}
                                    styles={{
                                        container: { width: '100%', height: '100%' }
                                    }}
                                />
                                
                                {}
                                <div className="position-absolute top-0 start-0 w-100 h-100 pointer-events-none" style={{ pointerEvents: 'none' }}>
                                    <div className="position-absolute top-0 start-0 border-top border-start border-accent border-4 m-2" style={{ width: '30px', height: '30px' }}></div>
                                    <div className="position-absolute top-0 end-0 border-top border-end border-accent border-4 m-2" style={{ width: '30px', height: '30px' }}></div>
                                    <div className="position-absolute bottom-0 start-0 border-bottom border-start border-accent border-4 m-2" style={{ width: '30px', height: '30px' }}></div>
                                    <div className="position-absolute bottom-0 end-0 border-bottom border-end border-accent border-4 m-2" style={{ width: '30px', height: '30px' }}></div>
                                    <div className="scanner-line"></div>
                                </div>
                            </div>

                            <div className="d-flex align-items-center gap-3 mb-4 justify-content-center">
                                <div className="border-top border-2 flex-grow-1 opacity-25"></div>
                                <span className="text-muted fw-bold text-uppercase small">O introduce el código</span>
                                <div className="border-top border-2 flex-grow-1 opacity-25"></div>
                            </div>

                            {}
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-4">
                                    <Form.Control
                                        type="text"
                                        placeholder="CÓDIGO DE 6 DÍGITOS"
                                        className="bg-light border-accent border-2 text-center py-3 fs-4 fw-bold text-uppercase"
                                        style={{ letterSpacing: '8px' }}
                                        maxLength={6}
                                        value={token}
                                        onChange={(e) => setToken(e.target.value.toUpperCase())}
                                    />
                                </Form.Group>

                                <Button 
                                    variant="accent" 
                                    type="submit" 
                                    className="w-100 py-3 fw-bold fs-5 text-primary shadow-sm hover-lift"
                                    disabled={token.length === 0 || isValidating}
                                >
                                    {isValidating ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            VALIDANDO...
                                        </>
                                    ) : 'VINCULAR MESA'}
                                </Button>
                            </Form>
                            
                            <p className="mt-4 small text-muted mb-0">
                                <i className="bi bi-info-circle-fill me-2 text-accent"></i>
                                El personal de sala le entregará el código en su mesa en el restaurante.
                            </p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <style>{`
                .scanner-line {
                    position: absolute;
                    width: 100%;
                    height: 2px;
                    background: var(--color-accent);
                    box-shadow: 0 0 10px var(--color-accent);
                    animation: scan 2s infinite linear;
                    top: 0;
                    left: 0;
                }
                @keyframes scan {
                    0% { top: 0; }
                    50% { top: 100%; }
                    100% { top: 0; }
                }
            `}</style>
        </Container>
    );
};
