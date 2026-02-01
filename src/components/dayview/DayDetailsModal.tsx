import { useMemo } from 'react';
import { format, startOfDay, endOfDay } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { Trade, calculateTradeMetrics } from '@/types/trade';
import { useGlobalFilters } from '@/contexts/GlobalFiltersContext';
import { usePrivacyMode } from '@/hooks/usePrivacyMode';
import { useDiaryContext } from '@/contexts/DiaryContext';
import { IntradayPnLChart } from './IntradayPnLChart';
import { DayTradesTable } from './DayTradesTable';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface DayDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  trades: Trade[];
}

export const DayDetailsModal = ({ isOpen, onClose, date, trades }: DayDetailsModalProps) => {
  const navigate = useNavigate();
  const { formatCurrency, setDateRange, setDatePreset } = useGlobalFilters();
  const { isPrivacyMode, maskCurrency, maskProfitFactor } = usePrivacyMode();
  const { createNote, setSelectedFolderId, setSelectedNoteId } = useDiaryContext();

  // Calculate day stats
  const dayStats = useMemo(() => {
    return trades.reduce(
      (acc, trade) => {
        const metrics = calculateTradeMetrics(trade);
        
        acc.netPnl += metrics.netPnl;
        acc.grossPnl += metrics.grossPnl;
        acc.totalTrades += 1;
        acc.totalQuantity += metrics.totalQuantity;
        acc.totalCommissions += metrics.totalCharges;
        
        if (metrics.netPnl > 0) {
          acc.winners += 1;
          acc.totalWins += metrics.netPnl;
        } else if (metrics.netPnl < 0) {
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
  }, [trades]);

  // Win rate calculation: Wins / (Wins + Losses)
  const winsAndLosses = dayStats.winners + dayStats.losers;
  const winRate = winsAndLosses > 0 ? (dayStats.winners / winsAndLosses) * 100 : 0;

  // Profit Factor calculation
  const profitFactor = dayStats.totalLosses > 0
    ? dayStats.totalWins / dayStats.totalLosses
    : dayStats.totalWins > 0 ? Infinity : 0;

  const isProfit = dayStats.netPnl >= 0;
  const formattedDate = format(date, 'EEE, MMM dd, yyyy');

  const handleAddNote = () => {
    // Create a new note linked to this day and navigate to diary
    const dayTitle = format(date, 'MMM dd, yyyy');
    const dayDateStr = format(date, 'yyyy-MM-dd');
    const newNote = createNote({
      title: `Day Note: ${dayTitle}`,
      linkedDate: dayDateStr,
    });
    
    // Navigate to diary with day folder selected and the new note
    setSelectedFolderId('day-notes');
    setSelectedNoteId(newNote.id);
    onClose();
    navigate('/diary');
  };

  const handleViewDetails = () => {
    // Set global date filter to the selected date
    setDatePreset('custom');
    setDateRange({
      from: startOfDay(date),
      to: endOfDay(date),
    });
    onClose();
    navigate('/day-view');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-3">
            <DialogTitle className="text-lg font-semibold">{formattedDate}</DialogTitle>
            <span className="text-muted-foreground">•</span>
            <span className={cn('font-semibold', isPrivacyMode ? 'text-foreground' : isProfit ? 'text-profit' : 'text-loss')}>
              Net P&L {maskCurrency(dayStats.netPnl, formatCurrency)}
            </span>
          </div>
          <Button
            variant="default"
            size="sm"
            className="gap-2"
            onClick={handleAddNote}
          >
            <FileText className="w-4 h-4" />
            Add note
          </Button>
        </DialogHeader>

        {/* Main Content - Day Card Style */}
        <div className="space-y-5">
          {trades.length === 0 ? (
            <div className="flex items-center justify-center h-40 border border-dashed border-border rounded-xl">
              <p className="text-muted-foreground">No trades on this day</p>
            </div>
          ) : (
            <>
              {/* Chart and Metrics */}
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
                    <p className={cn('text-lg font-semibold', isPrivacyMode ? 'text-foreground' : isProfit ? 'text-profit' : 'text-loss')}>
                      {maskCurrency(dayStats.grossPnl, formatCurrency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Commissions</p>
                    <p className="text-lg font-semibold text-foreground">
                      {maskCurrency(dayStats.totalCommissions, (v) => formatCurrency(v, false))}
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
                      {maskProfitFactor(profitFactor)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Trades Table */}
              <div className="pt-4 border-t border-border">
                <DayTradesTable trades={trades} />
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleViewDetails}>
            View Details
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
