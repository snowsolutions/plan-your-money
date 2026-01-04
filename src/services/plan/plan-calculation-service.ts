import type { FinanceItem } from "@/types/finance";

/**
 * Plan Calculation Service
 * 
 * Handles all financial calculations for the planning module including:
 * - Monthly net income/expense calculations
 * - Cumulative totals across months
 * - Balance calculations
 */

const CURRENT_DATE = new Date();
export const ACTUAL_CURRENT_YEAR = CURRENT_DATE.getFullYear();

/**
 * Calculate the net amount (income - expenses) for a specific month
 * 
 * @param items - Array of all finance items
 * @param monthIndex - Zero-based month index (0 = January, 11 = December)
 * @param selectedYear - The year being calculated
 * @returns Net amount for the month (positive = surplus, negative = deficit)
 */
export function calculateNetForMonth(
    items: FinanceItem[],
    monthIndex: number,
    selectedYear: number,
    includeNonFinalized = false,
    convert?: (amount: number, from: string) => number
): number {
    return items
        .filter(item =>
            item.monthIndex === monthIndex &&
            (item.year === selectedYear || (!item.year && selectedYear === ACTUAL_CURRENT_YEAR)) &&
            (includeNonFinalized || item.status !== 'not_finalized')
        )
        .reduce((sum, item) => {
            const amount = convert ? convert(item.amount, item.currency || 'VND') : item.amount;
            return item.type === 'Income' ? sum + amount : sum - amount;
        }, 0);
}

/**
 * Calculate the cumulative total from January up to and including the specified month
 * 
 * @param items - Array of all finance items
 * @param monthIndex - Zero-based month index to calculate up to
 * @param selectedYear - The year being calculated
 * @param includeNonFinalized - Whether to include items with status 'not_finalized'
 * @returns Cumulative total from month 0 to monthIndex (inclusive)
 */
export function calculateCumulativeTotal(
    items: FinanceItem[],
    monthIndex: number,
    selectedYear: number,
    includeNonFinalized = false,
    convert?: (amount: number, from: string) => number
): number {
    let total = 0;
    for (let i = 0; i <= monthIndex; i++) {
        total += calculateNetForMonth(items, i, selectedYear, includeNonFinalized, convert);
    }
    return total;
}

/**
 * Calculate total income for a specific month
 * 
 * @param items - Array of all finance items
 * @param monthIndex - Zero-based month index
 * @param selectedYear - The year being calculated
 * @param includeNonFinalized - Whether to include items with status 'not_finalized'
 * @returns Total income for the month
 */
export function calculateMonthlyIncome(
    items: FinanceItem[],
    monthIndex: number,
    selectedYear: number,
    includeNonFinalized = false,
    convert?: (amount: number, from: string) => number
): number {
    return items
        .filter(item =>
            item.monthIndex === monthIndex &&
            item.type === 'Income' &&
            (item.year === selectedYear || (!item.year && selectedYear === ACTUAL_CURRENT_YEAR)) &&
            (includeNonFinalized || item.status !== 'not_finalized')
        )
        .reduce((sum, item) => {
            const amount = convert ? convert(item.amount, item.currency || 'VND') : item.amount;
            return sum + amount;
        }, 0);
}

/**
 * Calculate total expenses for a specific month
 * 
 * @param items - Array of all finance items
 * @param monthIndex - Zero-based month index
 * @param selectedYear - The year being calculated
 * @param includeNonFinalized - Whether to include items with status 'not_finalized'
 * @returns Total expenses for the month
 */
export function calculateMonthlyExpenses(
    items: FinanceItem[],
    monthIndex: number,
    selectedYear: number,
    includeNonFinalized = false,
    convert?: (amount: number, from: string) => number
): number {
    return items
        .filter(item =>
            item.monthIndex === monthIndex &&
            item.type === 'Expense' &&
            (item.year === selectedYear || (!item.year && selectedYear === ACTUAL_CURRENT_YEAR)) &&
            (includeNonFinalized || item.status !== 'not_finalized')
        )
        .reduce((sum, item) => {
            const amount = convert ? convert(item.amount, item.currency || 'VND') : item.amount;
            return sum + amount;
        }, 0);
}

/**
 * Calculate yearly totals for income, expenses, and net savings
 * 
 * @param items - Array of all finance items
 * @param selectedYear - The year being calculated
 * @param includeNonFinalized - Whether to include items with status 'not_finalized'
 * @returns Object containing yearlyIncome, yearlyExpenses, and netSavings
 */
export function calculateYearlyTotals(
    items: FinanceItem[],
    selectedYear: number,
    includeNonFinalized = false,
    convert?: (amount: number, from: string) => number
): {
    yearlyIncome: number;
    yearlyExpenses: number;
    netSavings: number;
} {
    let yearlyIncome = 0;
    let yearlyExpenses = 0;

    for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
        yearlyIncome += calculateMonthlyIncome(items, monthIndex, selectedYear, includeNonFinalized, convert);
        yearlyExpenses += calculateMonthlyExpenses(items, monthIndex, selectedYear, includeNonFinalized, convert);
    }

    return {
        yearlyIncome,
        yearlyExpenses,
        netSavings: yearlyIncome - yearlyExpenses
    };
}

/**
 * Get the previous month's balance (cumulative total)
 * Returns 0 for January (month 0)
 * 
 * @param items - Array of all finance items
 * @param monthIndex - Zero-based month index
 * @param selectedYear - The year being calculated
 * @param includeNonFinalized - Whether to include items with status 'not_finalized'
 * @returns Previous month's cumulative balance
 */
export function getPreviousMonthBalance(
    items: FinanceItem[],
    monthIndex: number,
    selectedYear: number,
    includeNonFinalized = false,
    convert?: (amount: number, from: string) => number
): number {
    if (monthIndex === 0) return 0;
    return calculateCumulativeTotal(items, monthIndex - 1, selectedYear, includeNonFinalized, convert);
}

/**
 * Calculate the balance for a specific month including previous balance
 * 
 * @param items - Array of all finance items
 * @param monthIndex - Zero-based month index
 * @param selectedYear - The year being calculated
 * @param includeNonFinalized - Whether to include items with status 'not_finalized'
 * @returns Object containing previousBalance, monthlyNet, and totalBalance
 */
export function calculateMonthBalance(
    items: FinanceItem[],
    monthIndex: number,
    selectedYear: number,
    includeNonFinalized = false,
    convert?: (amount: number, from: string) => number
): {
    previousBalance: number;
    monthlyNet: number;
    totalBalance: number;
} {
    const previousBalance = getPreviousMonthBalance(items, monthIndex, selectedYear, includeNonFinalized, convert);
    const monthlyNet = calculateNetForMonth(items, monthIndex, selectedYear, includeNonFinalized, convert);
    const totalBalance = previousBalance + monthlyNet;

    return {
        previousBalance,
        monthlyNet,
        totalBalance
    };
}

