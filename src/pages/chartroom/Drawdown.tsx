import { useMemo, useState } from 'react';
import { useFilteredTradesContext } from '@/contexts/TradesContext';
import { calculateTradeMetrics } from '@/types/trade';
import { parseISO } from 'date-fns';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Info } from 'lucide-react';
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const Drawdown = () => {
  const { filteredTrades } = useFilteredTradesContext();
  const [displayType, setDisplayType] = useState('return');

  // Calculate drawdown data trade by trade
  const drawdownData = useMemo(() => {
    // Sort trades by close date
    const sortedTrades = [...filteredTrades]
      .filter(trade => {
        const metrics = calculateTradeMetrics(trade);
        return metrics.positionStatus === 'CLOSED' && metrics.closeDate;
      })
      .sort((a, b) => {
        const metricsA = calculateTradeMetrics(a);
        const metricsB = calculateTradeMetrics(b);
        return parseISO(metricsA.closeDate).getTime() - parseISO(metricsB.closeDate).getTime();
      });

    if (sortedTrades.length === 0) return [];

    let peak = 0;
    let cumulativePnl = 0;
    
    return sortedTrades.map((trade, index) => {
      const metrics = calculateTradeMetrics(trade);
      cumulativePnl += metrics.netPnl;
      
      // Update peak if we've reached a new high
      if (cumulativePnl > peak) {
        peak = cumulativePnl;
      }
      
      // Drawdown is the difference from peak (always 0 or negative)
      const drawdown = cumulativePnl - peak;
      
      return {
        trade: index + 1,
        drawdown: drawdown,
        cumulativePnl,
        peak,
      };
    });
  }, [filteredTrades]);

  // Calculate min drawdown for Y-axis domain
  const minDrawdown = useMemo(() => {
    if (drawdownData.length === 0) return -1000;
    const min = Math.min(...drawdownData.map(d => d.drawdown));
    return min < 0 ? min * 1.1 : -100; // Add 10% padding below
  }, [drawdownData]);

  // Format currency
  const formatCurrency = (value: number) => {
    const absValue = Math.abs(value);
    if (absValue >= 1000) {
      return `${value < 0 ? '-' : ''}$${(absValue / 1000).toFixed(1)}K`;
    }
    return `${value < 0 ? '-' : ''}$${absValue.toFixed(0)}`;
  };

  // Placeholder metric values
  const placeholderMetrics = [
    { label: 'Worst Drawdown', value: '$1,355.88', hasInfo: false },
    { label: 'Average Drawdown', value: '$253.37', hasInfo: false },
    { label: 'Current Drawdown', value: '-$89.84', hasInfo: false },
    { label: 'Top to Bottom', value: '11', hasInfo: true },
    { label: 'Bottom to Top', value: '11', hasInfo: true },
    { label: 'Return to Drawdown', value: '2.67', hasInfo: false },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Drawdown</h1>
        <p className="text-muted-foreground mt-1">Analyze your drawdown patterns and recovery periods.</p>
      </div>
      
      {/* Chart Container */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          {/* Display Dropdown */}
          <div className="mb-4">
            <Select value={displayType} onValueChange={setDisplayType}>
              <SelectTrigger className="w-[160px] bg-background border-border">
                <div className="flex flex-col items-start">
                  <span className="text-xs text-muted-foreground">Display</span>
                  <SelectValue placeholder="Return ($)" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="return">Return ($)</SelectItem>
                <SelectItem value="percent">Return (%)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Chart */}
          <div className="h-[400px] w-full">
            {drawdownData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={drawdownData}
                  margin={{ top: 10, right: 30, left: 10, bottom: 30 }}
                >
                  <defs>
                    <linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="trade"
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    label={{
                      value: 'Trades',
                      position: 'bottom',
                      offset: 10,
                      fill: 'hsl(var(--muted-foreground))',
                      fontSize: 12,
                    }}
                  />
                  <YAxis
                    domain={[minDrawdown, 0]}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    tickFormatter={(value) => formatCurrency(value)}
                    label={{
                      value: 'Drawdown ($)',
                      angle: -90,
                      position: 'insideLeft',
                      offset: 10,
                      fill: 'hsl(var(--muted-foreground))',
                      fontSize: 12,
                      style: { textAnchor: 'middle' },
                    }}
                  />
                  <ReferenceLine
                    y={0}
                    stroke="hsl(var(--border))"
                    strokeWidth={2}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      padding: '8px 12px',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Drawdown']}
                    labelFormatter={(label) => `Trade #${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="drawdown"
                    stroke="hsl(0, 84%, 60%)"
                    strokeWidth={2}
                    fill="url(#drawdownGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full border border-dashed border-border rounded-xl bg-muted/20">
                <p className="text-muted-foreground">No closed trades to display drawdown chart.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {placeholderMetrics.map((metric) => (
          <Card key={metric.label} className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-1 mb-1">
                <div className="w-1 h-4 bg-green-500 rounded-full" />
                <span className="text-sm text-muted-foreground">{metric.label}</span>
                {metric.hasInfo && (
                  <TooltipProvider>
                    <UITooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Metric explanation coming soon</p>
                      </TooltipContent>
                    </UITooltip>
                  </TooltipProvider>
                )}
              </div>
              <p className="text-xl font-semibold text-foreground">{metric.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Drawdown;
