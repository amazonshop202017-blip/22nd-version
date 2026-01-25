import { useMemo } from 'react';
import { Area, AreaChart, ResponsiveContainer, YAxis } from 'recharts';
import { Trade, calculateTradeMetrics } from '@/types/trade';
import { parseISO } from 'date-fns';

interface IntradayPnLChartProps {
  trades: Trade[];
}

export const IntradayPnLChart = ({ trades }: IntradayPnLChartProps) => {
  const chartData = useMemo(() => {
    if (trades.length === 0) return [];

    // Sort trades by entry time
    const sortedTrades = [...trades].sort((a, b) => {
      const aMetrics = calculateTradeMetrics(a);
      const bMetrics = calculateTradeMetrics(b);
      const aTime = aMetrics.openDate ? parseISO(aMetrics.openDate).getTime() : 0;
      const bTime = bMetrics.openDate ? parseISO(bMetrics.openDate).getTime() : 0;
      return aTime - bTime;
    });

    // Build cumulative P&L data
    let cumulativePnL = 0;
    const data = [{ index: 0, pnl: 0 }]; // Start at 0

    sortedTrades.forEach((trade, index) => {
      const metrics = calculateTradeMetrics(trade);
      cumulativePnL += metrics.netPnl;
      data.push({ index: index + 1, pnl: cumulativePnL });
    });

    return data;
  }, [trades]);

  const finalPnL = chartData.length > 0 ? chartData[chartData.length - 1].pnl : 0;
  const isPositive = finalPnL >= 0;

  // Calculate Y-axis domain with padding
  const yMin = Math.min(...chartData.map(d => d.pnl), 0);
  const yMax = Math.max(...chartData.map(d => d.pnl), 0);
  const padding = Math.max(Math.abs(yMax - yMin) * 0.1, 1);

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id={`dayChartGradient-${isPositive ? 'positive' : 'negative'}`} x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor={isPositive ? 'hsl(var(--profit))' : 'hsl(var(--loss))'}
                stopOpacity={0.3}
              />
              <stop
                offset="100%"
                stopColor={isPositive ? 'hsl(var(--profit))' : 'hsl(var(--loss))'}
                stopOpacity={0.05}
              />
            </linearGradient>
          </defs>
          <YAxis
            domain={[yMin - padding, yMax + padding]}
            hide
          />
          <Area
            type="monotone"
            dataKey="pnl"
            stroke={isPositive ? 'hsl(var(--profit))' : 'hsl(var(--loss))'}
            strokeWidth={2}
            fill={`url(#dayChartGradient-${isPositive ? 'positive' : 'negative'})`}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
