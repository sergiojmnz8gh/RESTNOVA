import { Toast, ToastContainer } from 'react-bootstrap';

import type { ToastProps } from '../../types/UITypes';

/**
 * Global Toast component using React-Bootstrap.
 */
export const CustomToast: React.FC<ToastProps> = ({
    show,
    onClose,
    message,
    title,
    type = 'info',
    delay = 3000
}) => {
    const getVariant = () => {
        switch (type) {
            case 'success': return 'success';
            case 'error': return 'danger';
            case 'warning': return 'warning';
            default: return 'primary';
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'success': return 'bi-check-circle-fill';
            case 'error': return 'bi-exclamation-octagon-fill';
            case 'warning': return 'bi-exclamation-triangle-fill';
            default: return 'bi-info-circle-fill';
        }
    };

    return (
        <ToastContainer position="top-center" className="p-3" style={{ zIndex: 9999 }}>
            <Toast
                onClose={onClose}
                show={show}
                delay={delay}
                autohide
                className={`premium-toast border-0 shadow-lg toast-${type}`}
            >
                <Toast.Header className={`bg-${getVariant()} text-white border-0`}>
                    <i className={`bi ${getIcon()} me-2`}></i>
                    <strong className="me-auto brand-font">{title || type.charAt(0).toUpperCase() + type.slice(1)}</strong>
                </Toast.Header>
                <Toast.Body className="bg-white border-radius-12-bottom py-3 px-3 text-muted">
                    {message}
                </Toast.Body>
            </Toast>
        </ToastContainer>
    );
};

// Shorthand components
export const SuccessToast: React.FC<Omit<ToastProps, 'type'>> = (props) => <CustomToast {...props} type="success" title="¡Éxito!" />;
export const ErrorToast: React.FC<Omit<ToastProps, 'type'>> = (props) => <CustomToast {...props} type="error" title="Error" />;
export const WarningToast: React.FC<Omit<ToastProps, 'type'>> = (props) => <CustomToast {...props} type="warning" title="Atención" />;
