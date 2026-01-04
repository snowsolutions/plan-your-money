import { useState, useEffect, useRef } from 'react';
import { useTranslation } from "@/hooks/use-translation";
import { createPortal } from 'react-dom';
import type { FormEvent, MouseEvent, ChangeEvent, Dispatch, SetStateAction } from 'react';
import { Trash2, Calendar, Plus, TrendingUp, TrendingDown, ChevronDown, ArrowDownWideNarrow, ArrowUpNarrowWide, MoreHorizontal, Layers, Package, CheckCircle2, Circle, Wallet, Zap, Home, Laptop, Gift, Percent, Coins, ShoppingBag, Wifi, ShoppingBasket, Utensils, Fuel, Bus, Settings, Shield, Activity, Heart, Stethoscope, Pill, GraduationCap, Book, Smartphone, Sparkles, Dumbbell, Film, Tv, Plane, Palette, Dog, Baby, Wrench, CreditCard, FileText, AlertTriangle } from 'lucide-react';
import { cn } from "@/utils/cn";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { FinanceItem, ItemType, SubItem, RecurringMode } from "@/types/finance";
import { calculateNetForMonth, calculateCumulativeTotal, ACTUAL_CURRENT_YEAR } from "@/services/plan/plan-calculation-service";
import { CategoryDefinition, COMMON_CATEGORIES } from "@/types/category";
import { AbstractModal } from '@/components/abstract-modal';
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";
import { useCurrency } from "@/providers/currency-provider";

const iconMap: Record<string, typeof Wallet> = {
    Wallet, Zap, TrendingUp, Home, Laptop, Gift, Percent, Coins, ShoppingBag, MoreHorizontal,
    Wifi, ShoppingBasket, Utensils, Fuel, Bus, Settings, Shield, Activity, Heart,
    Stethoscope, Pill, GraduationCap, Book, Smartphone, Sparkles, Dumbbell, Film, Tv,
    Plane, Palette, Dog, Baby, Package, Wrench, CreditCard, FileText
};

interface PlanBodyProps {
    selectedYear: number;
    items: FinanceItem[];
    setItems: Dispatch<SetStateAction<FinanceItem[]>>;
    viewMode: 'vertical' | 'horizontal';
    currencySymbol: string;
    onSample: () => void;
    userCategories: CategoryDefinition[];
}

