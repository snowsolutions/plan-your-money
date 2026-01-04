import React, { useState, useRef } from 'react';
import { useTranslation } from "@/hooks/use-translation";
import { Upload, FileText, CheckCircle2, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '../../ui/button';
import { AbstractModal } from '../../abstract-modal';

interface PlanImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onFileSelected: (file: File) => void;
}

export function PlanImportModal({ isOpen, onClose, onFileSelected }: PlanImportModalProps) {
    const { t } = useTranslation();
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [status, setStatus] = useState<'idle' | 'selected' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        if (status === 'success' && isOpen) {
            const timer = setTimeout(() => {
                handleClose();
            }, 10000);
            return () => clearTimeout(timer);
        }
    }, [status, isOpen]);

    const handleClose = () => {
        setStatus('idle');
        setSelectedFile(null);
        setErrorMessage("");
        onClose();
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && (file.name.endsWith('.fma') || file.name.endsWith('.efma'))) {
            setSelectedFile(file);
            setStatus('selected');
        } else {
            alert(t('modal.import.alert_invalid'));
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setStatus('selected');
        }
    };

    const handleConfirmImport = async () => {
        if (selectedFile) {
            try {
                await onFileSelected(selectedFile);
                setStatus('success');
            } catch (err: any) {
                setStatus('error');
                setErrorMessage(err.message || t('modal.import.error_generic'));
            }
        }
    };

    return (
        <AbstractModal
            isOpen={isOpen}
            onClose={handleClose}
            title={t('modal.import.title')}
            maxWidth="lg"
            zIndex={300}
        >
            {status === 'success' ? (
                <div className="border rounded-2xl p-10 flex flex-col items-center justify-center bg-emerald-500/5 animate-in zoom-in-95 duration-500">
                    <div className="w-20 h-20 rounded-full bg-emerald-500 text-white flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20">
                        <CheckCircle2 size={40} />
                    </div>
                    <h3 className="font-bold text-2xl mb-2 text-emerald-600 dark:text-emerald-400 text-center">{t('modal.import.success_title')}</h3>
                    <p className="text-sm text-center text-muted-foreground mb-8">
                        {t('modal.import.success_desc')}
                    </p>
                    <div className="w-full h-1 bg-emerald-500/10 rounded-full overflow-hidden relative">
                        <div className="absolute inset-y-0 left-0 bg-emerald-500 animate-[progress_10s_linear_forwards]" style={{ width: '100%' }} />
                    </div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mt-4 flex items-center gap-2">
                        {t('modal.import.auto_close')} <span className="font-bold text-emerald-600">...</span>
                    </p>
                    <Button
                        variant="outline"
                        className="mt-8 px-8 font-bold"
                        onClick={handleClose}
                    >
                        {t('common.done')}
                    </Button>
                </div>
            ) : status === 'error' ? (
                <div className="border rounded-2xl p-8 flex flex-col items-center justify-center bg-rose-500/5 animate-in slide-in-from-bottom-2 duration-300">
                    <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4 border border-rose-500/20">
                        <X size={32} />
                    </div>
                    <h3 className="font-bold text-lg mb-1 text-rose-600">{t('modal.import.failed_title')}</h3>
                    <p className="text-sm text-muted-foreground mb-8 text-center">{errorMessage || t('modal.import.invalid_format')}</p>

                    <Button
                        variant="outline"
                        className="w-full font-bold border-rose-200 hover:bg-rose-50"
                        onClick={() => setStatus('idle')}
                    >
                        {t('common.try_again')}
                    </Button>
                </div>
            ) : !selectedFile ? (
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={cn(
                        "relative border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-12 transition-all duration-300",
                        isDragging
                            ? "border-primary bg-primary/5 scale-[1.02] shadow-lg"
                            : "border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/30"
                    )}
                >
                    <div className={cn(
                        "p-4 rounded-full bg-primary/10 text-primary mb-4 transition-transform duration-300",
                        isDragging && "scale-110"
                    )}>
                        <Upload size={32} />
                    </div>
                    <p className="text-sm font-semibold mb-1">{t('modal.import.drag_drop')}</p>
                    <p className="text-xs text-muted-foreground mb-6 text-center max-w-[240px]">
                        {t('modal.import.drag_desc')}
                    </p>

                    <div className="flex items-center gap-4 w-full px-8">
                        <div className="h-px bg-border flex-1" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">{t('common.or')}</span>
                        <div className="h-px bg-border flex-1" />
                    </div>

                    <Button
                        variant="outline"
                        className="mt-6 font-bold"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {t('modal.import.upload_btn')}
                    </Button>

                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".fma,.efma"
                        onChange={handleFileChange}
                    />
                </div>
            ) : (
                <div className="border rounded-2xl p-8 flex flex-col items-center justify-center bg-primary/5 animate-in slide-in-from-bottom-2 duration-300">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4 border border-emerald-500/20">
                        <FileText size={32} />
                    </div>
                    <h3 className="font-bold text-lg mb-1">{selectedFile.name}</h3>
                    <p className="text-sm text-muted-foreground mb-8">{t('modal.import.ready')}</p>

                    <div className="flex gap-3 w-full">
                        <Button
                            variant="outline"
                            className="flex-1 font-bold"
                            onClick={() => {
                                setSelectedFile(null);
                                setStatus('idle');
                            }}
                        >
                            {t('modal.import.choose_different')}
                        </Button>
                        <Button
                            className="flex-1 font-bold shadow-lg shadow-primary/20"
                            onClick={handleConfirmImport}
                        >
                            {t('modal.import.start')}
                        </Button>
                    </div>
                </div>
            )}

            <div className="mt-6 flex items-start gap-3 p-4 rounded-xl bg-orange-500/5 border border-orange-500/10 text-orange-600 dark:text-orange-400">
                <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed">
                    <strong>{t('common.note')}:</strong> {t('modal.import.warning_note')}
                </p>
            </div>
        </AbstractModal>
    );
}

