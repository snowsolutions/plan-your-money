import React from 'react';
import { cn } from '@/utils/cn';
import { AbstractModal } from './abstract-modal';

export interface FunctionAction {
    id: string;
    label: string;
    description?: string;
    icon?: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
    active?: boolean;
}

export interface FunctionGroup {
    title: string;
    actions: FunctionAction[];
}

interface AbstractFunctionModalProps {
    isOpen: boolean;
    onClose: () => void;
    groups: FunctionGroup[];
    title?: string;
}

export function AbstractFunctionModal({ isOpen, onClose, groups, title = "Functions" }: AbstractFunctionModalProps) {
    return (
        <AbstractModal
            isOpen={isOpen}
            onClose={onClose}
            title={<h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">{title}</h3>}
            wrapperClassName="items-start justify-start p-6"
            className="mt-20 ml-8"
            maxWidth="sm"
            zIndex={100}
            headerClassName="bg-muted/30"
            bodyClassName="p-2"
        >
            {groups.map((group, gIndex) => (
                <div key={gIndex} className="mb-4 last:mb-0">
                    <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
                        {group.title}
                    </div>
                    <div className="space-y-1 mt-1">
                        {group.actions.map((action) => (
                            <button
                                key={action.id}
                                id={`btn-${action.id}`}
                                onClick={() => {
                                    action.onClick();
                                    onClose();
                                }}
                                disabled={action.disabled}
                                className={cn(
                                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                                    action.active
                                        ? "bg-primary/10 text-primary shadow-sm"
                                        : "hover:bg-muted text-muted-foreground hover:text-foreground",
                                    action.disabled && "opacity-40 cursor-not-allowed grayscale"
                                )}
                            >
                                {action.icon && (
                                    <span className={cn(
                                        "p-1.5 rounded-lg transition-colors",
                                        action.active ? "bg-primary/20" : "bg-muted group-hover:bg-background"
                                    )}>
                                        {action.icon}
                                    </span>
                                )}
                                <span className="flex-1 text-left">{action.label}</span>
                                {action.active && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            ))}
        </AbstractModal>
    );
}

