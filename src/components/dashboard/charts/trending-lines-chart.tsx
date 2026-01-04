import { useState, useMemo } from 'react';
import { useTranslation } from "@/hooks/use-translation";
import { Card } from "../../ui/card";
import { PieChart as PieChartIcon, BarChart3 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { FinanceItem } from '@/types/finance';
import { formatCurrency } from '@/utils/format';
import { useCurrency } from '@/providers/currency-provider';
import { ItemSelectorDropdown } from "../item-selector-dropdown";
import { CHART_COLORS, MONTHS } from './constants';

interface TrendingLinesChartProps {
    items: FinanceItem[];
    selectedYear: number;
    currencySymbol: string;
}

export function TrendingLinesChart({ items, selectedYear, currencySymbol }: TrendingLinesChartProps) {
    const { t } = useTranslation();
    const { convert } = useCurrency();
    const [selectedTrendItemIds, setSelectedTrendItemIds] = useState<string[]>([]);

    const filteredItems = useMemo(() => {
        return items.filter(i => i.year === selectedYear);
    }, [items, selectedYear]);

    const trendLineData = useMemo(() => {
        return MONTHS.map((month, mIndex) => {
            const entry: any = { name: month };
            selectedTrendItemIds.forEach(id => {
                const matchingItems = filteredItems.filter(i => (i.seriesId === id || i.id === id) && i.monthIndex === mIndex);
                const total = matchingItems.reduce((sum, i) => sum + convert(i.amount, i.currency || 'VND', currencySymbol), 0);
                entry[id] = total;
            });
            return entry;
        });
    }, [filteredItems, selectedTrendItemIds]);

    const selectedItemNames = useMemo(() => {
        const names: Record<string, string> = {};
        selectedTrendItemIds.forEach(id => {
            const item = items.find(i => i.seriesId === id || i.id === id);
            if (item) names[id] = item.name;
        });
        return names;
    }, [items, selectedTrendItemIds]);

    return (
        <Card className="trending-lines-card h-[600px] border border-white/5 shadow-xl bg-card/40 backdrop-blur-md p-6 flex flex-col">
            <div className="chart-header flex items-start justify-between mb-6">
                <div className="header-info">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <PieChartIcon className="text-primary rotate-45" size={18} />
                        {t('dashboard.trending_lines')}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1">{t('dashboard.trending_lines_description')}</p>
                </div>
                <ItemSelectorDropdown
                    items={filteredItems}
                    selectedIds={selectedTrendItemIds}
                    onSelectionChange={setSelectedTrendItemIds}
                    currencySymbol={currencySymbol}
                />
            </div>

            <div className="line-chart-container flex-1 min-h-0 relative">
                {selectedTrendItemIds.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendLineData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" opacity={0.1} />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'currentColor', opacity: 0.5, fontSize: 10 }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'currentColor', opacity: 0.5, fontSize: 10 }}
                                tickFormatter={(value) => `${value / 1000}k`}
                            />
                            <RechartsTooltip
                                formatter={(value: any, name: any) => [formatCurrency(value || 0, currencySymbol), selectedItemNames[name] || name]}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', backgroundColor: 'hsl(var(--popover))' }}
                            />
                            <Legend verticalAlign="bottom" height={36} />
                            {selectedTrendItemIds.map((id, index) => (
                                <Line
                                    key={id}
                                    type="monotone"
                                    dataKey={id}
                                    name={selectedItemNames[id] || id}
                                    stroke={CHART_COLORS[index % CHART_COLORS.length]}
                                    strokeWidth={3}
                                    dot={{ r: 4, strokeWidth: 2, fill: 'white' }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                    animationDuration={1500}
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="chart-empty-state absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                        <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mb-4 text-primary opacity-20">
                            <BarChart3 size={32} />
                        </div>
                        <p className="text-sm font-medium text-muted-foreground opacity-60">
                            {t('dashboard.no_items_selected')}
                        </p>
                    </div>
                )}
            </div>
        </Card>
    );
}
