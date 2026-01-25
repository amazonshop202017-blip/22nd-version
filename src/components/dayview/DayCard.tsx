import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Trade, calculateTradeMetrics } from '@/types/trade';
import { useGlobalFilters } from '@/contexts/GlobalFiltersContext';
import { IntradayPnLChart } from './IntradayPnLChart';
import { DayTradesTable } from './DayTradesTable';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface DayCardProps {
  date: Date;
  trades: Trade[];
}

export const DayCard = ({ date, trades }: DayCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { formatCurrency, classifyTradeOutcome } = useGlobalFilters();

  // Calculate day stats
  const dayStats = trades.reduce(
    (acc, trade) => {
      const metrics = calculateTradeMetrics(trade);
      const outcome = classifyTradeOutcome(metrics.netPnl, trade.savedReturnPercent, trade.breakEven);
      
      acc.netPnl += metrics.netPnl;
      acc.grossPnl += metrics.grossPnl;
      acc.totalTrades += 1;
      acc.totalQuantity += metrics.totalQuantity;
      acc.totalCommissions += metrics.totalCharges;
      
      if (outcome === 'win') {
        acc.winners += 1;
        acc.totalWins += metrics.netPnl;
      } else if (outcome === 'loss') {
        acc.losers += 1;
        acc.totalLosses += Math.abs(metrics.netPnl);
      } else {
        acc.breakeven += 1;
      }
      
      return acc;
    },
    {
      netPnl: 0,
      grossPnl: 0,
      totalTrades: 0,
      winners: 0,
      losers: 0,
      breakeven: 0,
      totalQuantity: 0,
      totalCommissions: 0,
      totalWins: 0,
      totalLosses: 0,
    }
  );

  // Win rate calculation: Wins / (Wins + Losses)
  const winsAndLosses = dayStats.winners + dayStats.losers;
  const winRate = winsAndLosses > 0 ? (dayStats.winners / winsAndLosses) * 100 : 0;

  // Profit Factor calculation
  const profitFactor = dayStats.totalLosses > 0
    ? dayStats.totalWins / dayStats.totalLosses
    : dayStats.totalWins > 0 ? Infinity : 0;

  const isProfit = dayStats.netPnl >= 0;
  const formattedDate = format(date, 'EEE, MMM d, yyyy');

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Card Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors"
      >
        <div className="text-muted-foreground">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="font-semibold text-foreground">{formattedDate}</span>
          <span className="text-muted-foreground">•</span>
          <span className={cn('font-semibold', isProfit ? 'text-profit' : 'text-loss')}>
            Net P&L {formatCurrency(dayStats.netPnl)}
          </span>
        </div>
      </button>

      {/* Card Body - Collapsed State */}
      <div className="px-5 pb-5">
        <div className="flex gap-6">
          {/* Chart Section */}
          <div className="w-[300px] h-[140px] flex-shrink-0">
            <IntradayPnLChart trades={trades} />
          </div>

          {/* Metrics Section */}
          <div className="flex-1 grid grid-cols-4 gap-x-6 gap-y-4">
            {/* Row 1 */}
            <div>
              <p className="text-xs text-muted-foreground mb-1">Total Trades</p>
              <p className="text-lg font-semibold text-foreground">{dayStats.totalTrades}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Winners</p>
              <p className="text-lg font-semibold text-foreground">{dayStats.winners}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Gross P&L</p>
              <p className={cn('text-lg font-semibold', isProfit ? 'text-profit' : 'text-loss')}>
                {formatCurrency(dayStats.grossPnl)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Commissions</p>
              <p className="text-lg font-semibold text-foreground">
                {formatCurrency(dayStats.totalCommissions, false)}
              </p>
            </div>

            {/* Row 2 */}
            <div>
              <p className="text-xs text-muted-foreground mb-1">Winrate</p>
              <p className="text-lg font-semibold text-foreground">{winRate.toFixed(0)}%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Losers</p>
              <p className="text-lg font-semibold text-foreground">{dayStats.losers}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Volume</p>
              <p className="text-lg font-semibold text-foreground">{dayStats.totalQuantity.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Profit Factor</p>
              <p className="text-lg font-semibold text-foreground">
                {profitFactor === Infinity ? '∞' : profitFactor === 0 ? '–' : profitFactor.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Expanded Trade Table */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-5 pt-5 border-t border-border">
                <DayTradesTable trades={trades} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
