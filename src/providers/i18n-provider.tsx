import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import enUsRaw from '../../i18n/en-us.csv?raw';
import viVnRaw from '../../i18n/vi-vn.csv?raw';
import { Loader2 } from 'lucide-react';

type Translations = Record<string, string>;

interface I18nContextProps {
    language: string;
    setLanguage: (lang: string) => void;
    t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextProps | undefined>(undefined);

export const useI18n = () => {
    const context = useContext(I18nContext);
    if (!context) {
        throw new Error('useI18n must be used within an I18nProvider');
    }
    return context;
};

// Simple CSV parser handling quotes
const parseCSV = (content: string): Translations => {
    const lines = content.split(/\r?\n/);
    const translations: Translations = {};

    lines.forEach(line => {
        if (!line.trim()) return;
        // Skip header
        if (line.trim().startsWith('key,value')) return;

        const firstComma = line.indexOf(',');
        if (firstComma === -1) return;

        const key = line.substring(0, firstComma).trim();
        let value = line.substring(firstComma + 1).trim();

        if (value.startsWith('"') && value.endsWith('"')) {
            value = value.substring(1, value.length - 1);
            // Handle double double-quotes as escaped quotes
            value = value.replace(/""/g, '"');
        }

        translations[key] = value;
    });

    return translations;
};

interface I18nProviderProps {
    children: ReactNode;
    initialLanguage?: string;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children, initialLanguage = 'en-us' }) => {
    const [language, setLanguage] = useState(initialLanguage);
    const [translations, setTranslations] = useState<Translations>({});
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        setIsReady(false);
        const load = () => {
            let content = enUsRaw;
            if (language === 'vi-vn') {
                content = viVnRaw;
            }

            const parsed = parseCSV(content);
            setTranslations(parsed);

            // Artificial delay for premium feel and to prevent flickering
            setTimeout(() => {
                setIsReady(true);
            }, 600);
        };

        load();
    }, [language]);

    const t = (key: string, params?: Record<string, string | number>): string => {
        let text = translations[key] || key;

        if (params) {
            Object.entries(params).forEach(([paramKey, paramValue]) => {
                text = text.replace(`{${paramKey}}`, String(paramValue));
            });
        }

        return text;
    };

    return (
        <I18nContext.Provider value={{ language, setLanguage, t }}>
            {!isReady && (
                <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#020617] text-white animate-in fade-in duration-500">
                    <div className="relative flex flex-col items-center gap-6">
                        {/* Outer Glow */}
                        <div className="absolute -inset-8 bg-primary/20 blur-3xl rounded-full animate-pulse" />

                        {/* Logo/Icon placeholder with spinning loader */}
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-emerald-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                            <div className="relative bg-slate-900 rounded-full p-4 border border-white/10 shadow-2xl">
                                <Loader2 size={42} className="text-primary animate-spin" />
                            </div>
                        </div>

                        {/* Text Loader */}
                        <div className="flex flex-col items-center gap-1">
                            <h2 className="text-lg font-black tracking-widest uppercase bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent">
                                FMA
                            </h2>
                            <div className="flex gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce"></span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <div className={isReady ? "opacity-100 transition-opacity duration-1000" : "opacity-0"}>
                {children}
            </div>
        </I18nContext.Provider>
    );
};
