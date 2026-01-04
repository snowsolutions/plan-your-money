import { AbstractFunctionModal, FunctionGroup } from '../../abstract-function-modal';
import { RefreshCw, Settings, FolderInput } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { useState } from 'react';
import { ManageCategoriesModal } from './manage-categories-modal';
import { CategoryDefinition } from '@/types/category';

interface DashboardFunctionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRefreshCategorization: () => void;
    userCategories: CategoryDefinition[];
    onAddCategory: (cat: { name: string, type: 'Income' | 'Expense' }) => void;
    onEditCategory: (id: string, updates: { name: string, type: 'Income' | 'Expense' }) => void;
    onDeleteCategory: (id: string) => void;
}

export function DashboardFunctionModal({
    isOpen,
    onClose,
    onRefreshCategorization,
    userCategories,
    onAddCategory,
    onEditCategory,
    onDeleteCategory
}: DashboardFunctionModalProps) {
    const { t } = useTranslation();
    const [isManageModalOpen, setIsManageModalOpen] = useState(false);

    const groups: FunctionGroup[] = [
        {
            title: t('dashboard.modal.group_analytic'),
            actions: [
                {
                    id: 'refresh-auto-cat',
                    label: t('dashboard.modal.refresh_auto_cat'),
                    icon: <RefreshCw size={16} className="text-blue-500" />,
                    onClick: onRefreshCategorization,
                    description: t('dashboard.modal.refresh_auto_cat_desc')
                }
            ]
        },
        {
            title: t('dashboard.modal.group_category_mgmt'),
            actions: [
                {
                    id: 'manage-cat',
                    label: t('dashboard.modal.manage_cat'),
                    icon: <Settings size={16} />,
                    onClick: () => {
                        setIsManageModalOpen(true);
                        // Don't close parent modal to allow going back if we supported it, 
                        // but usually stacking modals is ok, or we close this one.
                        // Let's close the function modal to keep UI clean? 
                        // Actually, let's keep it open or close it? 
                        // Standard behavior: clicking an action closes the menu.
                        onClose();
                    },
                    disabled: false
                },
                {
                    id: 'import-cat',
                    label: t('dashboard.modal.import_cat'),
                    icon: <FolderInput size={16} />,
                    onClick: () => { },
                    disabled: true
                }
            ]
        }
    ];

    if (isManageModalOpen) {
        return (
            <ManageCategoriesModal
                isOpen={true}
                onClose={() => setIsManageModalOpen(false)}
                userCategories={userCategories}
                onAddCategory={onAddCategory}
                onEditCategory={onEditCategory}
                onDeleteCategory={onDeleteCategory}
            />
        )
    }

    return (
        <AbstractFunctionModal
            isOpen={isOpen}
            onClose={onClose}
            groups={groups}
            title={t('dashboard.modal.title')}
        />
    );
}
