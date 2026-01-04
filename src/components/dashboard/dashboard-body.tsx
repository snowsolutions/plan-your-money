import { useMemo, useState } from 'react';
import { useCurrency } from '@/providers/currency-provider';
import { useTranslation } from "@/hooks/use-translation";
import { Card } from "../ui/card";
import { BarChart3 } from "lucide-react";
import { FinanceItem } from '@/types/finance';
import { COMMON_CATEGORIES, CategoryDefinition } from '@/types/category';
import { DashboardFunctionModal } from "./modals/dashboard-function-modal";
import { DashboardHeading } from "./dashboard-heading";

// Chart Components
import { CategoryBreakdownChart } from "./charts/category-breakdown-chart";
import { MonthlyOverviewChart } from "./charts/monthly-overview-chart";
import { TopCategoriesChart } from "./charts/top-categories-chart";
import { TrendingLinesChart } from "./charts/trending-lines-chart";
import { MONTHS } from "./charts/constants";

interface DashboardBodyProps {
    items: FinanceItem[];
    selectedYear: number;
    currencySymbol: string;
    years: number[];
    onYearChange: (year: number) => void;
    onRefreshCategorization: () => void;
    userCategories: CategoryDefinition[];
    onAddCategory: (cat: { name: string, type: 'Income' | 'Expense' }) => void;
    onEditCategory: (id: string, updates: { name: string, type: 'Income' | 'Expense' }) => void;
    onDeleteCategory: (id: string) => void;
}

