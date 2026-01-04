import React, { createContext, useContext, useState, useEffect } from 'react';
import { currencyService } from '@/services/currency-service';

interface CurrencyContextType {
    rates: Record<string, string> | undefined;
    isLoading: boolean;
    convert: (amount: number, from: string, to: string) => number;
    formatCurrency: (amount: number, currency: string) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [rates, setRates] = useState<Record<string, string> | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        currencyService.fetchRates().then(data => {
            if (data && data.rates) {
                setRates(data.rates);
            }
            setIsLoading(false);
        });
    }, []);

    const convert = (amount: number, from: string, to: string) => {
        return currencyService.convert(amount, from, to, rates);
    };

    const formatCurrency = (amount: number, currencyCode: string) => {
        // currencyCode can be 'VND', 'USD', 'AUD' or symbols
        const mapping: Record<string, { locale: string, code: string }> = {
            'VND': { locale: 'vi-VN', code: 'VND' },
            'đ': { locale: 'vi-VN', code: 'VND' },
            'USD': { locale: 'en-US', code: 'USD' },
            '$': { locale: 'en-US', code: 'USD' },
            'AUD': { locale: 'en-AU', code: 'AUD' },
            'A$': { locale: 'en-AU', code: 'AUD' },
        };

        const config = mapping[currencyCode] || { locale: 'en-US', code: 'USD' };

        return new Intl.NumberFormat(config.locale, {
            style: 'currency',
            currency: config.code,
            minimumFractionDigits: config.code === 'VND' ? 0 : 2,
            maximumFractionDigits: config.code === 'VND' ? 0 : 2,
        }).format(amount);
    };

    return (
        <CurrencyContext.Provider value={{ rates, isLoading, convert, formatCurrency }}>
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = () => {
    const context = useContext(CurrencyContext);
    if (!context) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
};
