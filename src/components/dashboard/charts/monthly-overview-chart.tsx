import { useState } from 'react';
import { useTranslation } from "@/hooks/use-translation";
import { Card } from "../../ui/card";
import { BarChart3, ArrowLeftRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { formatCurrency } from '@/utils/format';
import { useCurrency } from '@/providers/currency-provider';

interface MonthlyOverviewChartProps {
    monthlyData: any[];
    selectedYear: number;
    currencySymbol: string;
}

export function MonthlyOverviewChart({ monthlyData, selectedYear, currencySymbol }: MonthlyOverviewChartProps) {
    const { t } = useTranslation();
    const { convert } = useCurrency();
    const [monthDirection, setMonthDirection] = useState<'asc' | 'desc'>('asc');

    const displayedMonthlyData = monthDirection === 'asc' ? monthlyData : [...monthlyData].reverse();

    // Custom Tooltip for Bar Chart
    const CustomBarTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-popover border text-popover-foreground p-3 rounded-xl shadow-xl text-xs backdrop-blur-md z-50">
                    <p className="font-bold border-b pb-1 mb-2">{label}</p>
                    {payload.map((entry: any, index: number) => {
                        const isIncome = entry.dataKey === 'income';
                        const maxItem = isIncome ? data.maxIncomeItem : data.maxExpenseItem;
                        const minItem = isIncome ? data.minIncomeItem : data.minExpenseItem;
                        return (
                            <div key={index} className={`mb-3 ${index !== 0 ? 'border-t pt-2' : ''}`}>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                    <span className="font-semibold">{entry.name}: {formatCurrency(entry.value, currencySymbol)}</span>
                                </div>
                                {maxItem && (
                                    <div className="pl-4 opacity-80 grid grid-cols-[auto,1fr] gap-x-2">
                                        <span className="text-[10px] text-muted-foreground">Max:</span>
                                        <span className="text-[10px] truncate max-w-[120px]">{maxItem.name} ({formatCurrency(convert(maxItem.amount, maxItem.currency || 'VND', currencySymbol), currencySymbol)})</span>
                                    </div>
                                )}
                                {minItem && (
                                    <div className="pl-4 opacity-80 grid gap-x-2 grid-cols-[auto,1fr]">
                                        <span className="text-[10px] text-muted-foreground">Min:</span>
                                        <span className="text-[10px] truncate max-w-[120px]">{minItem.name} ({formatCurrency(convert(minItem.amount, minItem.currency || 'VND', currencySymbol), currencySymbol)})</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            );
        }
        return null;
    };

    return (
        <Card className="monthly-overview-card h-[450px] border border-white/5 shadow-xl bg-card/40 backdrop-blur-md p-6 flex flex-col">
            <div className="chart-header mb-6 flex justify-between items-start">
                <div className="header-info">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <BarChart3 className="text-primary" size={20} />
                        {t('dashboard.monthly_overview')}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1">{t('dashboard.monthly_overview_subtitle', { year: selectedYear })}</p>
                </div>
                <button
                    onClick={() => setMonthDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                    className="chart-action-btn p-2 rounded-lg bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    title={t('dashboard.reverse_order')}
                >
                    <ArrowLeftRight size={16} />
                </button>
            </div>
            <div className="bar-chart-container h-[300px] w-full mt-auto">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={displayedMonthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" opacity={0.1} />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'currentColor', opacity: 0.5, fontSize: 10 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'currentColor', opacity: 0.5, fontSize: 10 }}
                            tickFormatter={(value) => `${value / 1000}k`}
                        />
                        <RechartsTooltip content={<CustomBarTooltip />} cursor={{ fill: 'currentColor', opacity: 0.05 }} />
                        <Bar dataKey="income" name={t('common.income')} fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={30} />
                        <Bar dataKey="expense" name={t('common.expense')} fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={30} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
}
