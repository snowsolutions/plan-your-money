import { useTranslation } from "@/hooks/use-translation"
import { cn } from "@/utils/cn"

interface TopNavbarProps {
    activeTab: 'plan' | 'dashboard' | 'reports' | 'admin';
    onTabChange: (tab: 'plan' | 'dashboard' | 'reports' | 'admin') => void;
}

export function TopNavbar({ activeTab, onTabChange }: TopNavbarProps) {
    const { t } = useTranslation();

    const getTabClass = (tab: string) => {
        const isActive = activeTab === tab;
        const base = "h-full px-6 text-[10px] uppercase transition-all duration-200";
        if (isActive) {
            return `${base} font-bold tracking-[0.2em] border-b-2 border-primary text-primary bg-primary/5`;
        }
        return `${base} font-semibold tracking-[0.1em] text-muted-foreground hover:text-foreground hover:bg-muted/30`;
    };

    return (
        <nav className="top-navbar-container h-[30px] min-h-[30px] border-b bg-card/30 backdrop-blur-md flex items-center px-8 z-50">
            <div className="navbar-inner w-full flex h-full items-center">
                <div className="navbar-tabs flex h-full items-center gap-1">
                    <button
                        className={cn("nav-tab-button", getTabClass('plan'))}
                        onClick={() => onTabChange('plan')}
                    >
                        {t('nav.plan')}
                    </button>
                    <button
                        className={cn("nav-tab-button", getTabClass('dashboard'))}
                        onClick={() => onTabChange('dashboard')}
                    >
                        {t('nav.dashboard')}
                    </button>
                    <button
                        className="nav-tab-button h-full px-6 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all cursor-not-allowed opacity-50"
                        title="Available soon"
                    >
                        {t('nav.reports')}
                    </button>
                    <button
                        className={cn("nav-tab-button", getTabClass('admin'))}
                        onClick={() => onTabChange('admin')}
                    >
                        {t('nav.admin')}
                    </button>
                </div>
            </div>
        </nav>
    );
}