export function PlanBody({ selectedYear, items, setItems, viewMode, currencySymbol, onSample, userCategories }: PlanBodyProps) {
    const { t } = useTranslation();
    const { convert, formatCurrency } = useCurrency();
    const MONTHS = [
        t('months.january'), t('months.february'), t('months.march'), t('months.april'),
        t('months.may'), t('months.june'), t('months.july'), t('months.august'),
        t('months.september'), t('months.october'), t('months.november'), t('months.december')
    ];

    const convertToAppCurrency = (amount: number, from: string) => convert(amount, from, currencySymbol);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<FinanceItem | null>(null);
    const [selectedMonth, setSelectedMonth] = useState<number>(0);
    const [activeTooltip, setActiveTooltip] = useState<{
        item: FinanceItem;
        rect: DOMRect;
    } | null>(null);

    // Edit states
    const [editingItem, setEditingItem] = useState<FinanceItem | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [showRecurringUpdateChoice, setShowRecurringUpdateChoice] = useState(false);
    const [editAmountInput, setEditAmountInput] = useState("");

    // Sort and Priority state
    const [monthOverrides, setMonthOverrides] = useState<Record<number, {
        priority?: 'Income' | 'Expense',
        sort?: 'asc' | 'desc'
    }>>({});
    const [globalPriority, setGlobalPriority] = useState<'Income' | 'Expense'>('Income');
    const [globalSort, setGlobalSort] = useState<'asc' | 'desc'>('desc');
    const clickTimeoutRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
    const subItemsContainerRef = useRef<HTMLDivElement>(null);
    const editSubItemsContainerRef = useRef<HTMLDivElement>(null);

    const handleItemMouseEnter = (e: React.MouseEvent<HTMLDivElement>, item: FinanceItem) => {
        setActiveTooltip({ item, rect: e.currentTarget.getBoundingClientRect() });
    };

    const handleItemMouseLeave = () => {
        setActiveTooltip(null);
    };

    // Form state
    const [newItem, setNewItem] = useState<Partial<FinanceItem>>({
        type: 'Income',
        name: '',
        amount: undefined,
        description: '',
        recurring: false,
        recurringType: 'forever',
        structureType: 'simple',
        status: 'finalized',
        subItems: [],
        recurringMode: 'as_it_is',
        installments: undefined,
        currency: 'VND'
    });

    const [amountInput, setAmountInput] = useState("");

    const formatInputValue = (val: string) => {
        const numericValue = val.replace(/\D/g, "");
        if (!numericValue) return "";
        return new Intl.NumberFormat('vi-VN').format(Number(numericValue));
    };

    const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/\D/g, "");
        setAmountInput(formatInputValue(rawValue));
        setNewItem(prev => ({ ...prev, amount: rawValue ? Number(rawValue) : undefined }));
    };

    const calculateBundleAmount = (subItems: SubItem[]) => {
        return subItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    };

    const addSubItem = () => {
        const newSub: SubItem = {
            id: Math.random().toString(36).substr(2, 9),
            name: '',
            price: 0,
            quantity: 1,
            description: ''
        };
        const updatedSubItems = [...(newItem.subItems || []), newSub];
        const newTotal = calculateBundleAmount(updatedSubItems);

        setNewItem({
            ...newItem,
            subItems: updatedSubItems,
            amount: newItem.structureType === 'bundle' ? newTotal : newItem.amount
        });

        if (newItem.structureType === 'bundle') {
            setAmountInput(formatInputValue(newTotal.toString()));
        }

        // Scroll to bottom
        setTimeout(() => {
            if (subItemsContainerRef.current) {
                subItemsContainerRef.current.scrollTo({
                    top: subItemsContainerRef.current.scrollHeight,
                    behavior: 'smooth'
                });
            }
        }, 100);
    };

    const updateSubItem = (id: string, updates: Partial<SubItem>) => {
        const updatedSubItems = (newItem.subItems || []).map(sub =>
            sub.id === id ? { ...sub, ...updates } : sub
        );
        const newTotal = calculateBundleAmount(updatedSubItems);

        setNewItem({
            ...newItem,
            subItems: updatedSubItems,
            amount: newItem.structureType === 'bundle' ? newTotal : newItem.amount
        });

        if (newItem.structureType === 'bundle') {
            setAmountInput(formatInputValue(newTotal.toString()));
        }
    };

    const removeSubItem = (id: string) => {
        const updatedSubItems = (newItem.subItems || []).filter(sub => sub.id !== id);
        const newTotal = calculateBundleAmount(updatedSubItems);

        setNewItem({
            ...newItem,
            subItems: updatedSubItems,
            amount: newItem.structureType === 'bundle' ? newTotal : newItem.amount
        });

        if (newItem.structureType === 'bundle') {
            setAmountInput(formatInputValue(newTotal.toString()));
        }
    };


    // Edit Modal Helper Functions
    const addEditSubItem = () => {
        if (!editingItem) return;

        const newSub: SubItem = {
            id: Math.random().toString(36).substr(2, 9),
            name: '',
            price: 0,
            quantity: 1,
            description: ''
        };
        const updatedSubItems = [...(editingItem.subItems || []), newSub];
        const newTotal = calculateBundleAmount(updatedSubItems);

        setEditingItem({
            ...editingItem,
            subItems: updatedSubItems,
            amount: editingItem.structureType === 'bundle' ? newTotal : editingItem.amount
        });

        if (editingItem.structureType === 'bundle') {
            setEditAmountInput(formatInputValue(newTotal.toString()));
        }

        // Scroll to bottom
        setTimeout(() => {
            if (editSubItemsContainerRef.current) {
                editSubItemsContainerRef.current.scrollTo({
                    top: editSubItemsContainerRef.current.scrollHeight,
                    behavior: 'smooth'
                });
            }
        }, 100);
    };

    const updateEditSubItem = (id: string, updates: Partial<SubItem>) => {
        if (!editingItem) return;

        const updatedSubItems = (editingItem.subItems || []).map(sub =>
            sub.id === id ? { ...sub, ...updates } : sub
        );
        const newTotal = calculateBundleAmount(updatedSubItems);

        setEditingItem({
            ...editingItem,
            subItems: updatedSubItems,
            amount: editingItem.structureType === 'bundle' ? newTotal : editingItem.amount
        });

        if (editingItem.structureType === 'bundle') {
            setEditAmountInput(formatInputValue(newTotal.toString()));
        }
    };

    const removeEditSubItem = (id: string) => {
        if (!editingItem) return;

        const updatedSubItems = (editingItem.subItems || []).filter(sub => sub.id !== id);
        const newTotal = calculateBundleAmount(updatedSubItems);

        setEditingItem({
            ...editingItem,
            subItems: updatedSubItems,
            amount: editingItem.structureType === 'bundle' ? newTotal : editingItem.amount
        });

        if (editingItem.structureType === 'bundle') {
            setEditAmountInput(formatInputValue(newTotal.toString()));
        }
    };


    // Drag-to-scroll logic
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [startYMain, setStartYMain] = useState(0);
    const [scrollTopMain, setScrollTopMain] = useState(0);
    const [scrolledMonths, setScrolledMonths] = useState<Record<number, boolean>>({});

    // Vertical Drag State
    const [isDraggingVertical, setIsDraggingVertical] = useState(false);
    const [startY, setStartY] = useState(0);
    const [scrollTop, setScrollTop] = useState(0);
    const [activeColumnRef, setActiveColumnRef] = useState<HTMLDivElement | null>(null);

    const handleMonthScroll = (e: React.UIEvent<HTMLDivElement>, index: number) => {
        const target = e.currentTarget;
        const atBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 20;
        if (scrolledMonths[index] !== atBottom) {
            setScrolledMonths(prev => ({ ...prev, [index]: atBottom }));
        }
    };

    const handleMouseDown = (e: MouseEvent) => {
        if (!scrollRef.current) return;
        setIsDragging(true);
        setActiveTooltip(null);
        setStartX(e.pageX - scrollRef.current.offsetLeft);
        setScrollLeft(scrollRef.current.scrollLeft);
        setStartYMain(e.pageY - scrollRef.current.offsetTop);
        setScrollTopMain(scrollRef.current.scrollTop);
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
        setIsDraggingVertical(false);
        setActiveColumnRef(null);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        setIsDraggingVertical(false);
        setActiveColumnRef(null);
    };

    const handleMouseMove = (e: MouseEvent) => {
        // Main container scroll (Horizontal in vertical view, Vertical in horizontal view)
        if (isDragging && scrollRef.current) {
            e.preventDefault();

            if (viewMode === 'vertical') {
                const x = e.pageX - scrollRef.current.offsetLeft;
                const walk = (x - startX); // Changed to 1:1 for smoothness
                scrollRef.current.scrollLeft = scrollLeft - walk;
            } else {
                const y = e.pageY - scrollRef.current.offsetTop;
                const walk = (y - startYMain); // Changed to 1:1 for smoothness
                scrollRef.current.scrollTop = scrollTopMain - walk;
            }
        }

        // Vertical scroll for columns
        if (isDraggingVertical && activeColumnRef) {
            e.preventDefault();
            const y = e.pageY - activeColumnRef.offsetTop;
            const walk = (y - startY); // Changed to 1:1 for smoothness
            activeColumnRef.scrollTop = scrollTop - walk;
        }
    };

    const handleVerticalMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        setIsDraggingVertical(true);
        setActiveTooltip(null);
        setStartY(e.pageY - target.offsetTop);
        setScrollTop(target.scrollTop);
        setActiveColumnRef(target);
    };

    const handlePrefToggle = (monthIndex: number, type: 'priority' | 'sort') => {
        const id = `${monthIndex} -${type} `;

        if (clickTimeoutRef.current[id]) {
            // Double click caught!
            clearTimeout(clickTimeoutRef.current[id]);
            delete clickTimeoutRef.current[id];

            if (type === 'priority') {
                const current = monthOverrides[monthIndex]?.priority || globalPriority;
                const next = current === 'Income' ? 'Expense' : 'Income';
                setGlobalPriority(next);
                setMonthOverrides(prev => {
                    const nextOverrides = { ...prev };
                    Object.keys(nextOverrides).forEach(k => {
                        const idx = Number(k);
                        if (nextOverrides[idx]) {
                            const { priority: _priority, ...rest } = nextOverrides[idx];
                            if (Object.keys(rest).length === 0) {
                                delete nextOverrides[idx];
                            } else {
                                nextOverrides[idx] = rest;
                            }
                        }
                    });
                    return nextOverrides;
                });
            } else {
                const current = monthOverrides[monthIndex]?.sort || globalSort;
                const next = current === 'desc' ? 'asc' : 'desc';
                setGlobalSort(next);
                setMonthOverrides(prev => {
                    const nextOverrides = { ...prev };
                    Object.keys(nextOverrides).forEach(k => {
                        const idx = Number(k);
                        if (nextOverrides[idx]) {
                            const { sort: _sort, ...rest } = nextOverrides[idx];
                            if (Object.keys(rest).length === 0) {
                                delete nextOverrides[idx];
                            } else {
                                nextOverrides[idx] = rest;
                            }
                        }
                    });
                    return nextOverrides;
                });
            }
        } else {
            // Wait for single click
            clickTimeoutRef.current[id] = setTimeout(() => {
                delete clickTimeoutRef.current[id];

                if (type === 'priority') {
                    const current = monthOverrides[monthIndex]?.priority || globalPriority;
                    const next = current === 'Income' ? 'Expense' : 'Income';
                    setMonthOverrides(prev => ({
                        ...prev,
                        [monthIndex]: { ...prev[monthIndex], priority: next }
                    }));
                } else {
                    const current = monthOverrides[monthIndex]?.sort || globalSort;
                    const next = current === 'desc' ? 'asc' : 'desc';
                    setMonthOverrides(prev => ({
                        ...prev,
                        [monthIndex]: { ...prev[monthIndex], sort: next }
                    }));
                }
            }, 250);
        }
    };

    const handleDoubleClick = (item: FinanceItem) => {
        setEditingItem({ ...item, currency: item.currency || 'VND' });
        setEditAmountInput(formatInputValue(item.amount.toString()));
        setIsEditModalOpen(true);
    };

    const handleEditAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/\D/g, "");
        setEditAmountInput(formatInputValue(rawValue));
        if (editingItem) {
            setEditingItem({ ...editingItem, amount: rawValue ? Number(rawValue) : 0 });
        }
    };

    const handleUpdateSingle = () => {
        if (!editingItem) return;
        setItems(prev => prev.map(item => item.id === editingItem.id ? editingItem : item));
        setIsEditModalOpen(false);
        setEditingItem(null);
        setShowRecurringUpdateChoice(false);
    };

    const handleUpdateSeries = () => {
        if (!editingItem || !editingItem.seriesId) return;

        let itemToUpdate = { ...editingItem };

        // FMA-4: If it's a bundle with installments, the amount in editingItem is the TOTAL amount (sum of sub-items).
        // We need to split this total back into monthly amounts for the stored items.
        if (editingItem.structureType === 'bundle' && editingItem.recurringMode === 'installments' && editingItem.installments) {
            const monthlyAmount = Math.floor(editingItem.amount / editingItem.installments);
            itemToUpdate.amount = monthlyAmount;
        }

        setItems(prev => prev.map(item =>
            item.seriesId === editingItem.seriesId
                ? { ...itemToUpdate, id: item.id, monthIndex: item.monthIndex, year: item.year, installmentIndex: item.installmentIndex }
                : item
        ));
        setIsEditModalOpen(false);
        setEditingItem(null);
        setShowRecurringUpdateChoice(false);
    };

    const handleUpdateSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!editingItem) return;

        // For bundle installments, always update the entire series (no choice)
        if (editingItem.recurring && editingItem.seriesId) {
            if (editingItem.structureType === 'bundle' && editingItem.recurringMode === 'installments') {
                handleUpdateSeries();
            } else {
                setShowRecurringUpdateChoice(true);
            }
        } else {
            handleUpdateSingle();
        }
    };

    useEffect(() => {
        localStorage.setItem('finance-items', JSON.stringify(items));
    }, [items]);

    const handleAddItem = (e: FormEvent) => {
        e.preventDefault();
        if (!newItem.name) return;

        if (!newItem.amount || newItem.amount === 0) {
            alert("Please enter a valid amount greater than 0.");
            return;
        }

        const baseItem = {
            type: newItem.type as ItemType,
            name: newItem.name || '',
            amount: Number(newItem.amount),
            recurring: newItem.recurring || false,
            recurringType: newItem.recurringType as 'forever' | 'until_date',
            recurringUntilDate: newItem.recurringUntilDate,
            structureType: newItem.structureType,
            status: newItem.status,
            subItems: newItem.subItems,
            recurringMode: newItem.recurringMode,
            installments: newItem.installments,
            currency: newItem.currency || 'VND'
        };

        const itemsToAdd: FinanceItem[] = [];
        const seriesId = Math.random().toString(36).substr(2, 9);

        if (newItem.recurring && newItem.structureType === 'bundle' && newItem.recurringMode === 'installments' && newItem.installments) {
            // Installments logic
            const installmentAmount = Math.floor(baseItem.amount / newItem.installments);
            for (let i = 0; i < newItem.installments; i++) {
                const totalMonths = selectedMonth + i;
                const m = totalMonths % 12;
                const yOffset = Math.floor(totalMonths / 12);
                itemsToAdd.push({
                    ...baseItem,
                    amount: installmentAmount,
                    id: Math.random().toString(36).substr(2, 9),
                    monthIndex: m,
                    year: selectedYear + yOffset,
                    seriesId: seriesId,
                    installmentIndex: i + 1
                });
            }
        } else if (newItem.recurring) {
            let lastMonthToCreate = 11;
            let endYear = selectedYear;

            if (newItem.recurringType === 'until_date' && newItem.recurringUntilDate) {
                const endDate = new Date(newItem.recurringUntilDate);
                endYear = endDate.getUTCFullYear();
                lastMonthToCreate = endDate.getUTCMonth();
            }

            // For standard recurring, we'll create items from selected month up to end month/year
            for (let y = selectedYear; y <= endYear; y++) {
                const startM = y === selectedYear ? selectedMonth : 0;
                const endM = y === endYear ? lastMonthToCreate : 11;
                for (let m = startM; m <= endM; m++) {
                    itemsToAdd.push({
                        ...baseItem,
                        id: Math.random().toString(36).substr(2, 9),
                        monthIndex: m,
                        year: y,
                        seriesId: seriesId
                    });
                }
            }
        } else {
            // Single month item
            itemsToAdd.push({
                ...baseItem,
                id: Math.random().toString(36).substr(2, 9),
                monthIndex: selectedMonth,
                year: selectedYear
            });
        }

        setItems([...items, ...itemsToAdd]);
        setIsModalOpen(false);
        setNewItem({
            type: 'Income',
            name: '',
            amount: undefined,
            description: '',
            recurring: false,
            recurringType: 'forever',
            structureType: 'simple',
            status: 'finalized',
            subItems: [],
            recurringMode: 'as_it_is',
            installments: undefined,
            currency: 'VND'
        });
        setAmountInput("");
    };

    const isFormDirty = () => {
        return (newItem.name && newItem.name.trim() !== '') || (newItem.amount && newItem.amount > 0) || (newItem.subItems && newItem.subItems.length > 0);
    };

    const handleCloseModal = () => {
        if (isFormDirty()) {
            setShowDiscardConfirm(true);
        } else {
            setIsModalOpen(false);
            setNewItem({
                type: 'Income',
                name: '',
                amount: undefined,
                description: '',
                recurring: false,
                recurringType: 'forever',
                structureType: 'simple',
                status: 'finalized',
                subItems: [],
                recurringMode: 'as_it_is',
                installments: undefined,
                currency: 'VND'
            });
            setAmountInput("");
        }
    };

    const confirmDiscard = () => {
        setShowDiscardConfirm(false);
        setIsModalOpen(false);
        setNewItem({
            type: 'Income',
            name: '',
            amount: undefined,
            description: '',
            recurring: false,
            recurringType: 'forever',
            structureType: 'simple',
            status: 'finalized',
            subItems: [],
            recurringMode: 'as_it_is',
            installments: undefined,
            currency: 'VND'
        });
        setAmountInput("");
    };


    const removeItem = (item: FinanceItem) => {
        if (item.seriesId) {
            setItemToDelete(item);
        } else {
            setItems(items.filter(i => i.id !== item.id));
        }
    };

    const confirmDeleteOne = () => {
        if (itemToDelete) {
            setItems(items.filter(i => i.id !== itemToDelete.id));
            setItemToDelete(null);
        }
    };

    const confirmDeleteSeries = () => {
        if (itemToDelete && itemToDelete.seriesId) {
            setItems(items.filter(i => i.seriesId !== itemToDelete.seriesId));
            setItemToDelete(null);
        }
    };

    return (
        <div className="plan-body-container relative space-y-6">
            {/* Grid Layout */}
            <div
                ref={scrollRef}
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                className={cn(
                    "plan-months-grid flex pb-8 pt-4 hide-scrollbar select-none",
                    viewMode === 'vertical'
                        ? "flex-row gap-4 overflow-x-auto min-h-[700px] pb-10"
                        : "flex-col gap-6 overflow-y-auto min-h-[500px]",
                    isDragging ? "cursor-grabbing snap-none" : "cursor-grab snap-x"
                )}
            >
                {MONTHS.map((month, index) => {
                    const prevBalance = index > 0 ? calculateCumulativeTotal(items, index - 1, selectedYear, false, convertToAppCurrency) : 0;
                    const monthNet = calculateNetForMonth(items, index, selectedYear, false, convertToAppCurrency);
                    const cumulativeTotal = prevBalance + monthNet;

                    const projectedPrevBalance = index > 0 ? calculateCumulativeTotal(items, index - 1, selectedYear, true, convertToAppCurrency) : 0;
                    const projectedMonthNet = calculateNetForMonth(items, index, selectedYear, true, convertToAppCurrency);
                    const projectedCumulativeTotal = projectedPrevBalance + projectedMonthNet;
                    const hasProjectedDiff = projectedCumulativeTotal !== cumulativeTotal;

                    const monthItems = items
                        .filter(item =>
                            item.monthIndex === index && (item.year === selectedYear || (!item.year && selectedYear === ACTUAL_CURRENT_YEAR))
                        )
                        .sort((a, b) => {
                            const priority = monthOverrides[index]?.priority || globalPriority;
                            const sortOrder = monthOverrides[index]?.sort || globalSort;

                            if (a.type !== b.type) {
                                if (priority === 'Income') return a.type === 'Income' ? -1 : 1;
                                return a.type === 'Expense' ? -1 : 1;
                            }

                            return sortOrder === 'desc' ? b.amount - a.amount : a.amount - b.amount;
                        });

                    if (viewMode === 'horizontal') {
                        return (
                            <div
                                key={month}
                                className="plan-month-row group relative flex flex-row w-full min-h-[120px] border rounded-2xl bg-card/40 backdrop-blur-sm transition-all hover:shadow-xl hover:border-primary/50 hover:bg-card/60"
                            >
                                {/* Horizontal: Left Section (Month & Info) */}
                                <div className="plan-month-sidebar w-48 p-5 border-r bg-gradient-to-br from-primary/5 to-transparent flex flex-col justify-between shrink-0">
                                    <div className="flex flex-col justify-between h-full">
                                        <div>
                                            <h3 className="text-xl font-bold tracking-tight">
                                                {month}
                                                <div className="text-xs font-medium text-emerald-600/80 mt-1">{selectedYear}</div>
                                            </h3>

                                            {/* Column Controls */}
                                            <div className="flex items-center gap-1.5 mt-3">
                                                <button
                                                    onMouseDown={(e) => e.stopPropagation()}
                                                    id={`btn - priority - horizontal - ${index} `}
                                                    onClick={() => handlePrefToggle(index, 'priority')}
                                                    className={cn(
                                                        "p-1.5 rounded-lg transition-all flex items-center justify-center bg-background/50",
                                                        monthOverrides[index]?.priority
                                                            ? "border-[1.5px] border-primary/40 shadow-sm shadow-primary/10"
                                                            : "border-2 border-primary shadow-md shadow-primary/20"
                                                    )}
                                                    title={monthOverrides[index]?.priority ? t('tooltip.priority.custom') : t('tooltip.priority.global')}
                                                >
                                                    {(monthOverrides[index]?.priority || globalPriority) === 'Income' ? (
                                                        <TrendingUp size={14} className="text-emerald-500" />
                                                    ) : (
                                                        <TrendingDown size={14} className="text-rose-500" />
                                                    )}
                                                </button>
                                                <button
                                                    onMouseDown={(e) => e.stopPropagation()}
                                                    id={`btn - sort - horizontal - ${index} `}
                                                    onClick={() => handlePrefToggle(index, 'sort')}
                                                    className={cn(
                                                        "p-1.5 rounded-lg transition-all flex items-center justify-center bg-background/50",
                                                        monthOverrides[index]?.sort
                                                            ? "border-[1.5px] border-primary/40 shadow-sm shadow-primary/10"
                                                            : "border-2 border-primary shadow-md shadow-primary/20"
                                                    )}
                                                    title={monthOverrides[index]?.sort ? t('tooltip.sort.custom') : t('tooltip.sort.global')}
                                                >
                                                    {(monthOverrides[index]?.sort || globalSort) === 'desc' ? (
                                                        <ArrowDownWideNarrow size={14} className="text-primary" />
                                                    ) : (
                                                        <ArrowUpNarrowWide size={14} className="text-primary" />
                                                    )}
                                                </button>
                                                <button
                                                    onMouseDown={(e) => e.stopPropagation()}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedMonth(index);
                                                        setIsModalOpen(true);
                                                        setAmountInput("");
                                                    }}
                                                    className="p-1.5 rounded-lg transition-all flex items-center justify-center bg-background/50 border-2 border-primary shadow-md shadow-primary/20 hover:bg-primary hover:text-primary-foreground"
                                                    title={t('modal.add.title').replace('{type}', '').replace('{month}', month)}
                                                    id={`add - item - header - horizontal - ${index} `}
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2 mt-4">
                                            <div className={cn(
                                                "font-black text-lg leading-tight",
                                                cumulativeTotal >= 0 ? "text-emerald-600" : "text-rose-600"
                                            )}>
                                                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5 font-bold">{t('common.balance')}</div>
                                                {formatCurrency(cumulativeTotal, currencySymbol)}
                                            </div>
                                            {hasProjectedDiff && (
                                                <div className={cn(
                                                    "font-black text-xs opacity-60 flex flex-col pt-1 border-t border-white/5",
                                                    projectedCumulativeTotal >= 0 ? "text-emerald-500" : "text-rose-500"
                                                )}>
                                                    <div className="text-[8px] uppercase tracking-widest text-muted-foreground mb-0.5 font-black">{t('common.projected')}</div>
                                                    {formatCurrency(projectedCumulativeTotal, currencySymbol)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Horizontal: Middle Section (Items) */}
                                <div className="plan-month-items flex-1 p-4 flex flex-wrap content-start gap-3 relative">
                                    {index === 0 && items.length === 0 && (
                                        <div className="ai-gradient-box w-44 shrink-0 h-fit self-center">
                                            <Button
                                                onClick={onSample}
                                                variant="ghost"
                                                className="w-full font-black border-0 shadow-none hover:bg-transparent"
                                            >
                                                <span className="ai-gradient-text">{t('action.sample_data')}</span>
                                            </Button>
                                        </div>
                                    )}

                                    {index > 0 && (
                                        <div className="flex flex-col gap-2 w-32 shrink-0">
                                            <div className="flex flex-col p-2.5 rounded-xl border bg-primary/5 border-primary/10 text-primary/80 opacity-80 pointer-events-none">
                                                <span className="text-[9px] font-bold uppercase tracking-tighter opacity-70">{t('common.prev_balance')}</span>
                                                <div className="font-bold text-xs mt-0.5">{formatCurrency(prevBalance, currencySymbol)}</div>
                                            </div>
                                            {hasProjectedDiff && (
                                                <div className="flex flex-col p-2 rounded-xl border border-dashed border-primary/10 bg-primary/2 text-primary/40 opacity-50 pointer-events-none">
                                                    <span className="text-[8px] font-black uppercase tracking-widest">{t('common.projected')}</span>
                                                    <div className="font-black text-[10px]">{formatCurrency(projectedPrevBalance, currencySymbol)}</div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {monthItems.length > 0 && (
                                        <div
                                            className="flex flex-wrap content-start gap-3 relative flex-1"
                                            onMouseDown={handleVerticalMouseDown}
                                        >
                                            {monthItems.map(item => (
                                                <div
                                                    key={item.id}
                                                    onMouseEnter={(e) => handleItemMouseEnter(e, item)}
                                                    onMouseLeave={handleItemMouseLeave}
                                                    onDoubleClick={() => handleDoubleClick(item)}
                                                    className={cn(
                                                        "flex flex-col p-2.5 rounded-xl border transition-all hover:scale-[1.05] w-36 shrink-0 group/item relative overflow-hidden",
                                                        item.type === 'Income'
                                                            ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                                                            : "bg-rose-500/5 border-rose-500/20 text-rose-700 dark:text-rose-400",
                                                        item.status === 'not_finalized' && "grayscale opacity-80 border-dashed border-muted-foreground/40"
                                                    )}
                                                >
                                                    {item.status === 'not_finalized' && (
                                                        <div className="absolute top-0 right-0 px-1 py-0.5 bg-muted-foreground/20 text-[6px] font-black uppercase tracking-tighter rounded-bl-md border-l border-b border-muted-foreground/10 z-10">
                                                            {t('common.not_finalized')}
                                                        </div>
                                                    )}
                                                    <div className="flex justify-between items-start gap-2">
                                                        <div className="flex-1 min-w-0">
                                                            <span className="text-[10px] font-semibold truncate block leading-tight uppercase opacity-80">{item.name}</span>
                                                            {item.description && (
                                                                <span className="text-[9px] truncate block opacity-60 mt-0.5">{item.description}</span>
                                                            )}
                                                        </div>
                                                        <button
                                                            onMouseDown={(e) => e.stopPropagation()}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                removeItem(item);
                                                            }}
                                                            className="opacity-0 group-hover/item:opacity-100 p-0.5 hover:bg-destructive/10 rounded-md transition-all text-destructive"
                                                        >
                                                            <Trash2 size={10} />
                                                        </button>
                                                    </div>
                                                    <div className="flex justify-between items-center mt-1">
                                                        <span className="text-xs font-bold">
                                                            {item.type === 'Income' ? '+' : '-'}{formatCurrency(item.amount, currencySymbol)}
                                                        </span>
                                                        {item.recurring && (
                                                            <div className="flex items-center gap-1 opacity-60">
                                                                <Calendar size={10} />
                                                                <span className="text-[8px] font-bold">{t('common.series')}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {item.installmentIndex && (
                                                        <div className="mt-1 text-[8px] font-black uppercase tracking-widest opacity-40">
                                                            {item.type === 'Income' ? t('common.payment') : t('common.installment')} {item.installmentIndex}/{item.installments}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <button
                                        onMouseDown={(e) => e.stopPropagation()}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedMonth(index);
                                            setIsModalOpen(true);
                                            setAmountInput("");
                                        }}
                                        className="h-10 w-10 border-2 border-dashed border-muted/50 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:border-primary hover:bg-primary/5 text-muted-foreground hover:text-primary shrink-0 self-center"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>
                            </div>
                        );
                    }

                    return (
                        <div
                            key={month}
                            className="plan-month-column group relative flex flex-col h-[650px] w-[200px] shrink-0 border rounded-2xl bg-card/40 backdrop-blur-sm transition-all hover:shadow-2xl hover:border-primary/50 hover:-translate-y-1 snap-start"
                        >
                            {/* Month Header */}
                            <div className="plan-month-header p-5 border-b bg-gradient-to-br from-primary/10 to-transparent rounded-t-2xl space-y-3">
                                <h3 className="text-lg font-bold text-center tracking-tight flex items-center justify-center gap-1.5 grayscale-[0.5]">
                                    <span className="text-foreground">{month}</span>
                                    <span className="text-sm font-medium text-emerald-600/80"> - {selectedYear}</span>
                                </h3>

                                {/* Column Controls */}
                                <div className="flex items-center justify-center gap-2">
                                    <button
                                        onMouseDown={(e) => e.stopPropagation()}
                                        id={`btn - priority - ${index} `}
                                        onClick={() => handlePrefToggle(index, 'priority')}
                                        className={cn(
                                            "p-1.5 rounded-lg transition-all flex items-center justify-center bg-background/50",
                                            monthOverrides[index]?.priority
                                                ? "border-[1.5px] border-primary/40 shadow-sm shadow-primary/10"
                                                : "border-2 border-primary shadow-md shadow-primary/20"
                                        )}
                                        title={monthOverrides[index]?.priority ? t('tooltip.priority.custom') : t('tooltip.priority.global')}
                                    >
                                        {(monthOverrides[index]?.priority || globalPriority) === 'Income' ? (
                                            <TrendingUp size={14} className="text-emerald-500" />
                                        ) : (
                                            <TrendingDown size={14} className="text-rose-500" />
                                        )}
                                    </button>
                                    <button
                                        onMouseDown={(e) => e.stopPropagation()}
                                        id={`btn - sort - ${index} `}
                                        onClick={() => handlePrefToggle(index, 'sort')}
                                        className={cn(
                                            "p-1.5 rounded-lg transition-all flex items-center justify-center bg-background/50",
                                            monthOverrides[index]?.sort
                                                ? "border-[1.5px] border-primary/40 shadow-sm shadow-primary/10"
                                                : "border-2 border-primary shadow-md shadow-primary/20"
                                        )}
                                        title={monthOverrides[index]?.sort ? t('tooltip.sort.custom') : t('tooltip.sort.global')}
                                    >
                                        {(monthOverrides[index]?.sort || globalSort) === 'desc' ? (
                                            <ArrowDownWideNarrow size={14} className="text-primary" />
                                        ) : (
                                            <ArrowUpNarrowWide size={14} className="text-primary" />
                                        )}
                                    </button>
                                    <button
                                        onMouseDown={(e) => e.stopPropagation()}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedMonth(index);
                                            setIsModalOpen(true);
                                            setAmountInput("");
                                        }}
                                        className="p-1.5 rounded-lg transition-all flex items-center justify-center bg-background/50 border-2 border-primary shadow-md shadow-primary/20 hover:bg-primary hover:text-primary-foreground"
                                        title={t('modal.add.title').replace('{type}', '').replace('{month}', month)}
                                        id={`add - item - header - ${index} `}
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>
                            </div>

                            <div className="plan-month-content flex-1 relative overflow-hidden group/list flex flex-col">
                                <div
                                    className={cn(
                                        "plan-month-items flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar no-scrollbar select-none",
                                        isDraggingVertical ? "cursor-grabbing" : "cursor-grab"
                                    )}
                                    id={`month - items - ${index} `}
                                    onScroll={(e) => handleMonthScroll(e, index)}
                                    onMouseDown={handleVerticalMouseDown}
                                >
                                    {index === 0 && items.length === 0 && (
                                        <div className="ai-gradient-box mb-4">
                                            <Button
                                                onClick={onSample}
                                                variant="ghost"
                                                className="w-full font-black border-0 shadow-none hover:bg-transparent"
                                            >
                                                <span className="ai-gradient-text">{t('action.sample_data')}</span>
                                            </Button>
                                        </div>
                                    )}

                                    {index > 0 && (
                                        <div className="flex flex-col gap-2">
                                            <div className="flex flex-col p-2.5 rounded-xl border bg-primary/5 border-primary/10 text-primary/80 opacity-80 pointer-events-none">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-semibold truncate leading-tight">{t('common.prev_balance_long')}</span>
                                                    <div className="mt-1 font-bold text-sm">
                                                        {formatCurrency(prevBalance, currencySymbol)}
                                                    </div>
                                                </div>
                                            </div>
                                            {hasProjectedDiff && (
                                                <div className="flex flex-col p-2 rounded-xl border border-dashed border-primary/10 bg-primary/2 text-primary/40 opacity-50 pointer-events-none">
                                                    <span className="text-[8px] font-black uppercase tracking-widest leading-none">{t('common.projected')}</span>
                                                    <div className="mt-0.5 font-black text-xs">
                                                        {formatCurrency(projectedPrevBalance, currencySymbol)}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {monthItems.map(item => (
                                        <div
                                            key={item.id}
                                            onMouseEnter={(e) => handleItemMouseEnter(e, item)}
                                            onMouseLeave={handleItemMouseLeave}
                                            onDoubleClick={() => handleDoubleClick(item)}
                                            className={cn(
                                                "relative flex flex-col p-2.5 rounded-xl border transition-all hover:scale-[1.02] group/item overflow-hidden",
                                                item.type === 'Income'
                                                    ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                                                    : "bg-rose-500/5 border-rose-500/20 text-rose-700 dark:text-rose-400",
                                                item.status === 'not_finalized' && "grayscale opacity-80 border-dashed border-muted-foreground/40"
                                            )}
                                        >
                                            {item.status === 'not_finalized' && (
                                                <div className="absolute top-0 right-0 px-1 py-0.5 bg-muted-foreground/20 text-[6px] font-black uppercase tracking-tighter rounded-bl-md border-l border-b border-muted-foreground/10 z-10">
                                                    {t('common.not_finalized')}
                                                </div>
                                            )}
                                            <div className="flex justify-between items-start gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <span className="text-xs font-semibold truncate block leading-tight">{item.name}</span>
                                                    {item.description && (
                                                        <span className="text-[10px] truncate block opacity-60 mt-0.5">{item.description}</span>
                                                    )}
                                                </div>
                                                <button
                                                    onMouseDown={(e) => e.stopPropagation()}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        removeItem(item);
                                                    }}
                                                    className="opacity-0 group-hover/item:opacity-100 p-1 hover:bg-destructive/10 rounded-md transition-all text-destructive"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                            <div className="flex justify-between items-center mt-1">
                                                <span className="text-sm font-bold">
                                                    {item.type === 'Income' ? '+' : '-'}{formatCurrency(convert(item.amount, item.currency || 'VND', currencySymbol), currencySymbol)}
                                                </span>
                                                {item.recurring && (
                                                    <Calendar size={12} className="opacity-60" />
                                                )}
                                            </div>
                                            {item.installmentIndex && (
                                                <div className="mt-1 text-[8px] font-black uppercase tracking-widest opacity-40">
                                                    {item.type === 'Income' ? t('common.payment') : t('common.installment')} {item.installmentIndex}/{item.installments}
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    {monthItems.length === 0 && (
                                        <div className="flex-1 flex items-center justify-center text-muted-foreground/10 group-hover:text-primary/10 transition-colors py-10">
                                            <Plus size={64} strokeWidth={1} />
                                        </div>
                                    )}

                                    {/* Hover Plus Button */}
                                    <div className="flex justify-center pt-2">
                                        <button
                                            onMouseDown={(e) => e.stopPropagation()}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedMonth(index);
                                                setIsModalOpen(true);
                                                setAmountInput("");
                                            }}
                                            className="h-12 w-12 border-2 border-dashed border-muted rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:border-primary hover:bg-primary/5 text-muted-foreground hover:text-primary shrink-0 mb-4"
                                        >
                                            <Plus size={24} />
                                        </button>
                                    </div>
                                </div>

                                {/* Fade and Arrow effect for overflowing content */}
                                {monthItems.length > 5 && !scrolledMonths[index] && (
                                    <>
                                        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-card to-transparent pointer-events-none z-10 opacity-80 animate-in fade-in duration-300" />
                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce z-20 pointer-events-none opacity-50">
                                            <div className="relative">
                                                <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                                                <ChevronDown size={14} className="text-primary" />
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Month Footer (Total) */}
                            <div className={cn(
                                "p-4 border-t text-center font-bold text-lg rounded-b-2xl",
                                cumulativeTotal >= 0 ? "text-emerald-600" : "text-rose-600"
                            )}>
                                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5 font-medium">{t('common.total_balance')}</div>
                                {formatCurrency(cumulativeTotal, currencySymbol)}
                                {hasProjectedDiff && (
                                    <div className={cn(
                                        "text-[10px] font-black uppercase tracking-widest opacity-60 mt-1 pt-1 border-t border-white/5",
                                        projectedCumulativeTotal >= 0 ? "text-emerald-500" : "text-rose-500"
                                    )}>
                                        <span className="text-muted-foreground mr-1">{t('common.projected')}:</span>
                                        {formatCurrency(projectedCumulativeTotal, currencySymbol)}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Add Item Modal */}
            <AbstractModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={t('modal.add.title')
                    .replace('{type}', newItem.type === 'Income' ? t('modal.add.type.income') : t('modal.add.type.expense'))
                    .replace('{month}', MONTHS[selectedMonth])}
                maxWidth={newItem.structureType === 'bundle' ? '7xl' : '2xl'}
                className={cn("transition-all duration-300 ease-in-out", newItem.structureType === 'bundle' && "!max-w-[95vw]")}
            >
                <form onSubmit={handleAddItem} className="space-y-6">

                    <div className={cn("grid gap-8 transition-all duration-300", newItem.structureType === 'bundle' ? "grid-cols-1 md:grid-cols-12" : "grid-cols-1")}>
                        <div className={cn("space-y-4", newItem.structureType === 'bundle' && "md:col-span-4")}>
                            {/* Type Toggle */}
                            <div className="flex p-1 bg-muted rounded-lg gap-1">
                                <button
                                    type="button"
                                    id="btn-type-income"
                                    onClick={() => setNewItem({ ...newItem, type: 'Income' })}
                                    className={cn(
                                        "flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all",
                                        newItem.type === 'Income' ? "bg-background shadow-sm text-emerald-600" : "hover:bg-background/50 text-muted-foreground"
                                    )}
                                >
                                    <TrendingUp size={16} /> {t('modal.add.type.income')}
                                </button>
                                <button
                                    type="button"
                                    id="btn-type-expense"
                                    onClick={() => setNewItem({ ...newItem, type: 'Expense' })}
                                    className={cn(
                                        "flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all",
                                        newItem.type === 'Expense' ? "bg-background shadow-sm text-rose-600" : "hover:bg-background/50 text-muted-foreground"
                                    )}
                                >
                                    <TrendingDown size={16} /> {t('modal.add.type.expense')}
                                </button>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="item-name">{t('modal.add.name.label')}</Label>
                                <Input
                                    id="item-name"
                                    placeholder={t('modal.add.name.placeholder')}
                                    value={newItem.name}
                                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="item-description">{t('modal.add.desc.label')} <span className="text-muted-foreground font-normal">{t('modal.add.desc.optional')}</span></Label>
                                <Input
                                    id="item-description"
                                    placeholder={t('modal.add.desc.placeholder')}
                                    value={newItem.description}
                                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                                />
                            </div>

                            <div className={cn("grid gap-4 border-t pt-4", newItem.structureType === 'simple' ? "grid-cols-1" : "grid-cols-2")}>
                                <div className="space-y-2">
                                    <Label>{t('modal.add.structure.label')}</Label>
                                    <div className="flex bg-muted rounded-md p-0.5 gap-0.5">
                                        <button
                                            type="button"
                                            onClick={() => setNewItem({
                                                ...newItem,
                                                structureType: 'simple',
                                                recurringMode: 'as_it_is',
                                                installments: undefined,
                                                recurringUntilDate: undefined
                                            })}
                                            className={cn(
                                                "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded text-xs font-medium transition-all whitespace-nowrap",
                                                newItem.structureType === 'simple' ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:bg-background/50"
                                            )}
                                        >
                                            <Package size={14} /> {t('modal.add.structure.simple')}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setNewItem({ ...newItem, structureType: 'bundle', recurringType: 'until_date' })}
                                            className={cn(
                                                "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded text-xs font-medium transition-all whitespace-nowrap",
                                                newItem.structureType === 'bundle' ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:bg-background/50"
                                            )}
                                        >
                                            <Layers size={14} /> {t('modal.add.structure.bundle')}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>{t('modal.add.status.label')}</Label>
                                    <div className="flex bg-muted rounded-md p-0.5 gap-0.5">
                                        <button
                                            type="button"
                                            onClick={() => setNewItem({ ...newItem, status: 'finalized' })}
                                            className={cn(
                                                "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded text-xs font-medium transition-all whitespace-nowrap",
                                                newItem.status === 'finalized' ? "bg-background shadow-sm text-emerald-600" : "text-muted-foreground hover:bg-background/50"
                                            )}
                                        >
                                            <CheckCircle2 size={14} /> {t('modal.add.status.finalized')}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setNewItem({ ...newItem, status: 'not_finalized' })}
                                            className={cn(
                                                "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded text-xs font-medium transition-all whitespace-nowrap",
                                                newItem.status === 'not_finalized' ? "bg-background shadow-sm text-amber-600" : "text-muted-foreground hover:bg-background/50"
                                            )}
                                        >
                                            <Circle size={14} /> {t('modal.add.status.not_finalized')}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="item-amount">{t('modal.add.amount.label')}</Label>
                                    <div className="relative">
                                        <Input
                                            id="item-amount"
                                            type="text"
                                            inputMode="numeric"
                                            className={cn("pr-8", newItem.structureType === 'bundle' && "bg-muted cursor-not-allowed")}
                                            placeholder="0"
                                            value={amountInput}
                                            onChange={handleAmountChange}
                                            required
                                            readOnly={newItem.structureType === 'bundle'}
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm">
                                            {newItem.currency === 'VND' ? 'đ' : newItem.currency === 'USD' ? '$' : 'A$'}
                                        </span>
                                    </div>
                                    {newItem.structureType === 'bundle' && (
                                        <p className="text-[10px] text-muted-foreground italic">{t('modal.add.amount.bundle_hint')}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label>{t('modal.currency.title')}</Label>
                                    <select
                                        value={newItem.currency}
                                        onChange={(e) => setNewItem({ ...newItem, currency: e.target.value })}
                                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    >
                                        <option value="VND">VND</option>
                                        <option value="USD">USD</option>
                                        <option value="AUD">AUD</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-3 border-t pt-4">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="recurring" className="flex flex-col gap-0.5 cursor-pointer">
                                        <span className="text-sm font-semibold">{t('modal.add.recurring.label')}</span>
                                        <span className="text-[10px] text-muted-foreground font-normal">{t('modal.add.recurring.desc')}</span>
                                    </Label>
                                    <input
                                        type="checkbox"
                                        id="recurring"
                                        checked={newItem.recurring}
                                        onChange={(e) => setNewItem({ ...newItem, recurring: e.target.checked })}
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                </div>

                                {newItem.recurring && (
                                    <div className="p-3 bg-muted/50 rounded-xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="grid grid-cols-2 gap-3">
                                            {/* Recurring Option */}
                                            <div className="space-y-1.5">
                                                <Label className="text-xs">{t('modal.add.recurring_opt.label')}</Label>
                                                <select
                                                    className="w-full h-8 rounded-md border border-input bg-background px-2 py-0 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                                    value={newItem.recurringType}
                                                    onChange={(e) => setNewItem({ ...newItem, recurringType: e.target.value as 'forever' | 'until_date' })}
                                                >
                                                    <option value="forever" disabled={newItem.structureType === 'bundle'}>{t('modal.add.recurring_opt.forever')}</option>
                                                    <option value="until_date">{t('modal.add.recurring_opt.until')}</option>
                                                </select>
                                            </div>

                                            {/* Recurring Mode (Bundle Only) */}
                                            {newItem.structureType === 'bundle' && (
                                                <div className="space-y-1.5">
                                                    <Label className="text-xs">{t('modal.add.recurring_mode.label')}</Label>
                                                    <select
                                                        className="w-full h-8 rounded-md border border-input bg-background px-2 py-0 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                                        value={newItem.recurringMode}
                                                        onChange={(e) => {
                                                            const mode = e.target.value as RecurringMode;
                                                            let updates: any = { recurringMode: mode };

                                                            if (mode === 'installments') {
                                                                // Default to 12 installments if not set
                                                                const installCount = newItem.installments || 12;
                                                                updates.installments = installCount;

                                                                // Calculate last day of the target month
                                                                const endDate = new Date(selectedYear, selectedMonth + installCount, 0);
                                                                const y = endDate.getFullYear();
                                                                const m = String(endDate.getMonth() + 1).padStart(2, '0');
                                                                const d = String(endDate.getDate()).padStart(2, '0');
                                                                updates.recurringUntilDate = `${y}-${m}-${d}`;
                                                            }
                                                            setNewItem({ ...newItem, ...updates });
                                                        }}
                                                    >
                                                        <option value="as_it_is">{t('modal.add.recurring_mode.as_it_is')}</option>
                                                        <option value="installments">{t('modal.add.recurring_mode.installments')}</option>
                                                    </select>
                                                </div>
                                            )}

                                            {/* End Date */}
                                            {newItem.recurringType === 'until_date' && (
                                                <div className="space-y-1.5">
                                                    <Label htmlFor="end-date" className="text-xs">{t('modal.add.end_date')}</Label>
                                                    <DatePicker
                                                        id="end-date"
                                                        date={newItem.recurringUntilDate ? new Date(newItem.recurringUntilDate + 'T00:00:00') : undefined}
                                                        setDate={(date) => setNewItem({ ...newItem, recurringUntilDate: date ? format(date, 'yyyy-MM-dd') : undefined })}
                                                        disabled={newItem.structureType === 'bundle' && newItem.recurringMode === 'installments'}
                                                        className="h-8 text-xs w-full"
                                                    />
                                                </div>
                                            )}

                                            {/* Installments (Bundle + Installments Mode Only) */}
                                            {newItem.structureType === 'bundle' && newItem.recurringMode === 'installments' && (
                                                <div className="space-y-1.5">
                                                    <Label htmlFor="installments" className="text-xs">{t('modal.add.installments.label')}</Label>
                                                    <Input
                                                        id="installments"
                                                        type="number"
                                                        min="2"
                                                        max="120"
                                                        placeholder="12"
                                                        className="h-8 text-xs"
                                                        value={newItem.installments || ''}
                                                        onChange={(e) => {
                                                            const val = parseInt(e.target.value) || undefined;
                                                            let updates: any = { installments: val };

                                                            if (newItem.structureType === 'bundle' && val) {
                                                                // Calculate last day of the target month
                                                                const endDate = new Date(selectedYear, selectedMonth + val, 0);
                                                                const y = endDate.getFullYear();
                                                                const m = String(endDate.getMonth() + 1).padStart(2, '0');
                                                                const d = String(endDate.getDate()).padStart(2, '0');
                                                                updates.recurringUntilDate = `${y}-${m}-${d}`;
                                                            }
                                                            setNewItem({ ...newItem, ...updates });
                                                        }}
                                                        required
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sub-items Section (Conditional) */}
                        {newItem.structureType === 'bundle' && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300 md:col-span-8">
                                <div className="flex items-center justify-between border-b pb-2">
                                    <Label className="flex items-center gap-2">
                                        <Layers size={16} className="text-primary" />
                                        {t('modal.add.subitems.title')}
                                    </Label>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={addSubItem}
                                        className="h-7 text-xs gap-1"
                                        disabled={newItem.structureType !== 'bundle'}
                                    >
                                        <Plus size={12} /> {t('common.add')}
                                    </Button>
                                </div>

                                <div
                                    ref={subItemsContainerRef}
                                    className="flex flex-wrap gap-3 max-h-[300px] overflow-y-auto content-start p-1 hide-scrollbar"
                                >
                                    {newItem.subItems && newItem.subItems.length > 0 ? (
                                        newItem.subItems.map((sub, index) => (
                                            <div key={sub.id} className="flex-grow basis-[550px] max-w-full p-3 bg-muted/30 rounded-lg border space-y-2 relative group hover:border-primary/50 transition-colors">
                                                <div className="grid grid-cols-12 gap-2">
                                                    <div className="col-span-8">
                                                        <Input
                                                            placeholder={t('modal.add.subitem.name_placeholder')}
                                                            value={sub.name}
                                                            onChange={(e) => updateSubItem(sub.id, { name: e.target.value })}
                                                            className="h-8 text-xs bg-background"
                                                            autoFocus={index === (newItem.subItems?.length || 0) - 1}
                                                        />
                                                    </div>
                                                    <div className="col-span-4 relative">
                                                        <Input
                                                            type="text"
                                                            inputMode="numeric"
                                                            placeholder="0"
                                                            value={sub.price ? new Intl.NumberFormat('vi-VN').format(sub.price) : ''}
                                                            onChange={(e) => {
                                                                const raw = e.target.value.replace(/\D/g, '');
                                                                const val = parseInt(raw) || 0;
                                                                updateSubItem(sub.id, { price: val });
                                                            }}
                                                            className="h-8 text-xs bg-background pr-5"
                                                        />
                                                        <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">{currencySymbol}</span>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-12 gap-2">
                                                    <div className="col-span-4">
                                                        <div className="flex items-center gap-1.5 bg-background rounded-md border h-8 px-2">
                                                            <span className="text-[10px] text-muted-foreground">Qty:</span>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                value={sub.quantity || 1}
                                                                onChange={(e) => updateSubItem(sub.id, { quantity: parseInt(e.target.value) || 1 })}
                                                                className="w-full bg-transparent border-none focus:ring-0 text-xs p-0"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-span-8">
                                                        <Input
                                                            placeholder={t('modal.add.subitem.desc_placeholder')}
                                                            value={sub.description}
                                                            onChange={(e) => updateSubItem(sub.id, { description: e.target.value })}
                                                            className="h-8 text-[10px] bg-background italic"
                                                        />
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeSubItem(sub.id)}
                                                    className="absolute -top-1.5 -right-1.5 z-10 bg-destructive text-destructive-foreground p-1 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all hover:bg-destructive/90 hover:scale-110"
                                                >
                                                    <Trash2 size={10} />
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="w-full text-center py-12 border border-dashed rounded-lg bg-muted/10 flex flex-col items-center justify-center">
                                            <Package size={24} className="text-muted-foreground/30 mb-2" />
                                            <p className="text-xs text-muted-foreground">{t('modal.add.subitems.empty')}</p>
                                        </div>
                                    )}
                                </div>

                                {newItem.subItems && newItem.subItems.length > 0 && (
                                    <div className="pt-2 border-t flex justify-between items-center text-xs">
                                        <span className="font-medium text-muted-foreground">{t('modal.add.subitems.total_items', { count: newItem.subItems.length })}</span>
                                        <span className="font-bold text-primary">
                                            {formatCurrency(calculateBundleAmount(newItem.subItems), currencySymbol)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-center gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            id="btn-modal-cancel"
                            className="min-w-[140px] rounded-xl h-11"
                            onClick={handleCloseModal}
                        >
                            {t('common.cancel')}
                        </Button>
                        <Button
                            type="submit"
                            id="btn-modal-submit"
                            className="min-w-[140px] rounded-xl h-11 shadow-lg shadow-primary/20"
                        >
                            {t('modal.add.submit')}
                        </Button>
                    </div>
                </form>
            </AbstractModal>

            {/* Discard Changes Confirmation Modal */}
            <AbstractModal
                isOpen={showDiscardConfirm}
                onClose={() => setShowDiscardConfirm(false)}
                maxWidth="sm"
                className="z-[60]"
            >
                <div className="text-center space-y-4 pt-4">
                    <div className="mx-auto w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-600 mb-2">
                        <AlertTriangle size={24} />
                    </div>
                    <h3 className="text-xl font-bold">{t('modal.discard.title')}</h3>
                    <p className="text-muted-foreground text-sm">
                        {t('modal.discard.message')}
                    </p>
                    <div className="flex gap-3 pt-4">
                        <Button
                            variant="outline"
                            className="flex-1 rounded-xl h-11"
                            onClick={() => setShowDiscardConfirm(false)}
                        >
                            {t('modal.ai.keep_editing')}
                        </Button>
                        <Button
                            variant="destructive"
                            className="flex-1 rounded-xl h-11 shadow-lg shadow-rose-500/20"
                            onClick={confirmDiscard}
                        >
                            {t('modal.ai.discard')}
                        </Button>
                    </div>
                </div>
            </AbstractModal>

            {/* Recurring Deletion Confirmation Modal */}
            <AbstractModal
                isOpen={!!itemToDelete}
                onClose={() => setItemToDelete(null)}
                maxWidth="sm"
                className="z-[60]"
            >
                <div className="p-2 text-center space-y-4">
                    <div className="mx-auto w-12 h-12 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-600 mb-2">
                        <Trash2 size={24} />
                    </div>
                    <h3 className="text-xl font-bold">{t('modal.delete_series.title')}</h3>
                    <p className="text-muted-foreground text-sm">
                        {itemToDelete?.structureType === 'bundle' && itemToDelete?.recurringMode === 'installments'
                            ? t('modal.delete_series.message_installments')
                            : t('modal.delete_series.message')}
                    </p>
                    <div className="flex flex-col gap-2 pt-4">
                        <Button
                            className="w-full rounded-xl h-11 shadow-lg shadow-rose-500/20"
                            variant="destructive"
                            onClick={confirmDeleteSeries}
                        >
                            {t('modal.delete_series.all')}
                        </Button>
                        {/* Hide "Remove Just This One" for bundle installments */}
                        {!(itemToDelete?.structureType === 'bundle' && itemToDelete?.recurringMode === 'installments') && (
                            <Button
                                variant="outline"
                                className="w-full rounded-xl h-11"
                                onClick={confirmDeleteOne}
                            >
                                {t('modal.delete_series.one')}
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            className="w-full rounded-xl h-11"
                            onClick={() => setItemToDelete(null)}
                        >
                            {t('common.cancel')}
                        </Button>
                    </div>
                </div>
            </AbstractModal>

            {/* Edit Item Modal */}
            <AbstractModal
                isOpen={isEditModalOpen && !!editingItem}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setEditingItem(null);
                }}
                title={editingItem ? t('modal.edit.title').replace('{type}', editingItem.type === 'Income' ? t('modal.add.type.income') : t('modal.add.type.expense')) : ''}
                icon={<Plus size={20} className="rotate-45" />}
                maxWidth={editingItem?.structureType === 'bundle' ? '7xl' : '2xl'}
                className={cn("z-50", editingItem?.structureType === 'bundle' && "!max-w-[95vw]")}
            >
                {editingItem && (
                    <form onSubmit={handleUpdateSubmit} className="space-y-6">
                        <div className={`grid gap-6 ${editingItem.structureType === 'bundle' ? 'md:grid-cols-12' : ''}`}>
                            {/* Main Inputs Column */}
                            <div className={`space-y-4 ${editingItem.structureType === 'bundle' ? 'md:col-span-4' : ''}`}>
                                {/* Type Toggle (Read-only) */}
                                <div className="flex p-1 bg-muted rounded-lg gap-1 opacity-60 cursor-not-allowed">
                                    <button
                                        type="button"
                                        disabled
                                        className={cn(
                                            "flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all cursor-not-allowed",
                                            editingItem.type === 'Income' ? "bg-background shadow-sm text-emerald-600" : "text-muted-foreground"
                                        )}
                                    >
                                        <TrendingUp size={16} /> {t('modal.add.type.income')}
                                    </button>
                                    <button
                                        type="button"
                                        disabled
                                        className={cn(
                                            "flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all cursor-not-allowed",
                                            editingItem.type === 'Expense' ? "bg-background shadow-sm text-rose-600" : "text-muted-foreground"
                                        )}
                                    >
                                        <TrendingDown size={16} /> {t('modal.add.type.expense')}
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    <Label>{t('modal.add.structure.label')}</Label>
                                    <div className="flex bg-muted rounded-md p-0.5 gap-0.5 opacity-60 cursor-not-allowed">
                                        <button
                                            type="button"
                                            disabled
                                            className={cn(
                                                "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded text-xs font-medium transition-all whitespace-nowrap cursor-not-allowed",
                                                editingItem.structureType === 'simple' ? "bg-background shadow-sm text-primary" : "text-muted-foreground"
                                            )}
                                        >
                                            <Package size={14} /> {t('modal.add.structure.simple')}
                                        </button>
                                        <button
                                            type="button"
                                            disabled
                                            className={cn(
                                                "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded text-xs font-medium transition-all whitespace-nowrap cursor-not-allowed",
                                                editingItem.structureType === 'bundle' ? "bg-background shadow-sm text-primary" : "text-muted-foreground"
                                            )}
                                        >
                                            <Layers size={14} /> {t('modal.add.structure.bundle')}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="edit-name">{t('modal.add.name.label')}</Label>
                                    <Input
                                        id="edit-name"
                                        value={editingItem.name}
                                        onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-description">{t('modal.add.desc.label')} <span className="text-muted-foreground font-normal">{t('modal.add.desc.optional')}</span></Label>
                                    <Input
                                        id="edit-description"
                                        value={editingItem.description || ''}
                                        onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>{t('modal.add.status.label')}</Label>
                                    <div className="flex bg-muted rounded-md p-0.5 gap-0.5">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const preservedAmount = editingItem.structureType === 'bundle' && editingItem.subItems
                                                    ? calculateBundleAmount(editingItem.subItems)
                                                    : editingItem.amount;
                                                setEditingItem({ ...editingItem, status: 'finalized', amount: preservedAmount });
                                            }}
                                            className={cn(
                                                "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded text-xs font-medium transition-all whitespace-nowrap",
                                                (!editingItem.status || editingItem.status === 'finalized') ? "bg-background shadow-sm text-emerald-600" : "text-muted-foreground hover:bg-background/50"
                                            )}
                                        >
                                            <CheckCircle2 size={14} /> {t('modal.add.status.finalized')}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const preservedAmount = editingItem.structureType === 'bundle' && editingItem.subItems
                                                    ? calculateBundleAmount(editingItem.subItems)
                                                    : editingItem.amount;
                                                setEditingItem({ ...editingItem, status: 'not_finalized', amount: preservedAmount });
                                            }}
                                            className={cn(
                                                "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded text-xs font-medium transition-all whitespace-nowrap",
                                                editingItem.status === 'not_finalized' ? "bg-background shadow-sm text-amber-600" : "text-muted-foreground hover:bg-background/50"
                                            )}
                                        >
                                            <Circle size={14} /> {t('modal.add.status.not_finalized')}
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="edit-amount">{t('modal.add.amount.label')}</Label>
                                        <div className="relative">
                                            <Input
                                                id="edit-amount"
                                                type="text"
                                                inputMode="numeric"
                                                className={cn("pr-8", editingItem.structureType === 'bundle' && "bg-muted cursor-not-allowed")}
                                                value={editAmountInput}
                                                onChange={handleEditAmountChange}
                                                required
                                                readOnly={editingItem.structureType === 'bundle'}
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm">
                                                {editingItem.currency === 'VND' ? 'đ' : editingItem.currency === 'USD' ? '$' : 'A$'}
                                            </span>
                                        </div>
                                        {editingItem.structureType === 'bundle' && (
                                            <p className="text-[10px] text-muted-foreground italic">{t('modal.add.amount.bundle_hint')}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{t('modal.currency.title')}</Label>
                                        <select
                                            value={editingItem.currency}
                                            onChange={(e) => setEditingItem({ ...editingItem, currency: e.target.value })}
                                            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                        >
                                            <option value="VND">VND</option>
                                            <option value="USD">USD</option>
                                            <option value="AUD">AUD</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Recurring Information (Read-only for bundles) */}
                                {editingItem.recurring && editingItem.structureType === 'bundle' && (
                                    <div className="space-y-3 border-t pt-4">
                                        <div className="flex items-center justify-between">
                                            <Label className="flex flex-col gap-0.5">
                                                <span className="text-sm font-semibold">{t('modal.add.recurring.label')}</span>
                                                <span className="text-[10px] text-muted-foreground font-normal">{t('modal.edit.recurring_locked')}</span>
                                            </Label>
                                            <input
                                                type="checkbox"
                                                checked={true}
                                                disabled
                                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary opacity-50 cursor-not-allowed"
                                            />
                                        </div>

                                        <div className="p-3 bg-muted/50 rounded-xl space-y-3 opacity-60">
                                            {editingItem.recurringMode === 'installments' ? (
                                                <>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="space-y-1.5">
                                                            <Label className="text-xs">{t('modal.add.recurring_mode.label')}</Label>
                                                            <div className="w-full h-8 rounded-md border border-input bg-muted px-2 py-0 text-xs flex items-center cursor-not-allowed">
                                                                {t('modal.add.recurring_mode.installments')}
                                                            </div>
                                                        </div>

                                                        <div className="space-y-1.5">
                                                            <Label className="text-xs">{t('modal.add.installments.label')}</Label>
                                                            <div className="w-full h-8 rounded-md border border-input bg-muted px-2 py-0 text-xs flex items-center cursor-not-allowed">
                                                                {editingItem.installments}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {editingItem.recurringUntilDate && (
                                                        <div className="space-y-1.5">
                                                            <Label className="text-xs">{t('modal.add.end_date')}</Label>
                                                            <div className="w-full h-8 rounded-md border border-input bg-muted px-2 py-0 text-xs flex items-center cursor-not-allowed">
                                                                {editingItem.recurringUntilDate}
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <>
                                                    <div className="space-y-1.5">
                                                        <Label className="text-xs">{t('modal.add.recurring_mode.label')}</Label>
                                                        <div className="w-full h-8 rounded-md border border-input bg-muted px-2 py-0 text-xs flex items-center cursor-not-allowed">
                                                            {t('modal.add.recurring_mode.as_it_is')}
                                                        </div>
                                                    </div>

                                                    <div className="space-y-1.5">
                                                        <Label className="text-xs">{t('modal.add.recurring_option.label')}</Label>
                                                        <div className="w-full h-8 rounded-md border border-input bg-muted px-2 py-0 text-xs flex items-center cursor-not-allowed">
                                                            {editingItem.recurringType === 'forever'
                                                                ? t('modal.add.recurring_option.forever')
                                                                : t('modal.add.recurring_option.until_date')}
                                                        </div>
                                                    </div>

                                                    {editingItem.recurringType === 'until_date' && editingItem.recurringUntilDate && (
                                                        <div className="space-y-1.5">
                                                            <Label className="text-xs">{t('modal.add.end_date')}</Label>
                                                            <div className="w-full h-8 rounded-md border border-input bg-muted px-2 py-0 text-xs flex items-center cursor-not-allowed">
                                                                {editingItem.recurringUntilDate}
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="mt-4 p-3 bg-muted/30 rounded-lg border border-dashed border-muted">
                                    <p className="text-xs text-muted-foreground italic text-center">
                                        {editingItem.type === 'Income' ? t('modal.edit.warning_type_income') : t('modal.edit.warning_type')}
                                    </p>
                                </div>
                            </div>

                            {/* Sub-items Section (Conditional) */}
                            {editingItem.structureType === 'bundle' && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300 md:col-span-8">
                                    <div className="flex items-center justify-between border-b pb-2">
                                        <Label className="flex items-center gap-2">
                                            <Layers size={16} className="text-primary" />
                                            {t('modal.add.subitems.title')}
                                        </Label>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={addEditSubItem}
                                            className="h-7 text-xs gap-1"
                                        >
                                            <Plus size={12} /> {t('common.add')}
                                        </Button>
                                    </div>

                                    <div
                                        ref={editSubItemsContainerRef}
                                        className="flex flex-wrap gap-3 max-h-[400px] overflow-y-auto content-start p-1 hide-scrollbar"
                                    >
                                        {editingItem.subItems && editingItem.subItems.length > 0 ? (
                                            editingItem.subItems.map((sub, index) => (
                                                <div key={sub.id} className="flex-grow basis-[550px] max-w-full p-3 bg-muted/30 rounded-lg border space-y-2 relative group hover:border-primary/50 transition-colors">
                                                    <div className="grid grid-cols-12 gap-2">
                                                        <div className="col-span-8">
                                                            <Input
                                                                placeholder={t('modal.add.subitem.name_placeholder')}
                                                                value={sub.name}
                                                                onChange={(e) => updateEditSubItem(sub.id, { name: e.target.value })}
                                                                className="h-8 text-xs bg-background"
                                                                autoFocus={index === (editingItem.subItems?.length || 0) - 1}
                                                            />
                                                        </div>
                                                        <div className="col-span-4 relative">
                                                            <Input
                                                                type="text"
                                                                inputMode="numeric"
                                                                placeholder="0"
                                                                value={sub.price ? new Intl.NumberFormat('vi-VN').format(sub.price) : ''}
                                                                onChange={(e) => {
                                                                    const raw = e.target.value.replace(/\D/g, '');
                                                                    const val = parseInt(raw) || 0;
                                                                    updateEditSubItem(sub.id, { price: val });
                                                                }}
                                                                className="h-8 text-xs bg-background pr-5"
                                                            />
                                                            <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">{currencySymbol}</span>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-12 gap-2">
                                                        <div className="col-span-4">
                                                            <div className="flex items-center gap-1.5 bg-background rounded-md border h-8 px-2">
                                                                <span className="text-[10px] text-muted-foreground">Qty:</span>
                                                                <input
                                                                    type="number"
                                                                    min="1"
                                                                    value={sub.quantity || 1}
                                                                    onChange={(e) => updateEditSubItem(sub.id, { quantity: parseInt(e.target.value) || 1 })}
                                                                    className="w-full bg-transparent border-none focus:ring-0 text-xs p-0"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="col-span-8">
                                                            <Input
                                                                placeholder={t('modal.add.subitem.desc_placeholder')}
                                                                value={sub.description}
                                                                onChange={(e) => updateEditSubItem(sub.id, { description: e.target.value })}
                                                                className="h-8 text-[10px] bg-background italic"
                                                            />
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeEditSubItem(sub.id)}
                                                        className="absolute -top-1.5 -right-1.5 z-10 bg-destructive text-destructive-foreground p-1 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all hover:bg-destructive/90 hover:scale-110"
                                                    >
                                                        <Trash2 size={10} />
                                                    </button>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="w-full text-center py-12 border border-dashed rounded-lg bg-muted/10 flex flex-col items-center justify-center">
                                                <Package size={24} className="text-muted-foreground/30 mb-2" />
                                                <p className="text-xs text-muted-foreground">{t('modal.add.subitems.empty')}</p>
                                            </div>
                                        )}
                                    </div>

                                    {editingItem.subItems && editingItem.subItems.length > 0 && (
                                        <div className="pt-2 border-t flex justify-between items-center text-xs">
                                            <span className="font-medium text-muted-foreground">{t('modal.add.subitems.total_items', { count: editingItem.subItems.length })}</span>
                                            <span className="font-bold text-primary">
                                                {formatCurrency(calculateBundleAmount(editingItem.subItems), currencySymbol)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>


                        <div className="flex items-center justify-center gap-3 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                className="min-w-[140px] rounded-xl h-11"
                                onClick={() => {
                                    setIsEditModalOpen(false);
                                    setEditingItem(null);
                                }}
                            >
                                {t('common.cancel')}
                            </Button>
                            <Button
                                type="submit"
                                className="min-w-[140px] rounded-xl h-11 shadow-lg shadow-primary/20"
                            >
                                {t('modal.edit.submit')}
                            </Button>
                        </div>
                    </form>
                )}
            </AbstractModal>

            {/* Recurring Update Choice Modal */}
            <AbstractModal
                isOpen={showRecurringUpdateChoice}
                onClose={() => setShowRecurringUpdateChoice(false)}
                maxWidth="sm"
                className="z-[60]"
            >
                <div className="text-center space-y-4 p-2">
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-2">
                        <Calendar size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">{t('modal.update_series.title')}</h3>
                    <p className="text-sm text-muted-foreground px-2">
                        {t('modal.update_series.message')}
                    </p>
                    <div className="flex flex-col gap-2 pt-2">
                        <Button
                            variant="default"
                            className="w-full rounded-xl h-11"
                            onClick={handleUpdateSeries}
                        >
                            {t('modal.update_series.all')}
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full rounded-xl h-11"
                            onClick={handleUpdateSingle}
                        >
                            {t('modal.update_series.one')}
                        </Button>
                        <Button
                            variant="secondary"
                            className="w-full mt-2 rounded-xl h-11"
                            onClick={() => setShowRecurringUpdateChoice(false)}
                        >
                            {t('common.cancel')}
                        </Button>
                    </div>
                </div>
            </AbstractModal>

            {
                activeTooltip && createPortal(
                    <div
                        className="fixed z-[9999] pointer-events-none animate-in fade-in zoom-in-95 duration-200"
                        style={{
                            left: viewMode === 'vertical'
                                ? activeTooltip.rect.left + activeTooltip.rect.width / 2
                                : activeTooltip.rect.right + 12,
                            top: viewMode === 'vertical'
                                ? activeTooltip.rect.top - 8
                                : activeTooltip.rect.top,
                            transform: viewMode === 'vertical'
                                ? 'translate(-50%, -100%)'
                                : 'none'
                        }}
                    >
                        <div className="w-48 p-3 bg-popover text-popover-foreground rounded-xl border shadow-2xl backdrop-blur-md">
                            <div className="font-bold text-xs border-b pb-1.5 mb-1.5">{activeTooltip.item.name}</div>
                            <div className="text-[10px] opacity-80 leading-relaxed mb-1 italic">
                                "{activeTooltip.item.description || `${activeTooltip.item.name} - ${formatCurrency(convert(activeTooltip.item.amount, activeTooltip.item.currency || 'VND', currencySymbol), currencySymbol)} `}"
                            </div>

                            {activeTooltip.item.categoryIds && activeTooltip.item.categoryIds.length > 0 && (
                                <div className="mb-2 flex flex-wrap gap-1">
                                    {activeTooltip.item.categoryIds.map(catId => {
                                        const category = [...COMMON_CATEGORIES, ...userCategories].find(c => c.id === catId);
                                        if (!category) return null;
                                        const IconInfo = iconMap[category.icon || 'MoreHorizontal'] || MoreHorizontal;
                                        const isSystemCategory = category.translationKey.startsWith('category.');

                                        return (
                                            <div key={catId} className={`flex items-center gap-1 px-1.5 py-0.5 rounded-[4px] text-[9px] font-bold uppercase tracking-wider border ${category.type === 'Income'
                                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                                                : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                                                }`}>
                                                {IconInfo && <IconInfo size={10} />}
                                                <span>{isSystemCategory ? t(category.translationKey) : category.translationKey}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                            {activeTooltip.item.recurring && (
                                <div className="flex items-center gap-2 text-[9px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">
                                    <Calendar size={10} />
                                    <span>{t('tooltip.series_count').replace('{count}', items.filter(i => i.seriesId === activeTooltip.item.seriesId).length.toString())}</span>
                                </div>
                            )}
                        </div>
                    </div>,
                    document.body
                )
            }
        </div>
    );
}
