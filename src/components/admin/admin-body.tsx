import { useState } from "react";
import { Card } from "../ui/card";
import { Cpu, Eye, ExternalLink, ShieldCheck, Key } from "lucide-react";
import { AIModelsModal } from "./modals/ai-models-modal";
import { APIKeySettingsModal } from "./modals/api-key-settings-modal";
import { useTranslation } from "@/hooks/use-translation";
import { OpenAIApiKeySource } from "@/utils/preferences-schema";
import { useToast } from "@/hooks/use-toast";

interface AdminBodyProps {
    currentModel: string;
    onModelChange: (model: string) => void;
    currentApiKeySource: OpenAIApiKeySource;
    onApiKeySourceChange: (source: OpenAIApiKeySource) => void;
}

export function AdminBody({
    currentModel,
    onModelChange,
    currentApiKeySource,
    onApiKeySourceChange
}: AdminBodyProps) {
    const { t } = useTranslation();
    const { showToast } = useToast();
    const [isModelsModalOpen, setIsModelsModalOpen] = useState(false);
    const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

    return (
        <main className="admin-body-container px-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="admin-content-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* AI Management Card */}
                <Card className="admin-ai-management-card p-1 relative overflow-hidden border-white/5 bg-card/40 backdrop-blur-md shadow-2xl transition-all">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl transition-colors" />

                    <div className="admin-card-inner p-6 flex flex-col h-full">
                        <div className="admin-card-header flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary transition-transform duration-500">
                                <Cpu size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black tracking-tight">{t('admin.ai.title')}</h2>
                                <p className="text-[10px] uppercase font-black tracking-widest text-primary/60">{t('admin.ai.tag')}</p>
                            </div>
                        </div>

                        <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
                            {t('admin.ai.description')}
                        </p>

                        <div className="admin-card-actions mt-auto flex flex-col gap-3">
                            <button
                                onClick={() => setIsModelsModalOpen(true)}
                                className="w-full flex items-center justify-between px-5 py-3.5 bg-primary text-primary-foreground rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all group/btn"
                            >
                                <span className="flex items-center gap-2">
                                    <Eye size={16} />
                                    {t('admin.ai.view_models')}
                                </span>
                                <ExternalLink size={14} className="opacity-50 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                            </button>

                            <button
                                onClick={() => setIsApiKeyModalOpen(true)}
                                className="w-full flex items-center justify-between px-5 py-3.5 bg-muted hover:bg-muted/80 text-foreground rounded-2xl font-black text-xs uppercase tracking-widest transition-all group/btn"
                            >
                                <span className="flex items-center gap-2">
                                    <Key size={16} className="text-primary" />
                                    {t('admin.ai.change_api_key')}
                                </span>
                                <ExternalLink size={14} className="opacity-50 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                            </button>

                            <div className="status-badge flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider">
                                <ShieldCheck size={14} />
                                {t('admin.ai.api_configured')}
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            <AIModelsModal
                isOpen={isModelsModalOpen}
                onClose={() => setIsModelsModalOpen(false)}
                currentModel={currentModel}
                onSelect={onModelChange}
            />

            <APIKeySettingsModal
                isOpen={isApiKeyModalOpen}
                onClose={() => setIsApiKeyModalOpen(false)}
                currentSource={currentApiKeySource}
                onSave={(source) => {
                    onApiKeySourceChange(source);
                    showToast(t('admin.modal.apikey.success'), 'success', 3000);
                    setTimeout(() => {
                        window.location.reload();
                    }, 3000);
                }}
            />
        </main>
    );
}
