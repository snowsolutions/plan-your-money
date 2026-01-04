import { AlertTriangle } from 'lucide-react';
import { Button } from '../../ui/button';
import { useTranslation } from "@/hooks/use-translation";
import { AbstractModal } from '../../abstract-modal';

interface ImportWarningModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export function ImportWarningModal({ isOpen, onClose, onConfirm }: ImportWarningModalProps) {
    const { t } = useTranslation();

    const footer = (
        <div className="flex gap-3 w-full">
            <Button
                variant="outline"
                className="flex-1"
                onClick={onClose}
            >
                {t('modal.warning.cancel')}
            </Button>
            <Button
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white border-0"
                onClick={onConfirm}
            >
                {t('modal.warning.override')}
            </Button>
        </div>
    );

    return (
        <AbstractModal
            isOpen={isOpen}
            onClose={onClose}
            title={t('modal.warning.title')}
            subtitle={t('modal.warning.subtitle')}
            icon={<AlertTriangle size={20} className="text-rose-500" />}
            maxWidth="md"
            footer={footer}
        >
            <div className="bg-muted/30 p-4 rounded-xl border text-sm text-muted-foreground leading-relaxed">
                {t('modal.warning.message')}
            </div>
        </AbstractModal>
    );
}

