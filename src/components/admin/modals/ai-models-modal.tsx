import { useState, useEffect, useMemo } from "react";
import { getSupportedAIModels } from "@/services/ai-service";
import { Loader2, Cpu, Calendar, User, Check, MousePointer2, Search, ArrowUpDown, ChevronUp, ChevronDown } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/utils/cn";
import { AbstractModal } from "../../abstract-modal";

interface AIModelsModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentModel: string;
    onSelect: (modelId: string) => void;
}

type SortField = 'id' | 'created';
type SortOrder = 'asc' | 'desc';

export function AIModelsModal({ isOpen, onClose, currentModel, onSelect }: AIModelsModalProps) {
    const { t } = useTranslation();
    const [models, setModels] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortField, setSortField] = useState<SortField>('id');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

    useEffect(() => {
        if (isOpen) {
            const fetchModels = async () => {
                setIsLoading(true);
                setError(null);
                try {
                    const data = await getSupportedAIModels();
                    setModels(data);
                } catch (err: any) {
                    setError(err.message || "Failed to fetch models");
                } finally {
                    setIsLoading(false);
                }
            };
            fetchModels();
        } else {
            // Reset filters when closing
            setSearchQuery("");
            setSortField('id');
            setSortOrder('asc');
        }
    }, [isOpen]);

    const filteredAndSortedModels = useMemo(() => {
        // 1. Filter
        let result = models.filter(m =>
            m.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.owned_by.toLowerCase().includes(searchQuery.toLowerCase())
        );

        // 2. Sort
        result.sort((a, b) => {
            // Current model always on top
            const isASelected = a.id === currentModel;
            const isBSelected = b.id === currentModel;

            if (isASelected && !isBSelected) return -1;
            if (!isASelected && isBSelected) return 1;

            // Follow sort settings for the rest
            let comparison = 0;
            if (sortField === 'id') {
                comparison = a.id.localeCompare(b.id);
            } else if (sortField === 'created') {
                comparison = a.created - b.created;
            }

            return sortOrder === 'asc' ? comparison : -comparison;
        });

        return result;
    }, [models, searchQuery, sortField, sortOrder, currentModel]);

    const toggleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) return <ArrowUpDown size={12} className="opacity-30 group-hover:opacity-100 transition-opacity" />;
        return sortOrder === 'asc' ? <ChevronUp size={12} className="text-primary" /> : <ChevronDown size={12} className="text-primary" />;
    };

    const actions = (
        <div className="relative group mr-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('admin.modal.models.search')}
                className="pl-10 pr-4 py-2 bg-muted/20 border border-white/5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-muted/40 transition-all w-64"
            />
        </div>
    );

    return (
        <AbstractModal
            isOpen={isOpen}
            onClose={onClose}
            title={t('admin.modal.models.title')}
            subtitle={t('admin.modal.models.tag')}
            icon={<Cpu size={20} />}
            actions={actions}
            maxWidth="5xl"
            bodyClassName="p-0 flex flex-col min-h-[400px]"
        >
            <div className="flex-1 overflow-hidden relative flex flex-col">
                {isLoading && (
                    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="relative">
                            <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                            <Loader2 size={24} className="absolute inset-0 m-auto text-primary animate-pulse" />
                        </div>
                        <p className="mt-6 text-sm font-bold tracking-widest uppercase opacity-50 animate-pulse">{t('admin.modal.models.loading')}</p>
                    </div>
                )}

                {error ? (
                    <div className="p-12 text-center flex-1 flex flex-col items-center justify-center">
                        <div className="w-20 h-20 rounded-full bg-rose-500/10 flex items-center justify-center mb-6 text-rose-500 shadow-lg shadow-rose-500/10">
                            <span className="text-3xl font-black">!</span>
                        </div>
                        <h3 className="text-xl font-black mb-2">{t('admin.modal.models.error_title')}</h3>
                        <p className="text-muted-foreground max-w-sm mx-auto mb-8 font-medium">{error}</p>
                        <button
                            onClick={onClose}
                            className="px-8 py-3 bg-primary text-primary-foreground rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-primary/20"
                        >
                            {t('admin.modal.models.dismiss')}
                        </button>
                    </div>
                ) : (
                    <div className="overflow-y-auto custom-scrollbar flex-1 px-6 pb-6">
                        <table className="w-full text-sm text-left border-separate border-spacing-y-2">
                            <thead className="sticky top-0 bg-card z-20">
                                <tr className="text-[10px] uppercase tracking-widest font-black text-muted-foreground/60 bg-card">
                                    <th
                                        className="px-6 py-4 cursor-pointer hover:text-foreground group transition-colors"
                                        onClick={() => toggleSort('id')}
                                    >
                                        <div className="flex items-center gap-2">
                                            {t('admin.modal.models.col_id')}
                                            <SortIcon field="id" />
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-center">{t('admin.modal.models.col_owner')}</th>
                                    <th
                                        className="px-6 py-4 text-center cursor-pointer hover:text-foreground group transition-colors"
                                        onClick={() => toggleSort('created')}
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            {t('admin.modal.models.col_date')}
                                            <SortIcon field="created" />
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-right">{t('admin.modal.models.col_action')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAndSortedModels.map((model) => {
                                    const isSelected = model.id === currentModel;
                                    return (
                                        <tr key={model.id} className={cn("group transition-all", isSelected && "opacity-100")}>
                                            <td className={cn(
                                                "px-6 py-5 bg-muted/20 group-hover:bg-muted/40 rounded-l-2xl border-y border-l border-white/5",
                                                isSelected && "bg-primary/5 border-primary/20"
                                            )}>
                                                <div className="flex items-center gap-4">
                                                    <div className={cn(
                                                        "w-2.5 h-2.5 rounded-full transition-colors",
                                                        isSelected ? "bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]" : "bg-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.3)] group-hover:bg-emerald-500"
                                                    )} />
                                                    <span className={cn("font-bold tracking-tight text-base", isSelected && "text-primary")}>{model.id}</span>
                                                </div>
                                            </td>
                                            <td className={cn(
                                                "px-6 py-5 bg-muted/20 group-hover:bg-muted/40 border-y border-white/5 text-center",
                                                isSelected && "bg-primary/5 border-primary/20"
                                            )}>
                                                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/5 text-primary text-[10px] font-black uppercase tracking-wider">
                                                    <User size={12} />
                                                    {model.owned_by}
                                                </div>
                                            </td>
                                            <td className={cn(
                                                "px-6 py-5 bg-muted/20 group-hover:bg-muted/40 border-y border-white/5 text-center font-mono text-xs opacity-60",
                                                isSelected && "bg-primary/5 border-primary/20 opacity-100"
                                            )}>
                                                <div className="flex items-center justify-center gap-2 font-bold tracking-widest">
                                                    <Calendar size={14} className="opacity-40" />
                                                    {new Date(model.created * 1000).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className={cn(
                                                "px-6 py-5 bg-muted/20 group-hover:bg-muted/40 rounded-r-2xl border-y border-r border-white/5 text-right",
                                                isSelected && "bg-primary/5 border-primary/20"
                                            )}>
                                                {isSelected ? (
                                                    <div className="flex items-center justify-end gap-2 text-primary font-black text-[10px] uppercase tracking-widest">
                                                        <Check size={16} />
                                                        {t('admin.modal.models.status_active')}
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => onSelect(model.id)}
                                                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary hover:text-primary-foreground text-primary rounded-xl transition-all font-black text-[10px] uppercase tracking-widest shadow-sm"
                                                    >
                                                        <MousePointer2 size={14} />
                                                        {t('admin.modal.models.action_select')}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AbstractModal>
    );
}

