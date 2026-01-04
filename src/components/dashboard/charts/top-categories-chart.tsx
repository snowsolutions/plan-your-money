import { useState, useMemo } from 'react';
import { useTranslation } from "@/hooks/use-translation";
import { Card } from "../../ui/card";
import { TrendingUp, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { formatCurrency } from '@/utils/format';

interface TopCategoriesChartProps {
    topCategories: any[];
    currencySymbol: string;
}

export function TopCategoriesChart({ topCategories, currencySymbol }: TopCategoriesChartProps) {
    const { t } = useTranslation();
    const [sortConfig, setSortConfig] = useState<{ key: 'rank' | 'name' | 'value', direction: 'asc' | 'desc' }>({ key: 'rank', direction: 'asc' });

    const sortedTopCategories = useMemo(() => {
        const sorted = [...topCategories];
        sorted.sort((a, b) => {
            const modifier = sortConfig.direction === 'asc' ? 1 : -1;
            if (sortConfig.key === 'name') {
                return a.name.localeCompare(b.name) * modifier;
            } else if (sortConfig.key === 'value') {
                return (a.value - b.value) * modifier;
            } else {
                // rank
                return (a.rank - b.rank) * modifier;
            }
        });
        return sorted;
    }, [topCategories, sortConfig]);

    const handleSort = (key: 'rank' | 'name' | 'value') => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const SortIcon = ({ colKey }: { colKey: 'rank' | 'name' | 'value' }) => {
        if (sortConfig.key !== colKey) return <ArrowUpDown size={12} className="opacity-30" />;
        return sortConfig.direction === 'asc' ? <ArrowUp size={12} className="text-primary" /> : <ArrowDown size={12} className="text-primary" />;
    };

    return (
        <Card className="top-categories-card h-[600px] border border-white/5 shadow-xl bg-card/40 backdrop-blur-md p-0 flex flex-col overflow-hidden">
            <div className="chart-header p-6 border-b border-white/5 shrink-0">
                <h2 className="text-lg font-bold flex items-center gap-2">
                    <TrendingUp className="text-primary" size={18} />
                    {t('dashboard.top_categories')}
                </h2>
                <p className="text-xs text-muted-foreground mt-1">{t('dashboard.top_categories_subtitle')}</p>
            </div>
            <div className="table-scroll-container overflow-y-auto flex-1 custom-scrollbar">
                <table className="categories-data-table w-full text-sm text-left">
                    <thead className="table-header bg-muted text-xs uppercase text-muted-foreground font-semibold sticky top-0 z-10">
                        <tr>
                            <th className="px-6 py-4 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => handleSort('rank')}>
                                <div className="flex items-center gap-1">
                                    {t('dashboard.rank')} <SortIcon colKey="rank" />
                                </div>
                            </th>
                            <th className="px-6 py-4 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => handleSort('name')}>
                                <div className="flex items-center gap-1">
                                    {t('dashboard.category')} <SortIcon colKey="name" />
                                </div>
                            </th>
                            <th className="px-6 py-4 text-right cursor-pointer hover:bg-white/5 transition-colors" onClick={() => handleSort('value')}>
                                <div className="flex items-center justify-end gap-1">
                                    {t('dashboard.value')} <SortIcon colKey="value" />
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="categories-table-body divide-y divide-white/5">
                        {sortedTopCategories.map((cat: any) => (
                            <tr key={cat.id} className={`
                                category-row group transition-colors hover:bg-muted/30
                                ${cat.type === 'Income' ? 'hover:bg-emerald-500/5' : 'hover:bg-rose-500/5'}
                            `}>
                                <td className="px-6 py-3 font-mono text-xs opacity-50">#{cat.rank}</td>
                                <td className="px-6 py-3 font-medium">
                                    <div className="category-cell-content flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${cat.type === 'Income' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                            {cat.name}
                                        </div>
                                        <span className={`type-tag text-[9px] uppercase tracking-wider font-bold mt-0.5 ml-3.5 opacity-50 ${cat.type === 'Income' ? 'text-emerald-500' : 'text-rose-500'}`}>{cat.type}</span>
                                    </div>
                                </td>
                                <td className={`px-6 py-3 text-right font-bold font-mono ${cat.type === 'Income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {formatCurrency(cat.value, currencySymbol)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}
