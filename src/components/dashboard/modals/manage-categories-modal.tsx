import { useState, useMemo } from 'react';
import { useTranslation } from '@/hooks/use-translation';
import { Search, ArrowUpDown, ArrowUp, ArrowDown, Plus, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CategoryDefinition, COMMON_CATEGORIES } from '@/types/category';
import { cn } from '@/utils/cn';
import { CategoryFormModal } from './category-form-modal';
import { AbstractModal } from '../../abstract-modal';

interface ManageCategoriesModalProps {
    isOpen: boolean;
    onClose: () => void;
    userCategories: CategoryDefinition[];
    onAddCategory: (cat: { name: string, type: 'Income' | 'Expense' }) => void;
    onEditCategory: (id: string, updates: { name: string, type: 'Income' | 'Expense' }) => void;
    onDeleteCategory: (id: string) => void;
}

export function ManageCategoriesModal({
    isOpen,
    onClose,
    userCategories,
    onAddCategory,
    onEditCategory,
    onDeleteCategory
}: ManageCategoriesModalProps) {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<'All' | 'Income' | 'Expense'>('All');
    const [sourceFilter, setSourceFilter] = useState<'All' | 'System' | 'User'>('All');
    const [sortConfig, setSortConfig] = useState<{ key: 'name' | 'type', direction: 'asc' | 'desc' }>({ key: 'name', direction: 'asc' });

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<(CategoryDefinition & { displayName: string, isSystem: boolean }) | null>(null);

    const allCategories = useMemo(() => {
        const system = COMMON_CATEGORIES.map(c => ({
            ...c,
            isSystem: true,
            displayName: t(c.translationKey)
        }));

        const user = userCategories.map(c => ({
            ...c,
            isSystem: false,
            displayName: c.translationKey
        }));

        return [...user, ...system];
    }, [userCategories, t]);

    const filteredItems = useMemo(() => {
        let items = allCategories;

        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            items = items.filter(i => i.displayName.toLowerCase().includes(lower));
        }

        if (typeFilter !== 'All') {
            items = items.filter(i => i.type === typeFilter);
        }

        if (sourceFilter !== 'All') {
            const isSys = sourceFilter === 'System';
            items = items.filter(i => i.isSystem === isSys);
        }

        return items.sort((a, b) => {
            const modifier = sortConfig.direction === 'asc' ? 1 : -1;
            if (sortConfig.key === 'name') {
                return a.displayName.localeCompare(b.displayName) * modifier;
            } else {
                return a.type.localeCompare(b.type) * modifier;
            }
        });
    }, [allCategories, searchTerm, typeFilter, sourceFilter, sortConfig]);

    const handleSort = (key: 'name' | 'type') => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const SortIcon = ({ colKey }: { colKey: 'name' | 'type' }) => {
        if (sortConfig.key !== colKey) return <ArrowUpDown size={14} className="opacity-30" />;
        return sortConfig.direction === 'asc' ? <ArrowUp size={14} className="text-primary" /> : <ArrowDown size={14} className="text-primary" />;
    };

    const title = (
        <div>
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                {t('category_mgmt.title')}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
                {t('category_mgmt.categories_found', { count: filteredItems.length })}
            </p>
        </div>
    );

    const actions = (
        <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-primary hover:bg-primary/90 gap-2"
        >
            <Plus size={16} />
            {t('category_mgmt.create_new')}
        </Button>
    );

    return (
        <AbstractModal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            actions={actions}
            maxWidth="4xl"
            zIndex={50}
            className="bg-popover"
            headerClassName="bg-muted/20"
            bodyClassName="p-0 flex flex-col"
        >
            <div className="p-4 border-b border-white/5 flex flex-wrap gap-4 items-center justify-between bg-card/10 shrink-0">
                <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                    <Input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder={t('dashboard.search_items')}
                        className="pl-9 bg-background/50 border-white/10"
                    />
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-muted/30 p-1 rounded-lg">
                        {(['All', 'Income', 'Expense'] as const).map(f => (
                            <button
                                key={f}
                                onClick={() => setTypeFilter(f)}
                                className={cn(
                                    "px-4 py-1.5 text-xs font-medium rounded-md transition-all",
                                    typeFilter === f
                                        ? "bg-primary text-primary-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                                )}
                            >
                                {f === 'All' ? t('common.all') : t(`common.${f.toLowerCase()}`)}
                            </button>
                        ))}
                    </div>

                    <div className="w-[1px] h-8 bg-white/10" />

                    <div className="flex items-center gap-2 bg-muted/30 p-1 rounded-lg">
                        {(['All', 'System', 'User'] as const).map(s => (
                            <button
                                key={s}
                                onClick={() => setSourceFilter(s)}
                                className={cn(
                                    "px-4 py-1.5 text-xs font-medium rounded-md transition-all",
                                    sourceFilter === s
                                        ? "bg-primary text-primary-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                                )}
                            >
                                {s === 'All' ? t('common.all') : s === 'System' ? t('category_mgmt.system_category') : t('category_mgmt.user_category')}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-auto custom-scrollbar min-h-[400px]">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-xs uppercase text-muted-foreground font-semibold sticky top-0 z-10 backdrop-blur-md">
                        <tr>
                            <th className="px-6 py-4 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => handleSort('name')}>
                                <div className="flex items-center gap-2">
                                    {t('category_mgmt.name')} <SortIcon colKey="name" />
                                </div>
                            </th>
                            <th className="px-6 py-4 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => handleSort('type')}>
                                <div className="flex items-center gap-2">
                                    {t('category_mgmt.type')} <SortIcon colKey="type" />
                                </div>
                            </th>
                            <th className="px-6 py-4 text-right">{t('category_mgmt.source')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filteredItems.map((item, idx) => (
                            <tr key={item.id || idx} className="group border-b border-white/5 hover:bg-muted/10 transition-colors">
                                <td className="py-2.5 px-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-foreground">
                                                {item.displayName}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground font-mono opacity-50">{item.id}</span>
                                        </div>

                                        {!item.isSystem && (
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => {
                                                        setSelectedCategory(item);
                                                        setIsEditModalOpen(true);
                                                    }}
                                                    className="p-1.5 hover:bg-primary/10 hover:text-primary rounded-md transition-colors text-muted-foreground"
                                                    title={t('category_mgmt.edit_category')}
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedCategory(item);
                                                        setIsDeleteModalOpen(true);
                                                    }}
                                                    className="p-1.5 hover:bg-rose-500/10 hover:text-rose-500 rounded-md transition-colors text-muted-foreground"
                                                    title={t('category_mgmt.delete_category')}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-3">
                                    <span className={cn(
                                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                                        item.type === 'Income'
                                            ? "bg-emerald-500/10 text-emerald-500"
                                            : "bg-rose-500/10 text-rose-500"
                                    )}>
                                        {t(`common.${item.type.toLowerCase()}`)}
                                    </span>
                                </td>
                                <td className="px-6 py-3 text-right">
                                    <span className={cn(
                                        "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border",
                                        item.isSystem
                                            ? "bg-blue-500/5 border-blue-500/20 text-blue-400"
                                            : "bg-purple-500/5 border-purple-500/20 text-purple-400"
                                    )}>
                                        {item.isSystem ? t('category_mgmt.system_category') : t('category_mgmt.user_category')}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {filteredItems.length === 0 && (
                            <tr>
                                <td colSpan={3} className="px-6 py-12 text-center text-muted-foreground opacity-50">
                                    No categories found matching your criteria.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <CategoryFormModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSave={onAddCategory}
                existingNames={allCategories.map(c => c.displayName)}
            />

            <CategoryFormModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedCategory(null);
                }}
                onSave={(updates) => {
                    if (selectedCategory) {
                        onEditCategory(selectedCategory.id, updates);
                    }
                }}
                existingNames={allCategories.map(c => c.displayName)}
                initialData={selectedCategory ? { name: selectedCategory.translationKey, type: selectedCategory.type } : undefined}
            />

            <AbstractModal
                isOpen={isDeleteModalOpen && !!selectedCategory}
                onClose={() => setIsDeleteModalOpen(false)}
                maxWidth="sm"
                zIndex={70}
                className="bg-popover"
            >
                <div className="p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle size={24} />
                    </div>
                    <h3 className="text-lg font-bold mb-2">{t('category_mgmt.delete_modal.title')}</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                        {t('category_mgmt.delete_modal.message')}
                        <br />
                        <span className="font-bold text-foreground mt-2 inline-block">"{selectedCategory?.displayName}"</span>
                    </p>
                    <div className="flex gap-3">
                        <Button variant="ghost" className="flex-1" onClick={() => setIsDeleteModalOpen(false)}>
                            {t('category_mgmt.delete_modal.cancel')}
                        </Button>
                        <Button
                            variant="destructive"
                            className="flex-1"
                            onClick={() => {
                                if (selectedCategory) {
                                    onDeleteCategory(selectedCategory.id);
                                    setIsDeleteModalOpen(false);
                                    setSelectedCategory(null);
                                }
                            }}
                        >
                            {t('category_mgmt.delete_modal.confirm')}
                        </Button>
                    </div>
                </div>
            </AbstractModal>
        </AbstractModal>
    );
}

