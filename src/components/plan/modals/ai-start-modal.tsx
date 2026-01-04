import { useState } from 'react';
import { useTranslation } from "@/hooks/use-translation";
import { Sparkles, Brain } from 'lucide-react';
import { Button } from '../../ui/button';
import { cn } from '@/utils/cn';
import { AbstractModal } from '../../abstract-modal';

export interface AIStartModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGenerate: (instruction: string) => Promise<void>;
}

export function AIStartModal({ isOpen, onClose, onGenerate }: AIStartModalProps) {
    const { t } = useTranslation();
    const [instruction, setInstruction] = useState("");
    const [status, setStatus] = useState<'editing' | 'confirm_discard' | 'loading' | 'completed'>('editing');

    const handleCloseAttempt = () => {
        if (status === 'completed') {
            resetAndClose();
            return;
        }

        if (instruction.trim().length > 0) {
            setStatus('confirm_discard');
        } else {
            resetAndClose();
        }
    };

    const resetAndClose = () => {
        setInstruction("");
        setStatus('editing');
        onClose();
    };

    const handleSubmit = async () => {
        if (!instruction.trim()) return;

        setStatus('loading');
        try {
            await onGenerate(instruction);
            setStatus('completed');
        } catch (error) {
            console.error(error);
            setStatus('editing'); // Go back to editing on error
            alert(`Error generating plan: ${(error as Error).message}`);
        }
    };

    const footer = status === 'editing' ? (
        <div className="flex justify-end gap-3 w-full">
            <Button
                variant="ghost"
                onClick={handleCloseAttempt}
            >
                {t('modal.ai.cancel')}
            </Button>
            <Button
                onClick={handleSubmit}
                disabled={!instruction.trim()}
                className={cn(
                    "font-bold transition-all",
                    instruction.trim()
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20"
                        : "opacity-50 cursor-not-allowed"
                )}
            >
                <Sparkles size={16} className="mr-2" />
                {t('modal.ai.generate')}
            </Button>
        </div>
    ) : null;

    return (
        <AbstractModal
            isOpen={isOpen}
            onClose={onClose}
            onCloseAttempt={handleCloseAttempt}
            title={t('modal.ai.title')}
            subtitle={t('modal.ai.subtitle')}
            icon={<Brain size={20} />}
            maxWidth="2xl"
            footer={footer}
        >
            {status === 'editing' && (
                <div className="flex-1 flex flex-col gap-4">
                    <div className="bg-muted/30 p-4 rounded-xl text-sm text-muted-foreground border border-dashed border-muted-foreground/20">
                        <strong className="text-foreground block mb-1">{t('modal.ai.tip')}</strong>
                        {t('modal.ai.tip_content')}
                    </div>
                    <textarea
                        value={instruction}
                        onChange={(e) => setInstruction(e.target.value)}
                        placeholder={t('modal.ai.placeholder')}
                        className="flex-1 w-full min-h-[200px] p-4 rounded-xl bg-background border resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium leading-relaxed"
                        autoFocus
                    />
                </div>
            )}

            {status === 'loading' && (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 animate-in fade-in duration-200">
                    <div className="w-16 h-16 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin mb-6" />
                    <h3 className="text-lg font-bold mb-2">{t('modal.ai.generating')}</h3>
                    <p className="text-muted-foreground max-w-xs">
                        {t('modal.ai.generating_desc')}
                    </p>
                </div>
            )}

            {status === 'confirm_discard' && (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 animate-in fade-in duration-200">
                    <h3 className="text-lg font-bold mb-2">{t('modal.ai.discard.title')}</h3>
                    <p className="text-muted-foreground mb-8 max-w-xs">
                        {t('modal.ai.discard.message')}
                    </p>
                    <div className="flex gap-3 w-full max-w-xs mx-auto">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => setStatus('editing')}
                        >
                            {t('modal.ai.keep_editing')}
                        </Button>
                        <Button
                            variant="destructive"
                            className="flex-1"
                            onClick={resetAndClose}
                        >
                            {t('modal.ai.discard')}
                        </Button>
                    </div>
                </div>
            )}

            {status === 'completed' && (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 animate-in fade-in zoom-in-95 duration-300">
                    <div className="w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20">
                        <Sparkles size={40} />
                    </div>
                    <h3 className="text-2xl font-bold mb-2 text-emerald-600">{t('modal.ai.completed')}</h3>
                    <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                        {t('modal.ai.success_message')}
                    </p>
                    <Button
                        className="px-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                        onClick={resetAndClose}
                    >
                        {t('modal.ai.close')}
                    </Button>
                </div>
            )}
        </AbstractModal>
    );
}

