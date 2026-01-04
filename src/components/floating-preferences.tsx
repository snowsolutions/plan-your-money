import { useState } from 'react';
import { Settings, Moon, Sun, EyeOff, Eye } from 'lucide-react';
import { useTranslation } from "@/hooks/use-translation";
import { cn } from '@/utils/cn';
import { AbstractModal } from './abstract-modal';

interface FloatingPreferencesProps {
    currencySymbol: string;
    setCurrencySymbol: (symbol: string) => void;
    isBlurred: boolean;
    setIsBlurred: (blurred: boolean) => void;
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;
}

export function FloatingPreferences({
    currencySymbol,
    setCurrencySymbol,
    isBlurred,
    setIsBlurred,
    theme,
    setTheme
}: FloatingPreferencesProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [showCurrencyModal, setShowCurrencyModal] = useState(false);
    const { t, i18n: { language, changeLanguage } } = useTranslation();

    const currencies = [
        { label: t('currency.vnd'), symbol: 'đ' },
        { label: t('currency.usd'), symbol: '$' },
        { label: t('currency.aud'), symbol: 'A$' }
    ];

    return (
        <>
            {/* FAB Container */}
            <div
                className="fab-container fixed bottom-8 left-8 z-[200] flex flex-col-reverse items-center gap-4 group"
                onMouseEnter={() => setIsOpen(true)}
                onMouseLeave={() => setIsOpen(false)}
            >
                {/* Main FAB */}
                <button
                    className={cn(
                        "main-fab w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110",
                        isOpen && "rotate-90"
                    )}
                >
                    <Settings size={28} />
                </button>

                {/* Expanded Buttons */}
                <div className={cn(
                    "fab-expanded-actions flex flex-col items-center gap-3 transition-all duration-300 origin-bottom",
                    isOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-50 translate-y-10 pointer-events-none"
                )}>
                    {/* Theme Toggle */}
                    <button
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="fab-action-btn w-12 h-12 rounded-full bg-card border shadow-xl flex items-center justify-center hover:bg-muted transition-all hover:scale-110"
                        title={theme === 'dark' ? t('tooltip.theme.light') : t('tooltip.theme.dark')}
                    >
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    {/* Language Toggle */}
                    <button
                        onClick={() => changeLanguage(language === 'en-us' ? 'vi-vn' : 'en-us')}
                        className="fab-action-btn w-12 h-12 rounded-full bg-card border shadow-xl flex items-center justify-center hover:bg-muted transition-all hover:scale-110 group/lang"
                        title="Switch Language"
                    >
                        <span className="text-xs font-black uppercase tracking-tighter">
                            {language === 'en-us' ? 'EN' : 'VN'}
                        </span>
                    </button>

                    {/* Currency Select */}
                    <button
                        onClick={() => setShowCurrencyModal(true)}
                        className="fab-action-btn w-12 h-12 rounded-full bg-card border shadow-xl flex items-center justify-center hover:bg-muted transition-all hover:scale-110"
                        title={t('tooltip.currency')}
                    >
                        <span className="text-lg font-bold">{currencySymbol}</span>
                    </button>

                    {/* Blur Toggle */}
                    <button
                        onClick={() => setIsBlurred(!isBlurred)}
                        className={cn(
                            "fab-action-btn w-12 h-12 rounded-full border shadow-xl flex items-center justify-center transition-all hover:scale-110",
                            isBlurred ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted"
                        )}
                        title={isBlurred ? t('tooltip.blur.off') : t('tooltip.blur.on')}
                    >
                        {isBlurred ? <Eye size={20} /> : <EyeOff size={20} />}
                    </button>
                </div>
            </div>

            <AbstractModal
                isOpen={showCurrencyModal}
                onClose={() => setShowCurrencyModal(false)}
                title={<h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">{t('modal.currency.title')}</h3>}
                maxWidth="sm"
                zIndex={300}
                bodyClassName="p-2 space-y-1"
                headerClassName="bg-muted/30"
                showCloseButton={false}
            >
                {currencies.map((curr) => (
                    <button
                        key={curr.symbol}
                        onClick={() => {
                            setCurrencySymbol(curr.symbol);
                            setShowCurrencyModal(false);
                        }}
                        className={cn(
                            "currency-choice-btn w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all",
                            currencySymbol === curr.symbol ? "bg-primary/10 text-primary" : "hover:bg-muted"
                        )}
                    >
                        <span className="font-medium">{curr.label}</span>
                        <span className="text-lg font-bold">{curr.symbol}</span>
                    </button>
                ))}
            </AbstractModal>

            {/* Global Blur Overlay */}
            {isBlurred && (
                <div
                    className="global-blur-overlay fixed inset-0 z-[190] bg-background/20 backdrop-blur-[40px] transition-all duration-700 animate-in fade-in"
                    onClick={() => setIsBlurred(false)}
                />
            )}
        </>
    );
}

