import { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslation } from "@/hooks/use-translation";
import { Search, ChevronDown, Check, X, Calendar, User } from "lucide-react";
import { FinanceItem } from '@/types/finance';
import { formatCurrency } from '@/utils/format';
import { useCurrency } from '@/providers/currency-provider';
import { cn } from '@/utils/cn';

interface SelectableItem {
    id: string; // This will be seriesId if recurring, else item id
    name: string;
    isRecurring: boolean;
    value: number; // For normal items, it's their amount. For recurring, maybe average or max? Let's use max for the label display.
    type: 'Income' | 'Expense';
    description?: string;
}

interface ItemSelectorDropdownProps {
    items: FinanceItem[];
    selectedIds: string[];
    onSelectionChange: (ids: string[]) => void;
    currencySymbol: string;
}

export function ItemSelectorDropdown({ items, selectedIds, onSelectionChange, currencySymbol }: ItemSelectorDropdownProps) {
    const { t } = useTranslation();
    const { convert } = useCurrency();
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 1000);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Group items for selection
    const selectableItems = useMemo(() => {
        const map = new Map<string, SelectableItem>();

        items.forEach(item => {
            const id = item.seriesId || item.id;
            const itemValueInAppCurrency = convert(item.amount, item.currency || 'VND', currencySymbol);
            if (!map.has(id)) {
                map.set(id, {
                    id,
                    name: item.name,
                    isRecurring: !!item.recurring,
                    value: itemValueInAppCurrency,
                    type: item.type,
                    description: item.description
                });
            } else {
                // If recurring, we might want to update value if it changes? 
                // Mostly recurring items have same value, but let's take max.
                const existing = map.get(id)!;
                if (itemValueInAppCurrency > existing.value) {
                    existing.value = itemValueInAppCurrency;
                }
            }
        });

        return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
    }, [items]);

    // Filter items based on debounced search
    const filteredItems = useMemo(() => {
        if (!debouncedSearch) return selectableItems;
        const lowerSearch = debouncedSearch.toLowerCase();
        return selectableItems.filter(item =>
            item.name.toLowerCase().includes(lowerSearch) ||
            (item.description?.toLowerCase().includes(lowerSearch)) ||
            item.value.toString().includes(lowerSearch)
        );
    }, [selectableItems, debouncedSearch]);

    // Handle selection
    const toggleItem = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const next = selectedIds.includes(id)
            ? selectedIds.filter(i => i !== id)
            : [...selectedIds, id];
        onSelectionChange(next);
    };

    // Close dropdown on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-muted/50 hover:bg-muted border border-white/5 rounded-xl transition-all text-sm font-medium"
            >
                <div className="flex -space-x-2 mr-1">
                    {selectedIds.length > 0 ? (
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-[10px] text-white font-bold ring-2 ring-background">
                            {selectedIds.length}
                        </div>
                    ) : (
                        <Search size={16} className="text-muted-foreground mr-1" />
                    )}
                </div>
                <span className="max-w-[120px] truncate">
                    {selectedIds.length === 0 ? t('dashboard.search_items') : `${selectedIds.length} items`}
                </span>
                <ChevronDown size={14} className={cn("transition-transform duration-300", isOpen && "rotate-180")} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-popover/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-[100] animate-in fade-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[400px]">
                    {/* Search Input */}
                    <div className="p-3 border-b border-white/5 relative">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                        <input
                            autoFocus
                            type="text"
                            placeholder={t('dashboard.search_items')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-muted/50 border border-white/5 rounded-lg py-1.5 pl-9 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="absolute right-5 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-md transition-colors"
                            >
                                <X size={12} />
                            </button>
                        )}
                    </div>

                    {/* Items List */}
                    <div className="overflow-y-auto flex-1 custom-scrollbar py-1">
                        {filteredItems.length === 0 ? (
                            <div className="px-4 py-8 text-center text-xs text-muted-foreground opacity-50">
                                No items found
                            </div>
                        ) : (
                            filteredItems.map(item => {
                                const isSelected = selectedIds.includes(item.id);
                                return (
                                    <div
                                        key={item.id}
                                        onClick={(e) => toggleItem(item.id, e)}
                                        className={cn(
                                            "px-4 py-3 flex items-center gap-3 cursor-pointer transition-colors relative group",
                                            isSelected ? "bg-primary/10" : "hover:bg-muted/50"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-4 h-4 rounded border flex items-center justify-center transition-all",
                                            isSelected ? "bg-primary border-primary" : "border-white/20 group-hover:border-white/40"
                                        )}>
                                            {isSelected && <Check size={10} className="text-white" />}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="font-bold text-sm truncate">{item.name}</span>
                                                <span className={cn(
                                                    "text-[10px] font-bold font-mono",
                                                    item.type === 'Income' ? 'text-emerald-500' : 'text-rose-500'
                                                )}>
                                                    {formatCurrency(item.value, currencySymbol)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <div className={cn(
                                                    "flex items-center gap-1 text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-md",
                                                    item.isRecurring ? "bg-blue-500/10 text-blue-500" : "bg-muted text-muted-foreground"
                                                )}>
                                                    {item.isRecurring ? <Calendar size={8} /> : <User size={8} />}
                                                    {item.isRecurring ? t('dashboard.recurring') : t('dashboard.normal')}
                                                </div>
                                                {item.description && (
                                                    <span className="text-[10px] text-muted-foreground truncate italic opacity-60">
                                                        {item.description}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Footer */}
                    {selectedIds.length > 0 && (
                        <div className="p-2 border-t border-white/5 bg-muted/20 flex justify-between items-center text-[10px]">
                            <span className="text-muted-foreground pl-2">{selectedIds.length} chosen</span>
                            <button
                                onClick={(e) => { e.stopPropagation(); onSelectionChange([]); }}
                                className="px-2 py-1 hover:text-rose-500 transition-colors font-bold uppercase tracking-widest"
                            >
                                Clear All
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
