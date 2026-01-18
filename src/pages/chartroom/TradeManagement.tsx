import { useMemo } from 'react';
import { useFilteredTradesContext } from '@/contexts/TradesContext';
import { calculateTradeMetrics } from '@/types/trade';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const TradeManagement = () => {
  const { filteredTrades } = useFilteredTradesContext();

  const tradeManagementData = useMemo(() => {
    // Get closed trades with their calculated metrics
    const tradesWithMetrics = filteredTrades.map(trade => ({
      trade,
      metrics: calculateTradeMetrics(trade)
    }));
    
    const closedTrades = tradesWithMetrics.filter(t => t.metrics.positionStatus === 'CLOSED');

    // Analyze trade management comments
    const managementComments: Record<string, { count: number; totalPnl: number; wins: number }> = {};
    
    closedTrades.forEach(({ trade, metrics }) => {
      const comment = trade.tradeManagement || 'No Comment';
      if (!managementComments[comment]) {
        managementComments[comment] = { count: 0, totalPnl: 0, wins: 0 };
      }
      managementComments[comment].count++;
      managementComments[comment].totalPnl += metrics.netPnl;
      if (metrics.isWin) {
        managementComments[comment].wins++;
      }
    });

    const byManagement = Object.entries(managementComments)
      .map(([name, data]) => ({
        name: name.length > 20 ? name.substring(0, 20) + '...' : name,
        fullName: name,
        count: data.count,
        pnl: data.totalPnl,
        winRate: data.count > 0 ? (data.wins / data.count) * 100 : 0,
        avgPnl: data.count > 0 ? data.totalPnl / data.count : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Analyze if trades hit TP or SL
    const outcomeData = {
      hitTP: 0,
      hitSL: 0,
      manualClose: 0,
      breakeven: 0,
    };

    closedTrades.forEach(({ trade, metrics }) => {
      if (Math.abs(metrics.netPnl) < 1) {
        outcomeData.breakeven++;
      } else if (trade.takeProfit && metrics.avgExitPrice > 0) {
        const isLong = trade.side === 'LONG';
        const hitTP = isLong 
          ? metrics.avgExitPrice >= trade.takeProfit 
          : metrics.avgExitPrice <= trade.takeProfit;
        const hitSL = trade.stopLoss && (isLong 
          ? metrics.avgExitPrice <= trade.stopLoss 
          : metrics.avgExitPrice >= trade.stopLoss);
        
        if (hitTP) outcomeData.hitTP++;
        else if (hitSL) outcomeData.hitSL++;
        else outcomeData.manualClose++;
      } else {
        outcomeData.manualClose++;
      }
    });

    const outcomeChartData = [
      { name: 'Hit TP', value: outcomeData.hitTP, color: 'hsl(var(--chart-2))' },
      { name: 'Hit SL', value: outcomeData.hitSL, color: 'hsl(var(--chart-1))' },
      { name: 'Manual Close', value: outcomeData.manualClose, color: 'hsl(var(--chart-3))' },
      { name: 'Breakeven', value: outcomeData.breakeven, color: 'hsl(var(--chart-4))' },
    ].filter(d => d.value > 0);

    // Risk/Reward analysis
    const rrData: { planned: number; actual: number }[] = [];
    closedTrades.forEach(({ trade, metrics }) => {
      if (trade.stopLoss && trade.takeProfit && metrics.avgEntryPrice > 0 && metrics.avgExitPrice > 0) {
        const plannedRisk = Math.abs(metrics.avgEntryPrice - trade.stopLoss);
        const plannedReward = Math.abs(trade.takeProfit - metrics.avgEntryPrice);
        const plannedRR = plannedRisk > 0 ? plannedReward / plannedRisk : 0;
        
        const actualRisk = Math.abs(metrics.avgEntryPrice - trade.stopLoss);
        const actualReward = Math.abs(metrics.avgExitPrice - metrics.avgEntryPrice);
        const actualRR = actualRisk > 0 ? actualReward / actualRisk : 0;
        
        if (plannedRR > 0 && plannedRR < 10) {
          rrData.push({ planned: plannedRR, actual: metrics.isWin ? actualRR : -actualRR });
        }
      }
    });

    const avgPlannedRR = rrData.length > 0 ? rrData.reduce((sum, d) => sum + d.planned, 0) / rrData.length : 0;
    const avgActualRR = rrData.length > 0 ? rrData.reduce((sum, d) => sum + Math.max(0, d.actual), 0) / rrData.filter(d => d.actual > 0).length : 0;

    return {
      byManagement,
      outcomeChartData,
      totalTrades: closedTrades.length,
      avgPlannedRR,
      avgActualRR: isNaN(avgActualRR) ? 0 : avgActualRR,
    };
  }, [filteredTrades]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Trade Management Analysis</h1>
        <p className="text-muted-foreground mt-1">Analyze how you manage your trades and exit strategies</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{tradeManagementData.totalTrades}</p>
              <p className="text-sm text-muted-foreground">Total Closed Trades</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{tradeManagementData.avgPlannedRR.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">Avg Planned R:R</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{tradeManagementData.avgActualRR.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">Avg Actual R:R (Winners)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trade Outcome Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Trade Outcome Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tradeManagementData.outcomeChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {tradeManagementData.outcomeChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Performance by Trade Management Comment */}
        <Card>
          <CardHeader>
            <CardTitle>Performance by Trade Management Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tradeManagementData.byManagement} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    stroke="hsl(var(--muted-foreground))"
                    width={120}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number, name: string) => {
                      if (name === 'pnl') return [`$${value.toFixed(2)}`, 'P&L'];
                      if (name === 'winRate') return [`${value.toFixed(1)}%`, 'Win Rate'];
                      return [value, name];
                    }}
                  />
                  <Bar dataKey="pnl" fill="hsl(var(--chart-2))" name="pnl" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Management Notes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Trade Management Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Management Note</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Count</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Total P&L</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Avg P&L</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Win Rate</th>
                </tr>
              </thead>
              <tbody>
                {tradeManagementData.byManagement.map((item, index) => (
                  <tr key={index} className="border-b border-border/50 hover:bg-muted/50">
                    <td className="py-3 px-4 text-foreground">{item.fullName}</td>
                    <td className="py-3 px-4 text-right text-foreground">{item.count}</td>
                    <td className={`py-3 px-4 text-right font-medium ${item.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      ${item.pnl.toFixed(2)}
                    </td>
                    <td className={`py-3 px-4 text-right ${item.avgPnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      ${item.avgPnl.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right text-foreground">{item.winRate.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TradeManagement;
