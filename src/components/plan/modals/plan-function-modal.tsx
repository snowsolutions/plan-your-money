import { useTranslation } from "@/hooks/use-translation";
import { AbstractFunctionModal, FunctionGroup } from '../../abstract-function-modal';
import { FileUp, FileDown, LayoutList, LayoutGrid, Trash2 } from 'lucide-react';

interface PlanFunctionModalProps {
    isOpen: boolean;
    onClose: () => void;
    viewMode: 'vertical' | 'horizontal';
    setViewMode: (mode: 'vertical' | 'horizontal') => void;
    onImport: () => void;
    onExport: (encrypt?: boolean) => void;
    onClear: () => void;
    onSample: () => void;
}

export function PlanFunctionModal({ isOpen, onClose, viewMode, setViewMode, onImport, onExport, onClear, onSample }: PlanFunctionModalProps) {
    const { t } = useTranslation();
    const groups: FunctionGroup[] = [
        {
            title: t('modal.plan_function.group.import_export'),
            actions: [
                {
                    id: 'import',
                    label: t('action.import'),
                    icon: <FileUp size={16} />,
                    onClick: onImport,
                },
                {
                    id: 'export',
                    label: t('action.export'),
                    icon: <FileDown size={16} />,
                    onClick: () => onExport(false),
                },
                {
                    id: 'export-encrypted',
                    label: t('action.export_enc'),
                    icon: <FileDown size={16} className="text-emerald-500" />,
                    onClick: () => onExport(true),
                },
                {
                    id: 'clear',
                    label: t('action.clear_data'),
                    icon: <Trash2 size={16} className="text-rose-500" />,
                    onClick: onClear,
                },
                {
                    id: 'sample',
                    label: t('action.sample_data'),
                    icon: <FileUp size={16} className="text-blue-500" />,
                    onClick: onSample,
                }
            ]
        },
        {
            title: t('modal.plan_function.group.view_mode'),
            actions: [
                {
                    id: 'vertical',
                    label: t('action.view_vertical'),
                    icon: <LayoutGrid size={16} />,
                    onClick: () => setViewMode('vertical'),
                    active: viewMode === 'vertical'
                },
                {
                    id: 'horizontal',
                    label: t('action.view_horizontal'),
                    icon: <LayoutList size={16} />,
                    onClick: () => setViewMode('horizontal'),
                    active: viewMode === 'horizontal'
                }
            ]
        }
    ];

    return (
        <AbstractFunctionModal
            isOpen={isOpen}
            onClose={onClose}
            groups={groups}
            title={t('modal.plan_function.title')}
        />
    );
}
