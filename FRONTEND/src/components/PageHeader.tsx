import React from 'react';
import { Button } from 'react-bootstrap';

interface PageHeaderProps {
    title: string;
    description: string;
    action?: {
        label: string;
        icon: string;
        onClick: () => void;
        variant?: string;
    };
    children?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, description, action, children }) => {
    return (
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-4">
            <div className="fade-in">
                <h1 className="display-4 fw-black mb-2 text-primary" style={{ letterSpacing: '-3px' }}>{title.toUpperCase()}</h1>
                <div className="d-flex align-items-center gap-3">
                    <div className="bg-accent" style={{ width: '40px', height: '2px' }}></div>
                    <p className="text-muted mb-0 fw-medium text-uppercase tracking-widest small">{description}</p>
                </div>
            </div>
            <div className="d-flex align-items-center gap-3">
                {children}
                {action && (
                    <Button 
                        variant={action.variant || "primary"} 
                        className="btn-primary shadow-lg border-0" 
                        onClick={action.onClick}
                    >
                        <i className={`bi bi-${action.icon} me-2`}></i> {action.label.toUpperCase()}
                    </Button>
                )}
            </div>
        </div>
    );
};

