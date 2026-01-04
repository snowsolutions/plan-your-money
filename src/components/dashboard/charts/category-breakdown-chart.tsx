import { useState } from 'react';
import { useTranslation } from "@/hooks/use-translation";
import { Card } from "../../ui/card";
import { PieChart as PieChartIcon } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { formatCurrency } from '@/utils/format';
import { CHART_COLORS } from './constants';

interface CategoryBreakdownChartProps {
    incomePieData: any[];
    expensePieData: any[];
    totals: { income: number; expense: number };
    currencySymbol: string;
}

export function CategoryBreakdownChart({ incomePieData, expensePieData, totals, currencySymbol }: CategoryBreakdownChartProps) {
    const { t } = useTranslation();
    const [pieType, setPieType] = useState<'income' | 'expense'>('income');

    return (
        <Card className="category-breakdown-card h-[450px] border border-white/5 shadow-xl bg-card/40 backdrop-blur-md p-6 flex flex-col">
            <div className="chart-header flex items-center justify-between mb-2">
                <h3 className="font-bold flex items-center gap-2 text-sm uppercase tracking-wide opacity-80">
                    <PieChartIcon size={18} />
                    {t('dashboard.category_breakdown')}
                </h3>
                <div className="chart-toggle-actions flex bg-muted/50 p-1 rounded-lg">
                    <button
                        onClick={() => setPieType('income')}
                        className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${pieType === 'income' ? 'bg-emerald-500 text-white shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        {t('common.income')}
                    </button>
                    <button
                        onClick={() => setPieType('expense')}
                        className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${pieType === 'expense' ? 'bg-rose-500 text-white shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        {t('common.expense')}
                    </button>
                </div>
            </div>

            <div className="pie-chart-container h-[280px] relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={pieType === 'income' ? incomePieData : expensePieData}
                            cx="50%" cy="50%"
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={3}
                            dataKey="value"
                            animationDuration={1000}
                        >
                            {(pieType === 'income' ? incomePieData : expensePieData).map((_, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                                    stroke="transparent"
                                />
                            ))}
                        </Pie>
                        <RechartsTooltip
                            formatter={(value?: number) => formatCurrency(value || 0, currencySymbol)}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
                {/* Center Label */}
                <div className="pie-center-label absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-xs font-bold text-muted-foreground opacity-50 uppercase">{pieType === 'income' ? t('common.income') : t('common.expense')}</span>
                    <span className="text-xl font-black">
                        {Math.round(((pieType === 'income' ? totals.income : totals.expense) / (totals.income + totals.expense || 1)) * 100)}%
                    </span>
                </div>
            </div>

            <div className="chart-legend-container flex flex-wrap items-center justify-center gap-3 mt-4">
                {(pieType === 'income' ? incomePieData : expensePieData).slice(0, 6).map((entry: any, index: number) => {
                    return (
                        <div key={index} className="legend-item flex items-center gap-2 text-xs bg-muted/20 px-3 py-1.5 rounded-full border border-white/5">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                            <span className="opacity-70 truncate max-w-[100px]">{entry.name}</span>
                            <span className="font-bold opacity-100">{Math.round((entry.value / (pieType === 'income' ? totals.income : totals.expense)) * 100)}%</span>
                        </div>
                    )
                })}
            </div>
        </Card>
    );
}
