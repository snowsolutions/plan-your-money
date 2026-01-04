interface CurrencyRates {
    date: string;
    base: string;
    rates: Record<string, string>;
}

const CACHE_KEY = 'currency_rates_cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export const currencyService = {
    async fetchRates(): Promise<CurrencyRates | null> {
        const apiKey = import.meta.env.VITE_CURRENCY_FREAK_API_KEY;
        if (!apiKey) {
            console.error('VITE_CURRENCY_FREAK_API_KEY is missing');
            return null;
        }

        // Check cache
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
            try {
                const { data, timestamp } = JSON.parse(cached);
                if (Date.now() - timestamp < CACHE_DURATION) {
                    console.log('Using cached currency rates');
                    return data;
                }
            } catch (e) {
                console.error('Failed to parse cached rates', e);
            }
        }

        console.log('Fetching fresh currency rates...');
        try {
            const response = await fetch(`https://api.currencyfreaks.com/v2.0/rates/latest?apikey=${apiKey}&symbols=VND,AUD`);
            if (!response.ok) throw new Error('Failed to fetch rates');

            const data: CurrencyRates = await response.json();

            // Add USD: 1.0 explicitly as it's the base
            if (data.rates) {
                data.rates['USD'] = '1.0';
            }

            localStorage.setItem(CACHE_KEY, JSON.stringify({
                data,
                timestamp: Date.now()
            }));

            return data;
        } catch (err) {
            console.error('Currency API error:', err);
            return null;
        }
    },

    convert(amount: number, from: string, to: string, rates: Record<string, string> | undefined): number {
        if (!rates) return amount;

        // Map symbols back to currency codes if necessary
        // In our app we have symbols: đ ($), $ ($), A$ ($)
        // We need codes: VND, USD, AUD
        const getCode = (symbol: string) => {
            if (symbol === 'đ' || symbol === 'VND') return 'VND';
            if (symbol === '$' || symbol === 'USD') return 'USD';
            if (symbol === 'A$' || symbol === 'AUD') return 'AUD';
            return symbol;
        };

        const fromCode = getCode(from);
        const toCode = getCode(to);

        if (fromCode === toCode) return amount;

        const fromRate = parseFloat(rates[fromCode]);
        const toRate = parseFloat(rates[toCode]);

        if (isNaN(fromRate) || isNaN(toRate)) {
            console.warn(`Missing rate for ${fromCode} or ${toCode}`);
            return amount;
        }

        // Base is USD
        // 1 USD = fromRate FromCurrency
        // 1 USD = toRate ToCurrency
        // Amt / fromRate = AmtInUSD
        // AmtInUSD * toRate = AmtInToCurrency
        const amountInUSD = amount / fromRate;
        return amountInUSD * toRate;
    }
};
