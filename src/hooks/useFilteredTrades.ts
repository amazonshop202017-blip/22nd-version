import { useMemo } from 'react';
import { Trade, calculateTradeMetrics } from '@/types/trade';
import { useGlobalFilters } from '@/contexts/GlobalFiltersContext';
import { isWithinInterval, parseISO, startOfDay, endOfDay } from 'date-fns';

export const useFilteredTrades = (trades: Trade[]): Trade[] => {
  const { dateRange, selectedAccounts } = useGlobalFilters();

  return useMemo(() => {
    let filtered = trades;

    // Filter by date range - use the first entry's datetime (openDate) for filtering
    if (dateRange.from || dateRange.to) {
      filtered = filtered.filter(trade => {
        const metrics = calculateTradeMetrics(trade);
        if (!metrics.openDate) return false;
        
        const tradeDate = parseISO(metrics.openDate);
        const from = dateRange.from ? startOfDay(dateRange.from) : new Date(0);
        const to = dateRange.to ? endOfDay(dateRange.to) : new Date(9999, 11, 31);
        
        return isWithinInterval(tradeDate, { start: from, end: to });
      });
    }

    // Filter by selected accounts
    if (selectedAccounts.length > 0) {
      filtered = filtered.filter(trade => 
        selectedAccounts.includes(trade.accountName)
      );
    }

    return filtered;
  }, [trades, dateRange, selectedAccounts]);
};
