import { ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface AbstractModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: ReactNode;
    subtitle?: ReactNode;
    icon?: ReactNode;
    children: ReactNode;
    footer?: ReactNode;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl';
    zIndex?: number;
    className?: string;
    bodyClassName?: string;
    headerClassName?: string;
    wrapperClassName?: string;
    onCloseAttempt?: () => void;
    showCloseButton?: boolean;
    actions?: ReactNode;
}

const maxWidthMap = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
};

export function AbstractModal({
    isOpen,
    onClose,
    title,
    subtitle,
    icon,
    children,
    footer,
    maxWidth = 'md',
    zIndex = 300,
    className,
    bodyClassName,
    headerClassName,
    wrapperClassName,
    onCloseAttempt,
    showCloseButton = true,
    actions,
}: AbstractModalProps) {
    if (!isOpen) return null;

    const handleClose = onCloseAttempt || onClose;

    return (
        <div
            className={cn(
                "fixed inset-0 flex bg-background/60 backdrop-blur-md animate-in fade-in duration-200",
                wrapperClassName || "items-center justify-center p-4"
            )}
            style={{ zIndex }}
            id="modal-overlay"
        >
            <div
                className={cn(
                    "w-full bg-card border border-white/10 shadow-2xl rounded-2xl overflow-hidden animate-in zoom-in-95 duration-200 relative flex flex-col max-h-[90vh]",
                    maxWidthMap[maxWidth],
                    className
                )}
            >
                {/* Header */}
                {(title || icon || showCloseButton) && (
                    <div className={cn("p-6 border-b border-white/5 flex items-center justify-between shrink-0 bg-card/50 backdrop-blur-xl", headerClassName)}>
                        <div className="flex items-center gap-3">
                            {icon && (
                                <div className="p-2 rounded-xl bg-primary/10 text-primary shadow-inner">
                                    {icon}
                                </div>
                            )}
                            <div>
                                {title && (
                                    typeof title === 'string'
                                        ? <h2 className="text-xl font-black tracking-tight">{title}</h2>
                                        : title
                                )}
                                {subtitle && <p className="text-[10px] uppercase font-black tracking-widest text-primary/60">{subtitle}</p>}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {actions}
                            {showCloseButton && (
                                <button
                                    onClick={handleClose}
                                    className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
                                >
                                    <X size={20} />
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Body */}
                <div className={cn("p-6 overflow-y-auto flex-1 custom-scrollbar", bodyClassName)}>
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="p-6 border-t border-white/5 bg-muted/10 shrink-0">
                        {footer}
                    </div>
                )}
            </div>

            {/* Backdrop click listener */}
            <div className="absolute inset-0 z-[-1]" onClick={handleClose} />
        </div>
    );
}
