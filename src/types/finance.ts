export type ItemType = 'Income' | 'Expense';
export type ItemStructure = 'simple' | 'bundle';
export type ItemStatus = 'finalized' | 'not_finalized';
export type RecurringMode = 'as_it_is' | 'installments';

export interface SubItem {
    id: string;
    name: string;
    price: number;
    quantity?: number;
    description?: string;
}

export interface FinanceItem {
    id: string;
    type: ItemType;
    name: string;
    amount: number;
    recurring: boolean;
    recurringType?: 'until_date' | 'forever';
    recurringUntilDate?: string;
    monthIndex: number;
    year: number;
    seriesId?: string; // Links recurring items together
    description?: string;
    categoryIds?: string[];
    // New fields for FMA-4
    structureType?: ItemStructure;
    status?: ItemStatus;
    subItems?: SubItem[];
    recurringMode?: RecurringMode;
    installments?: number;
    installmentIndex?: number;
    currency?: string;
}
