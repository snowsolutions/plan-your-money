import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { ItemType } from '@/types/finance';
import { AbstractModal } from '../../abstract-modal';

interface CategoryFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (category: { name: string, type: ItemType }) => void;
    existingNames: string[];
    initialData?: { name: string, type: ItemType };
}

export function CategoryFormModal({ isOpen, onClose, onSave, existingNames, initialData }: CategoryFormModalProps) {
    const { t } = useTranslation();
    const [name, setName] = useState(initialData?.name || '');
    const [type, setType] = useState<ItemType>(initialData?.type || 'Expense');
    const [getError, setGetError] = useState('');

    const isEditMode = !!initialData;

    useEffect(() => {
        if (isOpen) {
            setName(initialData?.name || '');
            setType(initialData?.type || 'Expense');
            setGetError('');
        }
    }, [isOpen, initialData]);

    const handleSave = () => {
        if (!name.trim()) {
            setGetError(t('category_mgmt.create_modal.error_empty'));
            return;
        }

        const nameExists = existingNames.some(n =>
            n.toLowerCase() === name.trim().toLowerCase() &&
            (!isEditMode || n.toLowerCase() !== initialData.name.toLowerCase())
        );

        if (nameExists) {
            setGetError(t('category_mgmt.create_modal.error_exists'));
            return;
        }

        onSave({ name, type });
        onClose();
    }

    const title = (
        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            {isEditMode ? t('category_mgmt.edit_modal.title') : t('category_mgmt.create_modal.title')}
        </h2>
    );

    const footer = (
        <div className="flex justify-end gap-3 w-full">
            <Button variant="ghost" onClick={onClose}>
                {t('category_mgmt.create_modal.cancel')}
            </Button>
            <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
                {isEditMode ? t('category_mgmt.edit_modal.submit') : t('category_mgmt.create_modal.submit')}
            </Button>
        </div>
    );

    return (
        <AbstractModal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            maxWidth="md"
            zIndex={60}
            className="bg-popover"
            headerClassName="bg-muted/20"
            footer={footer}
        >
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label>{t('category_mgmt.create_modal.name_label')}</Label>
                    <Input
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                            setGetError('');
                        }}
                        placeholder="e.g., Office Supplies"
                        className="bg-muted/30 border-white/10"
                    />
                </div>

                <div className="space-y-2">
                    <Label>{t('category_mgmt.create_modal.type_label')}</Label>
                    <Select
                        value={type}
                        onChange={(e) => setType(e.target.value as ItemType)}
                        className="bg-muted/30 border-white/10"
                    >
                        <option value="Income" className="bg-popover text-popover-foreground">{t('common.income')}</option>
                        <option value="Expense" className="bg-popover text-popover-foreground">{t('common.expense')}</option>
                    </Select>
                </div>

                {getError && (
                    <p className="text-sm text-rose-500 font-medium">{getError}</p>
                )}
            </div>
        </AbstractModal>
    );
}

