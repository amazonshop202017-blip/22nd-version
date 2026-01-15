import { useState, useEffect, useCallback } from 'react';
import { Trade, TradeFormData, calculateTradeMetrics } from '@/types/trade';

const STORAGE_KEY = 'trading-journal-trades';

export const useTrades = () => {
  const [trades, setTrades] = useState<Trade[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Migrate old trades that don't have the entries array
        const migrated = parsed.map((trade: any) => {
          if (!trade.entries) {
            // Old format - convert to new format
            return {
              ...trade,
              instrument: trade.instrument || 'Equity',
              entries: [],
              notes: trade.notes || '',
            };
          }
          return trade;
        });
        setTrades(migrated);
        // Save migrated trades back to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      }
    } catch (error) {
      console.error('Error loading trades from localStorage:', error);
      setTrades([]);
    }
  }, []);

  const saveTrades = useCallback((newTrades: Trade[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newTrades));
    setTrades(newTrades);
  }, []);

  const addTrade = useCallback((data: TradeFormData) => {
    const newTrade: Trade = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveTrades([...trades, newTrade]);
    return newTrade;
  }, [trades, saveTrades]);

  const updateTrade = useCallback((id: string, data: TradeFormData) => {
    const updated = trades.map(trade =>
      trade.id === id
        ? { ...trade, ...data, updatedAt: new Date().toISOString() }
        : trade
    );
    saveTrades(updated);
  }, [trades, saveTrades]);

  const deleteTrade = useCallback((id: string) => {
    saveTrades(trades.filter(trade => trade.id !== id));
  }, [trades, saveTrades]);

  const getTradeById = useCallback((id: string) => {
    return trades.find(trade => trade.id === id);
  }, [trades]);

  // Stats calculations using the new calculateTradeMetrics
  const winningTrades = trades.filter(t => calculateTradeMetrics(t).netPnl > 0);
  const losingTrades = trades.filter(t => calculateTradeMetrics(t).netPnl < 0);
  const breakevenTrades = trades.filter(t => calculateTradeMetrics(t).netPnl === 0);
  
  const totalProfits = winningTrades.reduce((sum, t) => sum + calculateTradeMetrics(t).netPnl, 0);
  const totalLosses = Math.abs(losingTrades.reduce((sum, t) => sum + calculateTradeMetrics(t).netPnl, 0));
  
  // Calculate day-based stats
  const dayPnl = trades.reduce((acc, t) => {
    const metrics = calculateTradeMetrics(t);
    const day = metrics.closeDate ? metrics.closeDate.split('T')[0] : 'unknown';
    acc[day] = (acc[day] || 0) + metrics.netPnl;
    return acc;
  }, {} as Record<string, number>);
  
  const days = Object.values(dayPnl);
  const winningDaysCount = days.filter(p => p > 0).length;
  const losingDaysCount = days.filter(p => p < 0).length;
  const breakevenDaysCount = days.filter(p => p === 0).length;
  
  const stats = {
    netPnl: trades.reduce((sum, t) => sum + calculateTradeMetrics(t).netPnl, 0),
    totalTrades: trades.length,
    winningTrades: winningTrades.length,
    losingTrades: losingTrades.length,
    breakevenTrades: breakevenTrades.length,
    tradeWinRate: trades.length > 0 
      ? (winningTrades.length / trades.length) * 100 
      : 0,
    dayWinRate: days.length > 0 
      ? (winningDaysCount / days.length) * 100 
      : 0,
    winningDays: winningDaysCount,
    losingDays: losingDaysCount,
    breakevenDays: breakevenDaysCount,
    avgWin: winningTrades.length > 0 
      ? totalProfits / winningTrades.length 
      : 0,
    avgLoss: losingTrades.length > 0 
      ? -(totalLosses / losingTrades.length) 
      : 0,
    totalProfits,
    totalLosses,
    profitFactor: totalLosses > 0 ? totalProfits / totalLosses : (totalProfits > 0 ? Infinity : 0),
  };

  return {
    trades,
    stats,
    addTrade,
    updateTrade,
    deleteTrade,
    getTradeById,
  };
};
