import { useState } from 'react';
import { useTranslation } from "@/hooks/use-translation";
import { AbstractHeading } from '../abstract-heading';
import { Card } from '../ui/card';
import { Select } from '../ui/select';
import { formatCurrency } from '@/utils/format';
import { LayoutGrid, Brain } from 'lucide-react';
import { PlanFunctionModal } from './modals/plan-function-modal';
import { AIStartModal } from './modals/ai-start-modal';
import { Button } from '../ui/button';

interface PlanHeadingProps {
    selectedYear: number;
    setSelectedYear: (year: number) => void;
    years: number[];
    yearlyIncome: number;
    yearlyExpenses: number;
    savings: number;
    viewMode: 'vertical' | 'horizontal';
    setViewMode: (mode: 'vertical' | 'horizontal') => void;
    currencySymbol: string;
    onImport: () => void;
    onExport: () => void;
    onClear: () => void;
    onSample: () => void;
    onGenerate: (instruction: string) => Promise<void>;
    onViewDashboard: () => void;
}

export function PlanHeading({
    selectedYear,
    setSelectedYear,
    years,
    yearlyIncome,
    yearlyExpenses,
    savings,
    viewMode,
    setViewMode,
    currencySymbol,
    onImport,
    onExport,
    onClear,
    onSample,
    onGenerate,
    onViewDashboard
}: PlanHeadingProps) {
    const { t } = useTranslation();
    const [isFunctionModalOpen, setIsFunctionModalOpen] = useState(false);
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);

    const summary = (
        <Card className="plan-summary-card flex items-center gap-4 px-4 py-2 bg-card/40 backdrop-blur-sm border-primary/10 shadow-sm w-fit">
            <div className="flex flex-col gap-0.5 min-w-[140px]">
                <div className="flex justify-between items-center gap-4">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{t('heading.yearly_income')}</span>
                    <span className="text-[11px] font-bold text-emerald-600 leading-tight">{formatCurrency(yearlyIncome, currencySymbol)}</span>
                </div>
                <div className="flex justify-between items-center gap-4">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{t('heading.yearly_expenses')}</span>
                    <span className="text-[11px] font-bold text-rose-600 leading-tight">{formatCurrency(yearlyExpenses, currencySymbol)}</span>
                </div>
                <div className="flex justify-between items-center gap-4 pt-0.5 border-t border-primary/5">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{t('heading.net_savings')}</span>
                    <span className={`text-[11px] font-black leading-tight ${savings >= 0 ? 'text-primary' : 'text-rose-600'}`}>
                        {formatCurrency(savings, currencySymbol)}
                    </span>
                </div>
            </div>
            <div className="w-px h-10 bg-border/50" />
            <div className="ai-trigger-container ai-gradient-box self-center">
                <Button
                    variant="ghost"
                    className="font-black border-0 shadow-none hover:bg-transparent h-10 px-4"
                    onClick={() => setIsAIModalOpen(true)}
                >
                    <div className="flex items-center justify-center gap-2">
                        <Brain size={16} className="text-emerald-500" />
                        <span className="ai-gradient-text">{t('action.start_ai')}</span>
                    </div>
                </Button>
            </div>
        </Card>
    );

    const actions = (
        <div className="plan-actions-container w-full">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                {t('heading.planning_year')}
            </label>
            <Select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="bg-card/50 backdrop-blur-sm border-primary/20 hover:border-primary/50 transition-all font-bold text-lg h-12"
            >
                {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                ))}
            </Select>
        </div>
    );

    const leading = (
        <Button
            variant="outline"
            size="icon"
            id="plan-functions-btn"
            className="w-12 h-12 rounded-xl bg-card/50 backdrop-blur-sm border-primary/10 hover:border-primary/30 hover:bg-primary/5 transition-all shadow-sm"
            onClick={() => setIsFunctionModalOpen(true)}
        >
            <LayoutGrid size={22} className="text-primary" />
        </Button>
    );

    return (
        <>
            <AbstractHeading
                title={
                    <div className="heading-title-area flex items-center gap-3">
                        {t('app.title')}
                        <button
                            onClick={onViewDashboard}
                            className="view-dashboard-btn text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 transition-all cursor-pointer"
                        >
                            <span className="ai-gradient-text">{t('action.view_dashboard')}</span>
                        </button>
                    </div>
                }
                subtitle={t('app.subtitle')}
                summary={summary}
                actions={actions}
                leading={leading}
            />
            <PlanFunctionModal
                isOpen={isFunctionModalOpen}
                onClose={() => setIsFunctionModalOpen(false)}
                viewMode={viewMode}
                setViewMode={setViewMode}
                onImport={onImport}
                onExport={onExport}
                onClear={onClear}
                onSample={onSample}
            />
            <AIStartModal
                isOpen={isAIModalOpen}
                onClose={() => setIsAIModalOpen(false)}
                onGenerate={onGenerate}
            />
        </>
    );
}