export function DashboardBody({
    items,
    selectedYear,
    currencySymbol,
    years,
    onYearChange,
    onRefreshCategorization,
    userCategories,
    onAddCategory,
    onEditCategory,
    onDeleteCategory
}: DashboardBodyProps) {
    const [isFunctionModalOpen, setIsFunctionModalOpen] = useState(false);
    const { t } = useTranslation();
    const { convert } = useCurrency();

    // Combine common and user categories for lookup
    const allKnownCategories = useMemo(() => {
        const userCats = userCategories || [];
        return [...COMMON_CATEGORIES, ...userCats];
    }, [userCategories]);

    // --- Data Processing ---
    const {
        monthlyData,
        incomePieData,
        expensePieData,
        topCategories,
        totals
    } = useMemo(() => {
        const currentYearItems = items.filter(i => i.year === selectedYear);

        // 1. Monthly Data
        const monthly = MONTHS.map((month) => ({
            name: month,
            income: 0,
            expense: 0,
            maxIncomeItem: null as FinanceItem | null,
            minIncomeItem: null as FinanceItem | null,
            maxExpenseItem: null as FinanceItem | null,
            minExpenseItem: null as FinanceItem | null,
        }));

        // 2. Category Aggregation
        const catMap = new Map<string, { id: string, name: string, value: number, type: 'Income' | 'Expense' }>();

        let totalInc = 0;
        let totalExp = 0;

        currentYearItems.forEach(item => {
            const mIndex = item.monthIndex;
            const itemAmountInAppCurrency = convert(item.amount, item.currency || 'VND', currencySymbol);

            if (mIndex >= 0 && mIndex < 12) {
                // Monthly Totals
                if (item.type === 'Income') {
                    monthly[mIndex].income += itemAmountInAppCurrency;
                    totalInc += itemAmountInAppCurrency;

                    if (!monthly[mIndex].maxIncomeItem || itemAmountInAppCurrency > convert(monthly[mIndex].maxIncomeItem!.amount, monthly[mIndex].maxIncomeItem!.currency || 'VND', currencySymbol)) monthly[mIndex].maxIncomeItem = item;
                    if (!monthly[mIndex].minIncomeItem || itemAmountInAppCurrency < convert(monthly[mIndex].minIncomeItem!.amount, monthly[mIndex].minIncomeItem!.currency || 'VND', currencySymbol)) monthly[mIndex].minIncomeItem = item;
                } else {
                    monthly[mIndex].expense += itemAmountInAppCurrency;
                    totalExp += itemAmountInAppCurrency;

                    if (!monthly[mIndex].maxExpenseItem || itemAmountInAppCurrency > convert(monthly[mIndex].maxExpenseItem!.amount, monthly[mIndex].maxExpenseItem!.currency || 'VND', currencySymbol)) monthly[mIndex].maxExpenseItem = item;
                    if (!monthly[mIndex].minExpenseItem || itemAmountInAppCurrency < convert(monthly[mIndex].minExpenseItem!.amount, monthly[mIndex].minExpenseItem!.currency || 'VND', currencySymbol)) monthly[mIndex].minExpenseItem = item;
                }
            }

            // Category Aggregation
            const categories = item.categoryIds && item.categoryIds.length > 0 ? item.categoryIds : ['uncategorized'];
            const splitAmount = itemAmountInAppCurrency / categories.length;

            categories.forEach(catId => {
                const existing = catMap.get(catId);
                if (existing) {
                    existing.value += splitAmount;
                } else {
                    const def = allKnownCategories.find(c => c.id === catId);
                    let name = catId;
                    if (def) {
                        if (def.translationKey.startsWith('category.')) {
                            name = t(def.translationKey);
                        } else {
                            name = def.translationKey;
                        }
                    } else if (catId === 'uncategorized') {
                        name = t('category.uncategorized');
                    }

                    const type = def ? def.type : item.type;
                    catMap.set(catId, { id: catId, name, value: splitAmount, type });
                }
            });
        });

        const incPie: any[] = [];
        const expPie: any[] = [];
        const allCats: any[] = [];

        catMap.forEach((v) => {
            if (v.value > 0) {
                if (v.type === 'Income') incPie.push(v);
                else expPie.push(v);
                allCats.push(v);
            }
        });

        incPie.sort((a, b) => b.value - a.value);
        expPie.sort((a, b) => b.value - a.value);
        allCats.sort((a, b) => b.value - a.value);

        const top20Base = allCats.slice(0, 20).map((cat, index) => ({ ...cat, rank: index + 1 }));

        return {
            monthlyData: monthly,
            incomePieData: incPie,
            expensePieData: expPie,
            topCategories: top20Base,
            totals: { income: totalInc, expense: totalExp }
        };
    }, [items, selectedYear, allKnownCategories, t, convert, currencySymbol]);

    if (items.length === 0) {
        return (
            <div className="dashboard-body-container flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
                <DashboardHeading
                    selectedYear={selectedYear}
                    onYearChange={onYearChange}
                    years={years}
                    onOpenFunctions={() => setIsFunctionModalOpen(true)}
                    totals={{ income: 0, expense: 0 }}
                    currencySymbol={currencySymbol}
                />

                <div className="dashboard-content-grid px-8 pt-4">
                    <DashboardFunctionModal
                        isOpen={isFunctionModalOpen}
                        onClose={() => setIsFunctionModalOpen(false)}
                        onRefreshCategorization={onRefreshCategorization}
                        userCategories={userCategories}
                        onAddCategory={onAddCategory}
                        onEditCategory={onEditCategory}
                        onDeleteCategory={onDeleteCategory}
                    />

                    <div className="dashboard-empty-state flex flex-col items-center justify-center p-12 text-center h-[60vh]">
                        <Card className="dashboard-empty-card p-8 flex flex-col items-center justify-center border-dashed border-2 border-primary/10 bg-card/20 min-h-[400px] relative overflow-hidden group w-full max-w-2xl">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            <div className="text-center relative z-10 p-6">
                                <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-6 text-primary/40">
                                    <BarChart3 size={32} />
                                </div>
                                <h2 className="text-2xl font-black mb-3">{t('dashboard.no_data_title', { year: selectedYear })}</h2>
                                <p className="text-muted-foreground max-w-md mx-auto leading-relaxed mb-6">
                                    {t('dashboard.no_data_desc_part1')} <strong>{t('nav.plan')}</strong> {t('dashboard.no_data_desc_part2')}
                                </p>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="dashboard-body-container flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
            <DashboardHeading
                selectedYear={selectedYear}
                onYearChange={onYearChange}
                years={years}
                onOpenFunctions={() => setIsFunctionModalOpen(true)}
                totals={totals}
                currencySymbol={currencySymbol}
            />

            <div className="dashboard-content-grid px-8 pt-4 flex flex-col gap-8">
                <DashboardFunctionModal
                    isOpen={isFunctionModalOpen}
                    onClose={() => setIsFunctionModalOpen(false)}
                    onRefreshCategorization={onRefreshCategorization}
                    userCategories={userCategories}
                    onAddCategory={onAddCategory}
                    onEditCategory={onEditCategory}
                    onDeleteCategory={onDeleteCategory}
                />

                {/* Row 1: Charts */}
                <div className="dashboard-charts-row grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                    <CategoryBreakdownChart
                        incomePieData={incomePieData}
                        expensePieData={expensePieData}
                        totals={totals}
                        currencySymbol={currencySymbol}
                    />

                    <MonthlyOverviewChart
                        monthlyData={monthlyData}
                        selectedYear={selectedYear}
                        currencySymbol={currencySymbol}
                    />
                </div>

                {/* Row 2: Grid Split */}
                <div className="dashboard-stats-row grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                    <TopCategoriesChart
                        topCategories={topCategories}
                        currencySymbol={currencySymbol}
                    />

                    <TrendingLinesChart
                        items={items}
                        selectedYear={selectedYear}
                        currencySymbol={currencySymbol}
                    />
                </div>
            </div>
        </div>
    );
}
