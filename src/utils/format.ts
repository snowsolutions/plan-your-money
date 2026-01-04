export const formatCurrency = (amount: number, symbol: string = 'đ') => {
    return new Intl.NumberFormat('vi-VN', {
        maximumFractionDigits: 0
    }).format(amount) + symbol;
};
