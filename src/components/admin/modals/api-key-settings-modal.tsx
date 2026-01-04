import { useState } from "react";
import { Key, ShieldCheck, Database, Check } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { OpenAIApiKeySource } from "@/utils/preferences-schema";
import { cn } from "@/utils/cn";
import { AbstractModal } from "../../abstract-modal";

interface APIKeySettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentSource: OpenAIApiKeySource;
    onSave: (source: OpenAIApiKeySource) => void;
}

export function APIKeySettingsModal({ isOpen, onClose, currentSource, onSave }: APIKeySettingsModalProps) {
    const { t } = useTranslation();
    const [selectedSource, setSelectedSource] = useState<OpenAIApiKeySource>(currentSource);

    const sources: { id: OpenAIApiKeySource, label: string, icon: any }[] = [
        { id: 'VITE_OPENAI_API_KEY', label: t('admin.modal.apikey.key_default'), icon: Key },
        { id: 'VITE_OPENAI_API_KEY_BACKUP_1', label: t('admin.modal.apikey.key_backup_1'), icon: Database },
        { id: 'VITE_OPENAI_API_KEY_BACKUP_2', label: t('admin.modal.apikey.key_backup_2'), icon: Database },
        { id: 'VITE_OPENAI_API_KEY_BACKUP_3', label: t('admin.modal.apikey.key_backup_3'), icon: Database },
    ];

    const handleSave = () => {
        onSave(selectedSource);
        onClose();
    };

    const footer = (
        <div className="flex gap-3 w-full">
            <button
                onClick={handleSave}
                className="flex-1 py-4 bg-primary text-primary-foreground rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-primary/20"
            >
                {t('admin.modal.apikey.save')}
            </button>
            <button
                onClick={onClose}
                className="px-8 py-4 bg-muted hover:bg-muted/80 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
            >
                {t('admin.modal.models.dismiss')}
            </button>
        </div>
    );

    return (
        <AbstractModal
            isOpen={isOpen}
            onClose={onClose}
            title={t('admin.modal.apikey.title')}
            subtitle="System Security"
            icon={<ShieldCheck size={24} />}
            maxWidth="lg"
            zIndex={300}
            footer={footer}
        >
            <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
                {t('admin.modal.apikey.description')}
            </p>

            <div className="space-y-3">
                <label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60 px-2">
                    {t('admin.modal.apikey.select_label')}
                </label>
                <div className="grid gap-2">
                    {sources.map((source) => {
                        const Icon = source.icon;
                        const isSelected = selectedSource === source.id;
                        return (
                            <button
                                key={source.id}
                                onClick={() => setSelectedSource(source.id)}
                                className={cn(
                                    "flex items-center justify-between p-4 rounded-2xl border transition-all text-left group",
                                    isSelected
                                        ? "bg-primary/5 border-primary/30 text-primary shadow-lg shadow-primary/5"
                                        : "bg-muted/20 border-white/5 hover:bg-muted/40 hover:border-white/10"
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                                        isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-muted/60"
                                    )}>
                                        <Icon size={18} />
                                    </div>
                                    <span className="font-bold tracking-tight">{source.label}</span>
                                </div>
                                {isSelected && (
                                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-md">
                                        <Check size={14} />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </AbstractModal>
    );
}

