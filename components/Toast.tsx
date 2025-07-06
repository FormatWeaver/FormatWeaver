import React, { useEffect } from 'react';
import type { Toast as ToastType } from '../types';
import { CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XCircleIcon } from './Icons';

interface ToastProps {
    toast: ToastType;
    onDismiss: (id: string) => void;
}

const ICONS: Record<ToastType['type'], React.FC<{className?: string}>> = {
    success: CheckCircleIcon,
    error: ExclamationTriangleIcon,
    info: InformationCircleIcon
};

const COLORS: Record<ToastType['type'], { bg: string, text: string, icon: string }> = {
    success: { bg: 'bg-green-500/20 dark:bg-green-500/10', text: 'text-green-800 dark:text-green-300', icon: 'text-green-500' },
    error: { bg: 'bg-red-500/20 dark:bg-red-500/10', text: 'text-red-800 dark:text-red-300', icon: 'text-red-500' },
    info: { bg: 'bg-sky-500/20 dark:bg-sky-500/10', text: 'text-sky-800 dark:text-sky-300', icon: 'text-sky-500' },
};


const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss(toast.id);
        }, 5000); // Auto-dismiss after 5 seconds

        return () => {
            clearTimeout(timer);
        };
    }, [toast.id, onDismiss]);

    const Icon = ICONS[toast.type];
    const color = COLORS[toast.type];

    return (
        <div 
            className={`flex items-center gap-4 w-full max-w-sm p-4 rounded-xl shadow-lg border border-black/10 dark:border-white/10 ${color.bg} animate-toast backdrop-blur-sm`}
            role="alert"
        >
            <div className="flex-shrink-0">
                <Icon className={`w-6 h-6 ${color.icon}`} />
            </div>
            <div className={`flex-grow text-sm font-semibold ${color.text}`}>
                {toast.message}
            </div>
            <div className="flex-shrink-0">
                <button 
                    onClick={() => onDismiss(toast.id)} 
                    className={`p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors ${color.text}`}
                    aria-label="Dismiss"
                >
                    <XCircleIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default Toast;