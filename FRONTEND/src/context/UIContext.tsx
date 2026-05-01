import React, { createContext, useContext, useState, type ReactNode } from 'react';
import { Toast, ToastContainer, Modal, Button } from 'react-bootstrap';
import type { ToastData, ConfirmModalData, UIContextType } from '../types/UITypes';

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
        const saved = localStorage.getItem('restnova_theme');
        return saved === 'dark';
    });

    const [toasts, setToasts] = useState<ToastData[]>([]);
    const [confirm, setConfirm] = useState<ConfirmModalData>({
        show: false,
        title: '',
        message: '',
        onConfirm: () => {},
    });

    const toggleDarkMode = () => {
        setIsDarkMode(prev => !prev);
    };

    // Aplicar el tema al documento
    React.useEffect(() => {
        if (isDarkMode) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('restnova_theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('restnova_theme', 'light');
        }
    }, [isDarkMode]);

    const showToast = (title: string, message: string, variant: ToastData['variant'] = 'success') => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, title, message, variant }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    };

    const showConfirm = (title: string, message: string, onConfirm: () => void, isDelete: boolean = false) => {
        setConfirm({ show: true, title, message, onConfirm, isDelete });
    };

    const handleConfirm = () => {
        confirm.onConfirm();
        setConfirm((prev) => ({ ...prev, show: false }));
    };

    const handleHideConfirm = () => {
        setConfirm((prev) => ({ ...prev, show: false }));
    };

    return (
        <UIContext.Provider value={{ showToast, showConfirm, isDarkMode, toggleDarkMode }}>
            {children}
            
            {/* Global Toast Container */}
            <ToastContainer position="top-center" className="p-3" style={{ zIndex: 2000 }}>
                {toasts.map((t) => (
                    <Toast key={t.id} bg={t.variant} autohide delay={3000} className="fade-in shadow-lg border-0 text-white">
                        <Toast.Header closeButton={false} className={`bg-${t.variant} text-white border-bottom-0`}>
                            <strong className="me-auto italic">{t.title.toUpperCase()}</strong>
                        </Toast.Header>
                        <Toast.Body className="fw-bold">{t.message}</Toast.Body>
                    </Toast>
                ))}
            </ToastContainer>

            {/* Global Confirmation Modal */}
            <Modal 
                show={confirm.show} 
                onHide={() => setConfirm((prev) => ({ ...prev, show: false }))}
                centered
                className="fade-in"
            >
                <Modal.Header closeButton className="border-0 px-4 pt-4">
                    <Modal.Title className="fw-bold fs-3 text-primary italic">{confirm.title.toUpperCase()}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="px-4 py-4">
                    <p className="mb-0 text-muted fw-bold">{confirm.message}</p>
                    {confirm.isDelete && (
                        <div className="mt-4 p-3 bg-danger bg-opacity-10 border border-danger border-opacity-10 rounded-4">
                            <small className="text-danger fw-bold d-flex align-items-center gap-2">
                                <i className="bi bi-exclamation-triangle-fill"></i>
                                ATENCIÓN: Acción irreversible.
                            </small>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer className="border-0 px-4 pb-4 justify-content-center gap-3">
                    <Button variant="light" className="px-4 py-2 fw-bold text-muted" onClick={() => setConfirm((prev) => ({ ...prev, show: false }))}>
                        CANCELAR
                    </Button>
                    <Button 
                        variant={confirm.isDelete ? 'danger' : 'primary'} 
                        className="px-5 py-2 fw-bold shadow-sm italic" 
                        onClick={handleConfirm}
                    >
                        {confirm.isDelete ? 'ELIMINAR' : 'CONFIRMAR'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </UIContext.Provider>
    );
};

export const useUI = () => {
    const context = useContext(UIContext);
    if (!context) throw new Error('useUI must be used within UIProvider');
    return context;
};
