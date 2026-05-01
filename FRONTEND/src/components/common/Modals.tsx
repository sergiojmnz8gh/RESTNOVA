import { Modal, Button } from 'react-bootstrap';

import type { ModalProps } from '../../types/UITypes';

/**
 * Global Alert Modal for simple messages using React-Bootstrap.
 */
export const AlertModal: React.FC<Omit<ModalProps, 'onConfirm' | 'confirmText'>> = ({
    show,
    title,
    message,
    onClose,
    cancelText = 'Cerrar',
    variant = 'primary'
}) => (
    <Modal show={show} onHide={onClose} centered className="premium-modal">
        <Modal.Header closeButton className="border-0 pb-0">
            <Modal.Title className="brand-font fs-3 text-primary">{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-4">
            <p className="mb-0 text-muted">{message}</p>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
            <Button variant={variant} onClick={onClose} className="w-100 py-2 border-radius-12 brand-font">
                {cancelText}
            </Button>
        </Modal.Footer>
    </Modal>
);

/**
 * Global Confirm Modal for actions that require user confirmation using React-Bootstrap.
 */
export const ConfirmModal: React.FC<ModalProps> = ({
    show,
    title,
    message,
    onClose,
    onConfirm,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    variant = 'primary'
}) => (
    <Modal show={show} onHide={onClose} centered className="premium-modal">
        <Modal.Header closeButton className="border-0 pb-0">
            <Modal.Title className="brand-font fs-3 text-primary">{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-4">
            <p className="mb-0 text-muted">{message}</p>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0 d-flex gap-2">
            <Button variant="outline-secondary" onClick={onClose} className="flex-grow-1 py-2 border-radius-12 brand-font">
                {cancelText}
            </Button>
            <Button variant={variant} onClick={onConfirm} className="flex-grow-1 py-2 border-radius-12 brand-font">
                {confirmText}
            </Button>
        </Modal.Footer>
    </Modal>
);
