import { useTranslation } from "@/hooks/use-translation";
import { AbstractHeading } from '../abstract-heading';
import { Select } from '../ui/select';
import { LayoutGrid } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { formatCurrency } from '@/utils/format';

interface DashboardHeadingProps {
    selectedYear: number;
    onYearChange: (year: number) => void;
    years: number[];
    onOpenFunctions: () => void;
    totals: { income: number, expense: number };
    currencySymbol: string;
}

export function DashboardHeading({
    selectedYear,
    onYearChange,
    years,
    onOpenFunctions,
    totals,
    currencySymbol
}: DashboardHeadingProps) {
    const { t } = useTranslation();

    const savings = totals.income - totals.expense;

    const summary = (
        <Card className="dashboard-summary-card flex items-center gap-4 px-4 py-2 bg-card/40 backdrop-blur-sm border-primary/10 shadow-sm w-fit">
            <div className="flex flex-col gap-0.5 min-w-[140px]">
                <div className="flex justify-between items-center gap-4">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{t('dashboard.total_income')}</span>
                    <span className="text-[11px] font-bold text-emerald-600 leading-tight">{formatCurrency(totals.income, currencySymbol)}</span>
                </div>
                <div className="flex justify-between items-center gap-4">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{t('dashboard.total_expense')}</span>
                    <span className="text-[11px] font-bold text-rose-600 leading-tight">{formatCurrency(totals.expense, currencySymbol)}</span>
                </div>
                <div className="flex justify-between items-center gap-4 pt-0.5 border-t border-primary/5">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{t('dashboard.net_savings')}</span>
                    <span className={`text-[11px] font-black leading-tight ${savings >= 0 ? 'text-primary' : 'text-rose-600'}`}>
                        {formatCurrency(savings, currencySymbol)}
                    </span>
                </div>
            </div>
        </Card>
    );

    const actions = (
        <div className="dashboard-actions-container w-full">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                {t('heading.planning_year')}
            </label>
            <Select
                value={selectedYear}
                onChange={(e) => onYearChange(Number(e.target.value))}
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
            className="w-12 h-12 rounded-xl bg-card/50 backdrop-blur-sm border-primary/10 hover:border-primary/30 hover:bg-primary/5 transition-all shadow-sm"
            onClick={onOpenFunctions}
        >
            <LayoutGrid size={22} className="text-primary" />
        </Button>
    );

    return (
        <AbstractHeading
            title={t('dashboard.title', { year: selectedYear })}
            subtitle={t('dashboard.subtitle')}
            summary={summary}
            actions={actions}
            leading={leading}
        />
    );
}
