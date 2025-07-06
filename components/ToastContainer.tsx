import React from 'react';
import { useTemplate } from '../context/TemplateContext';
import Toast from './Toast';

const ToastContainer: React.FC = () => {
    const { toasts, removeToast } = useTemplate();

    return (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4 space-y-3">
            {toasts.map(toast => (
                <Toast key={toast.id} toast={toast} onDismiss={removeToast} />
            ))}
        </div>
    );
};

export default ToastContainer;