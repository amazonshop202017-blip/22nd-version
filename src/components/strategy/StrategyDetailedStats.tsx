import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Info } from 'lucide-react';
import { Trade, calculateTradeMetrics } from '@/types/trade';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface StrategyDetailedStatsProps {
  trades: Trade[];
}

interface StatItemProps {
  label: string;
  value: string | number;
  subValue?: string;
  tooltip?: string;
  valueClassName?: string;
}

const StatItem = ({ label, value, subValue, tooltip, valueClassName }: StatItemProps) => (
  <div className="space-y-1">
    <div className="flex items-center gap-1.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      {tooltip && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="w-3.5 h-3.5 text-muted-foreground opacity-70" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs max-w-[200px]">{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
    <p className={cn("text-xl font-bold font-mono", valueClassName)}>
      {value}
    </p>
    {subValue && (
      <p className="text-xs text-muted-foreground">{subValue}</p>
    )}
  </div>
);

const StrategyDetailedStats = ({ trades }: StrategyDetailedStatsProps) => {
  const detailedStats = useMemo(() => {
    if (trades.length === 0) {
      return {
        netPnl: 0,
        netPnlPercent: 0,
        profitFactor: 0,
        avgWinner: 0,
        avgLoser: 0,
        avgNetTradePnl: 0,
        maxDailyDrawdown: 0,
        winPercent: 0,
        winCount: 0,
        lossCount: 0,
        breakEvenCount: 0,
        expectancy: 0,
        expectancyPercent: 0,
        avgHoldTime: 0,
        avgDailyDrawdown: 0,
        avgDailyWinPercent: 0,
        dailyWins: 0,
        dailyBreakEven: 0,
        dailyLosses: 0,
        avgTradeWinLoss: 0,
        avgPlannedR: 0,
        avgRealizedR: 0,
        avgDailyVolume: 0,
      };
    }

    const tradesWithMetrics = trades.map(trade => ({
      trade,
      metrics: calculateTradeMetrics(trade),
    }));

    // Basic stats
    const wins = tradesWithMetrics.filter(t => t.metrics.netPnl > 0);
    const losses = tradesWithMetrics.filter(t => t.metrics.netPnl < 0);
    const breakEven = tradesWithMetrics.filter(t => t.metrics.netPnl === 0);

    const totalPnl = tradesWithMetrics.reduce((sum, t) => sum + t.metrics.netPnl, 0);
    const totalInvested = tradesWithMetrics.reduce((sum, t) => {
      const side = t.metrics.positionSide || t.trade.side;
      const entries = t.trade.entries || [];
      if (side === 'LONG') {
        return sum + entries.filter(e => e.type === 'BUY').reduce((s, e) => s + e.quantity * e.price, 0);
      }
      return sum + entries.filter(e => e.type === 'SELL').reduce((s, e) => s + e.quantity * e.price, 0);
    }, 0);

    const netPnlPercent = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;

    const avgWinner = wins.length > 0 
      ? wins.reduce((sum, t) => sum + t.metrics.netPnl, 0) / wins.length 
      : 0;
    const avgLoser = losses.length > 0 
      ? Math.abs(losses.reduce((sum, t) => sum + t.metrics.netPnl, 0) / losses.length) 
      : 0;
    
    const profitFactor = avgLoser > 0 ? avgWinner / avgLoser : avgWinner > 0 ? Infinity : 0;
    const avgNetTradePnl = totalPnl / trades.length;

    const winRate = (wins.length / trades.length) * 100;
    const lossRate = (losses.length / trades.length) * 100;
    const expectancy = ((winRate / 100) * avgWinner) - ((lossRate / 100) * avgLoser);
    const expectancyPercent = totalInvested > 0 ? (expectancy / (totalInvested / trades.length)) * 100 : 0;

    // Average hold time
    const totalHoldMinutes = tradesWithMetrics.reduce((sum, t) => sum + t.metrics.durationMinutes, 0);
    const avgHoldMinutes = totalHoldMinutes / trades.length;

    // Daily aggregations
    const dailyData: { [date: string]: { pnl: number; trades: number; wins: number; quantity: number } } = {};
    
    tradesWithMetrics.forEach(({ trade, metrics }) => {
      if (!metrics.openDate) return;
      const dateKey = format(parseISO(metrics.openDate), 'yyyy-MM-dd');
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = { pnl: 0, trades: 0, wins: 0, quantity: 0 };
      }
      dailyData[dateKey].pnl += metrics.netPnl;
      dailyData[dateKey].trades += 1;
      dailyData[dateKey].quantity += metrics.totalQuantity;
      if (metrics.netPnl > 0) dailyData[dateKey].wins += 1;
    });

    const dailyPnls = Object.values(dailyData).map(d => d.pnl);
    const dailyWinRates = Object.values(dailyData).map(d => d.trades > 0 ? (d.wins / d.trades) * 100 : 0);
    const dailyVolumes = Object.values(dailyData).map(d => d.quantity);

    // Calculate drawdowns
    let cumulative = 0;
    let peak = 0;
    const drawdowns: number[] = [];
    
    dailyPnls.forEach(pnl => {
      cumulative += pnl;
      if (cumulative > peak) peak = cumulative;
      const drawdown = cumulative - peak;
      if (drawdown < 0) drawdowns.push(drawdown);
    });

    const maxDailyDrawdown = drawdowns.length > 0 ? Math.min(...drawdowns) : 0;
    const avgDailyDrawdown = drawdowns.length > 0 
      ? drawdowns.reduce((sum, d) => sum + d, 0) / drawdowns.length 
      : 0;

    // Daily win stats
    const winningDays = dailyPnls.filter(p => p > 0).length;
    const losingDays = dailyPnls.filter(p => p < 0).length;
    const breakEvenDays = dailyPnls.filter(p => p === 0).length;
    const avgDailyWinPercent = dailyWinRates.length > 0 
      ? dailyWinRates.reduce((sum, r) => sum + r, 0) / dailyWinRates.length 
      : 0;

    // Win/Loss ratio
    const avgTradeWinLoss = avgLoser > 0 ? avgWinner / avgLoser : avgWinner > 0 ? avgWinner : 0;

    // R-Multiple stats - use stored values only
    const tradesWithStoredR = tradesWithMetrics.filter(t => 
      t.trade.savedRMultiple !== undefined && t.trade.savedRMultiple !== null && isFinite(t.trade.savedRMultiple)
    );
    const avgRealizedR = tradesWithStoredR.length > 0 
      ? tradesWithStoredR.reduce((sum, t) => sum + (t.trade.savedRMultiple ?? 0), 0) / tradesWithStoredR.length 
      : 0;
    
    // Average daily volume
    const avgDailyVolume = dailyVolumes.length > 0 
      ? dailyVolumes.reduce((sum, v) => sum + v, 0) / dailyVolumes.length 
      : 0;

    return {
      netPnl: totalPnl,
      netPnlPercent,
      profitFactor: isFinite(profitFactor) ? profitFactor : 0,
      avgWinner,
      avgLoser,
      avgNetTradePnl,
      maxDailyDrawdown,
      winPercent: winRate,
      winCount: wins.length,
      lossCount: losses.length,
      breakEvenCount: breakEven.length,
      expectancy,
      expectancyPercent,
      avgHoldTime: avgHoldMinutes,
      avgDailyDrawdown,
      avgDailyWinPercent,
      dailyWins: winningDays,
      dailyBreakEven: breakEvenDays,
      dailyLosses: losingDays,
      avgTradeWinLoss,
      avgPlannedR: 1, // Planned R is typically 1R by definition
      avgRealizedR,
      avgDailyVolume,
    };
  }, [trades]);

  const formatCurrency = (value: number) => {
    const prefix = value >= 0 ? '' : '-';
    return `${prefix}₹${Math.abs(value).toFixed(2)}`;
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${Math.round(minutes)}m`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass-card rounded-xl p-6"
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {/* Row 1 */}
        <StatItem
          label="Net P&L"
          value={formatCurrency(detailedStats.netPnl)}
          subValue={`(${detailedStats.netPnlPercent.toFixed(2)}%)`}
          tooltip="Total net profit/loss for this strategy"
          valueClassName={detailedStats.netPnl >= 0 ? 'profit-text' : 'loss-text'}
        />
        <StatItem
          label="Profit factor"
          value={detailedStats.profitFactor.toFixed(2)}
          subValue={`(${formatCurrency(detailedStats.avgWinner)}/${formatCurrency(-detailedStats.avgLoser)})`}
          tooltip="Ratio of average winner to average loser"
        />
        <StatItem
          label="Avg net trade P&L"
          value={formatCurrency(detailedStats.avgNetTradePnl)}
          tooltip="Average net profit/loss per trade"
          valueClassName={detailedStats.avgNetTradePnl >= 0 ? 'profit-text' : 'loss-text'}
        />
        <StatItem
          label="Max daily net drawdown"
          value={formatCurrency(detailedStats.maxDailyDrawdown)}
          tooltip="Largest single-day decline from peak"
          valueClassName="loss-text"
        />

        {/* Row 2 */}
        <StatItem
          label="Win %"
          value={`${detailedStats.winPercent.toFixed(2)}%`}
          subValue={`(${detailedStats.winCount}/${detailedStats.breakEvenCount}/${detailedStats.lossCount})`}
          tooltip="Percentage of winning trades (wins/breakeven/losses)"
        />
        <StatItem
          label="Trade expectancy"
          value={formatCurrency(detailedStats.expectancy)}
          subValue={`(${detailedStats.expectancyPercent.toFixed(2)}%)`}
          tooltip="Expected profit per trade based on win rate and avg win/loss"
          valueClassName={detailedStats.expectancy >= 0 ? 'profit-text' : 'loss-text'}
        />
        <StatItem
          label="Avg hold time"
          value={formatTime(detailedStats.avgHoldTime)}
          tooltip="Average duration of trades"
        />
        <StatItem
          label="Avg daily net drawdown"
          value={formatCurrency(detailedStats.avgDailyDrawdown)}
          tooltip="Average daily drawdown amount"
          valueClassName="loss-text"
        />

        {/* Row 3 */}
        <StatItem
          label="Avg daily win %"
          value={`${detailedStats.avgDailyWinPercent.toFixed(2)}%`}
          subValue={`(${detailedStats.dailyWins}/${detailedStats.dailyBreakEven}/${detailedStats.dailyLosses})`}
          tooltip="Average win rate per trading day"
        />
        <StatItem
          label="Avg trade win/loss"
          value={detailedStats.avgTradeWinLoss.toFixed(2)}
          tooltip="Ratio of average winning trade to average losing trade"
        />
        <StatItem
          label="Avg planned/realized R"
          value={`${detailedStats.avgPlannedR.toFixed(0)}R/${detailedStats.avgRealizedR.toFixed(2)}R`}
          tooltip="Comparison of planned vs actual R-multiple"
        />
        <StatItem
          label="Avg daily volume"
          value={detailedStats.avgDailyVolume.toFixed(2)}
          tooltip="Average quantity traded per day"
        />
      </div>
    </motion.div>
  );
};

export default StrategyDetailedStats;
