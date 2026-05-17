export interface ToastData {
    id: number;
    title: string;
    message: string;
    variant: 'success' | 'danger' | 'warning' | 'info';
}

export interface ConfirmModalData {
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    isDelete?: boolean;
}

export interface UIContextType {
    showToast: (title: string, message: string, variant?: ToastData['variant']) => void;
    showConfirm: (title: string, message: string, onConfirm: () => void, isDelete?: boolean) => void;
    isDarkMode: boolean;
    isEffectiveDarkMode: boolean;
    toggleDarkMode: () => void;
}

export interface ToastProps {
    show: boolean;
    onClose: () => void;
    message: string;
    title?: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    delay?: number;
}

export interface ModalProps {
    show: boolean;
    title: string;
    message: string;
    onClose: () => void;
    onConfirm?: () => void;
    confirmText?: string;
    cancelText?: string;
    variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
}

