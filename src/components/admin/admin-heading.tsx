import { Settings } from "lucide-react";
import { AbstractHeading } from "../abstract-heading";
import { useTranslation } from "@/hooks/use-translation";

export function AdminHeading() {
    const { t } = useTranslation();
    return (
        <AbstractHeading
            title={t('admin.title')}
            subtitle={t('admin.subtitle')}
            leading={
                <div className="admin-icon-container w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                    <Settings size={24} />
                </div>
            }
        />
    );
}
