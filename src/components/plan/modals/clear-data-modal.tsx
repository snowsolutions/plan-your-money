import { useState, useEffect } from 'react';
import { useTranslation } from "@/hooks/use-translation";
import { AlertTriangle, Download, History } from 'lucide-react';
import { Button } from '../../ui/button';
import { AbstractModal } from '../../abstract-modal';

interface ClearDataModalProps {
    isOpen: boolean;
    onClose: () => void;
    onClear: () => void;
    onBackup: () => void;
}

export function ClearDataModal({ isOpen, onClose, onClear, onBackup }: ClearDataModalProps) {
    const { t } = useTranslation();
    const [isCountingDown, setIsCountingDown] = useState(false);
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        let timer: any;
        if (isCountingDown && countdown > 0) {
            timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
        } else if (isCountingDown && countdown === 0) {
            onClear();
            handleClose();
        }
        return () => clearTimeout(timer);
    }, [isCountingDown, countdown, onClear]);

    const handleClose = () => {
        setIsCountingDown(false);
        setCountdown(5);
        onClose();
    };

    const startClearProcess = () => {
        setIsCountingDown(true);
    };

    const cancelClearProcess = () => {
        setIsCountingDown(false);
        setCountdown(5);
    };

    return (
        <AbstractModal
            isOpen={isOpen}
            onClose={handleClose}
            title={t('modal.clear.title')}
            icon={<AlertTriangle size={20} className="text-rose-600" />}
            maxWidth="md"
            zIndex={400}
        >
            {!isCountingDown ? (
                <div className="space-y-6">
                    <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/10 text-rose-600 dark:text-rose-400">
                        <p className="text-sm leading-relaxed font-medium">
                            {t('modal.clear.warning')}
                        </p>
                    </div>

                    <div className="flex flex-col gap-3">
                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{t('modal.clear.recommendation')}</p>
                        <Button
                            variant="outline"
                            className="w-full justify-start gap-3 h-12 border-primary/20 hover:border-primary hover:bg-primary/5 group"
                            onClick={onBackup}
                        >
                            <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                                <Download size={16} />
                            </div>
                            <div className="flex flex-col items-start">
                                <span className="text-sm font-bold">{t('modal.clear.backup_action')}</span>
                                <span className="text-[10px] opacity-60">{t('modal.clear.backup_desc')}</span>
                            </div>
                        </Button>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button
                            variant="ghost"
                            className="flex-1 font-bold"
                            onClick={handleClose}
                        >
                            {t('common.cancel')}
                        </Button>
                        <Button
                            variant="destructive"
                            className="flex-1 font-bold shadow-lg shadow-rose-500/20"
                            onClick={startClearProcess}
                        >
                            {t('modal.clear.confirm')}
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center py-8">
                    <div className="relative w-32 h-32 flex items-center justify-center mb-8">
                        <svg className="absolute inset-0 w-full h-full -rotate-90">
                            <circle
                                cx="64"
                                cy="64"
                                r="60"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="8"
                                className="text-muted/10"
                            />
                            <circle
                                cx="64"
                                cy="64"
                                r="60"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="8"
                                strokeDasharray={377}
                                strokeDashoffset={377 - (377 * countdown) / 5}
                                className="text-rose-500 transition-all duration-1000 linear"
                            />
                        </svg>
                        <span className="text-4xl font-black text-rose-600 animate-pulse">{countdown}</span>
                    </div>

                    <h3 className="text-lg font-bold mb-2">{t('modal.clear.deleting')}</h3>
                    <p className="text-sm text-muted-foreground mb-8 text-center max-w-[240px]">
                        {t('modal.clear.deleting_desc')}
                    </p>

                    <Button
                        variant="outline"
                        className="w-full font-bold border-rose-200 hover:bg-rose-50 hover:text-rose-700 flex gap-2 items-center"
                        onClick={cancelClearProcess}
                    >
                        <History size={16} />
                        {t('modal.clear.abort')}
                    </Button>
                </div>
            )}
        </AbstractModal>
    );
}

