import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/cn';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'info', duration: number = 5000) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);

        // Auto remove after specified duration
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);
    }, []);

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {/* Toast Container */}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none w-full max-w-sm">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={cn(
                            "pointer-events-auto flex items-start gap-4 p-4 rounded-2xl border shadow-2xl animate-in slide-in-from-right-full duration-300",
                            toast.type === 'success' && "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 backdrop-blur-md",
                            toast.type === 'error' && "bg-rose-500/10 border-rose-500/20 text-rose-500 backdrop-blur-md",
                            toast.type === 'warning' && "bg-amber-500/10 border-amber-500/20 text-amber-500 backdrop-blur-md",
                            toast.type === 'info' && "bg-primary/10 border-primary/20 text-primary backdrop-blur-md"
                        )}
                    >
                        <div className="mt-0.5">
                            {toast.type === 'success' && <CheckCircle2 size={18} />}
                            {toast.type === 'error' && <AlertCircle size={18} />}
                            {toast.type === 'warning' && <AlertTriangle size={18} />}
                            {toast.type === 'info' && <Info size={18} />}
                        </div>

                        <div className="flex-1 text-sm font-bold leading-tight">
                            {toast.message}
                        </div>

                        <button
                            onClick={() => removeToast(toast.id)}
                            className="p-1 hover:bg-black/5 rounded-lg transition-colors opacity-70 hover:opacity-100"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}
