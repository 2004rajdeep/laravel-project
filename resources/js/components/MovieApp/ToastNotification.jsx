import { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
};

const colors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
};

export function ToastNotification({ toasts, onDismiss }) {
    return (
        <div
            className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"
            role="region"
            aria-label="Notifications"
            aria-live="polite"
        >
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-lg border shadow-lg min-w-[300px] max-w-md animate-slide-in ${colors[toast.type] || colors.info}`}
                    role="alert"
                >
                    <div className="flex-shrink-0 mt-0.5">
                        {(() => {
                            const Icon = icons[toast.type] || icons.info;
                            return <Icon className="h-5 w-5" aria-hidden="true" />;
                        })()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{toast.message}</p>
                    </div>
                    <button
                        onClick={() => onDismiss(toast.id)}
                        className="flex-shrink-0 text-current opacity-50 hover:opacity-100 transition-opacity p-1"
                        aria-label="Dismiss notification"
                    >
                        <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                </div>
            ))}
        </div>
    );
}

export function useToast() {
    const [toasts, setToasts] = useState([]);

    const addToast = (message, type = 'info', duration = 4000) => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type }]);

        if (duration > 0) {
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, duration);
        }
    };

    const dismiss = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const success = (message) => addToast(message, 'success');
    const error = (message) => addToast(message, 'error');
    const info = (message) => addToast(message, 'info');

    return { toasts, dismiss, success, error, info, addToast };
}