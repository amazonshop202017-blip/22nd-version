import { useMemo } from 'react';
import { useTradesContext } from '@/contexts/TradesContext';
import { calculateTradeMetrics } from '@/types/trade';
import { motion } from 'framer-motion';
import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';
import { format } from 'date-fns';

interface ChartDataPoint {
  timeMinutes: number;
  timeDisplay: string;
  pnl: number;
  date: string;
  symbol: string;
  isProfit: boolean;
}

export const TradeTimePerformanceChart = () => {
  const { trades } = useTradesContext();

  const chartData = useMemo(() => {
    const data: ChartDataPoint[] = [];

    trades.forEach((trade) => {
      const metrics = calculateTradeMetrics(trade);
      
      // Get the first entry (opening) time
      const sortedEntries = [...trade.entries].sort(
        (a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
      );
      
      if (sortedEntries.length === 0) return;
      
      const entryDate = new Date(sortedEntries[0].datetime);
      if (isNaN(entryDate.getTime())) return;
      
      // Convert time to minutes from midnight for precise positioning
      const hours = entryDate.getHours();
      const minutes = entryDate.getMinutes();
      const timeMinutes = hours * 60 + minutes;
      
      data.push({
        timeMinutes,
        timeDisplay: format(entryDate, 'HH:mm'),
        pnl: metrics.netPnl,
        date: format(entryDate, 'MMM dd, yyyy'),
        symbol: trade.symbol,
        isProfit: metrics.netPnl >= 0,
      });
    });

    return data;
  }, [trades]);

  const formatCurrency = (value: number) => {
    const prefix = value >= 0 ? '$' : '-$';
    return `${prefix}${Math.abs(value).toFixed(0)}`;
  };

  // Convert minutes back to time format for X-axis
  const formatTimeAxis = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    return `${hours}:00`;
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as ChartDataPoint;
      return (
        <div className="glass-card rounded-lg px-3 py-2 shadow-lg border border-border/50">
          <p className="text-xs text-muted-foreground">{data.date}</p>
          <p className="text-sm font-medium">{data.symbol}</p>
          <p className="text-xs text-muted-foreground">
            Entry: {data.timeDisplay}
          </p>
          <p className={`text-sm font-bold font-mono ${data.isProfit ? 'profit-text' : 'loss-text'}`}>
            {data.pnl >= 0 ? '+' : ''}{formatCurrency(data.pnl)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (trades.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="glass-card rounded-xl p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-lg font-semibold">Trade Time Performance</h3>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Shows P&L by entry time of day</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
          No trades to display
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
      className="glass-card rounded-xl p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-lg font-semibold">Trade Time Performance</h3>
        <Tooltip>
          <TooltipTrigger>
            <Info className="h-4 w-4 text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent>
            <p>Shows P&L by entry time of day</p>
          </TooltipContent>
        </Tooltip>
      </div>
      
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="hsl(var(--border))" 
              strokeOpacity={0.5}
            />
            <XAxis
              type="number"
              dataKey="timeMinutes"
              domain={[0, 1440]}
              tickFormatter={formatTimeAxis}
              ticks={[0, 120, 240, 360, 480, 600, 720, 840, 960, 1080, 1200, 1320, 1440]}
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              type="number"
              dataKey="pnl"
              tickFormatter={formatCurrency}
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              width={60}
            />
            <RechartsTooltip content={<CustomTooltip />} />
            <ReferenceLine 
              y={0} 
              stroke="hsl(var(--muted-foreground))" 
              strokeDasharray="3 3"
              strokeOpacity={0.7}
            />
            <Scatter 
              data={chartData} 
              fill="hsl(var(--primary))"
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.isProfit ? 'hsl(142, 76%, 36%)' : 'hsl(0, 84%, 60%)'}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};
