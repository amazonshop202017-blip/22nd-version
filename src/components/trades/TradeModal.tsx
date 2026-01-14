import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Calendar, Star, Settings2 } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTradeModal } from '@/contexts/TradeModalContext';
import { useTradesContext } from '@/contexts/TradesContext';
import { useStrategiesContext } from '@/contexts/StrategiesContext';
import { useAccountsContext } from '@/contexts/AccountsContext';
import { useGlobalFilters } from '@/contexts/GlobalFiltersContext';
import { TradeFormData, TradeEntry, calculateTradeMetrics } from '@/types/trade';
import { cn } from '@/lib/utils';

const defaultEntry = (): TradeEntry => ({
  id: crypto.randomUUID(),
  type: 'BUY',
  datetime: new Date().toISOString().slice(0, 16),
  quantity: 0,
  price: 0,
  charges: 0,
});

export const TradeModal = () => {
  const { isOpen, editingTrade, closeModal } = useTradeModal();
  const { addTrade, updateTrade } = useTradesContext();
  const { strategies } = useStrategiesContext();
  const { accounts } = useAccountsContext();
  const { currencyConfig } = useGlobalFilters();

  // Form state
  const [activeTab, setActiveTab] = useState('regular');
  const [instrument, setInstrument] = useState<'Equity' | 'Futures' | 'Options' | 'Crypto'>('Equity');
  const [strategyId, setStrategyId] = useState<string>('');
  const [direction, setDirection] = useState<'LONG' | 'SHORT'>('LONG');
  
  // Trade Entry fields
  const [entryDate, setEntryDate] = useState('');
  const [entryPrice, setEntryPrice] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(0);
  const [stopLoss, setStopLoss] = useState<number>(0);
  const [takeProfit, setTakeProfit] = useState<number>(0);
  
  // Trade Exit fields
  const [exitDate, setExitDate] = useState('');
  const [exitPrice, setExitPrice] = useState<number>(0);
  const [fees, setFees] = useState<number>(0);
  
  // Additional fields (from original)
  const [symbol, setSymbol] = useState('');
  const [accountName, setAccountName] = useState('');
  const [notes, setNotes] = useState('');
  const [tradeRisk, setTradeRisk] = useState(0);
  const [tradeTarget, setTradeTarget] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  // Hidden fields for compatibility
  const [entries, setEntries] = useState<TradeEntry[]>([defaultEntry()]);
  const [positionMAE, setPositionMAE] = useState(0);
  const [positionMFE, setPositionMFE] = useState(0);
  const [potentialMAE, setPotentialMAE] = useState(0);
  const [potentialMFE, setPotentialMFE] = useState(0);
  const [missedTrade, setMissedTrade] = useState(false);

  // Sync simplified fields to entries format
  useEffect(() => {
    const newEntries: TradeEntry[] = [];
    
    // Entry transaction
    if (entryDate && entryPrice > 0 && quantity > 0) {
      newEntries.push({
        id: entries[0]?.id || crypto.randomUUID(),
        type: direction === 'LONG' ? 'BUY' : 'SELL',
        datetime: entryDate,
        quantity: quantity,
        price: entryPrice,
        charges: 0,
      });
    }
    
    // Exit transaction
    if (exitDate && exitPrice > 0 && quantity > 0) {
      newEntries.push({
        id: entries[1]?.id || crypto.randomUUID(),
        type: direction === 'LONG' ? 'SELL' : 'BUY',
        datetime: exitDate,
        quantity: quantity,
        price: exitPrice,
        charges: fees,
      });
    }
    
    if (newEntries.length > 0) {
      setEntries(newEntries);
    }
  }, [entryDate, entryPrice, quantity, exitDate, exitPrice, fees, direction]);

  useEffect(() => {
    if (editingTrade) {
      setSymbol(editingTrade.symbol);
      setInstrument(editingTrade.instrument);
      setAccountName(editingTrade.accountName);
      setStrategyId(editingTrade.strategyId || '');
      setSelectedTags(editingTrade.tags);
      setNotes(editingTrade.notes || '');
      setTradeRisk(editingTrade.tradeRisk);
      setTradeTarget(editingTrade.tradeTarget || 0);
      setPositionMAE(editingTrade.positionMAE || 0);
      setPositionMFE(editingTrade.positionMFE || 0);
      setPotentialMAE(editingTrade.potentialMAE || 0);
      setPotentialMFE(editingTrade.potentialMFE || 0);
      setMissedTrade(editingTrade.missedTrade || false);
      
      // Parse entries to simplified format
      if (editingTrade.entries.length > 0) {
        const sortedEntries = [...editingTrade.entries].sort((a, b) => 
          new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
        );
        
        const firstEntry = sortedEntries[0];
        const lastEntry = sortedEntries.length > 1 ? sortedEntries[sortedEntries.length - 1] : null;
        
        // Determine direction from first entry
        setDirection(firstEntry.type === 'BUY' ? 'LONG' : 'SHORT');
        setEntryDate(firstEntry.datetime);
        setEntryPrice(firstEntry.price);
        setQuantity(firstEntry.quantity);
        
        if (lastEntry && lastEntry.id !== firstEntry.id) {
          setExitDate(lastEntry.datetime);
          setExitPrice(lastEntry.price);
          setFees(lastEntry.charges);
        }
        
        setEntries(editingTrade.entries);
      }
    } else {
      resetForm();
    }
  }, [editingTrade, isOpen]);

  const resetForm = () => {
    setActiveTab('regular');
    setSymbol('');
    setInstrument('Equity');
    setAccountName('');
    setStrategyId('');
    setSelectedTags([]);
    setNotes('');
    setDirection('LONG');
    setEntryDate(new Date().toISOString().slice(0, 16));
    setEntryPrice(0);
    setQuantity(0);
    setStopLoss(0);
    setTakeProfit(0);
    setExitDate('');
    setExitPrice(0);
    setFees(0);
    setTradeRisk(0);
    setTradeTarget(0);
    setEntries([defaultEntry()]);
    setPositionMAE(0);
    setPositionMFE(0);
    setPotentialMAE(0);
    setPotentialMFE(0);
    setMissedTrade(false);
  };

  const metrics = useMemo(() => {
    const formData: TradeFormData = {
      symbol,
      side: direction,
      instrument,
      entries,
      tradeRisk,
      tradeTarget,
      accountName,
      strategyId: strategyId || undefined,
      tags: selectedTags,
      notes,
      positionMAE,
      positionMFE,
      potentialMAE,
      potentialMFE,
      missedTrade,
    };
    return calculateTradeMetrics(formData);
  }, [symbol, direction, instrument, entries, tradeRisk, tradeTarget, accountName, strategyId, selectedTags, notes, positionMAE, positionMFE, potentialMAE, potentialMFE, missedTrade]);

  const handleSubmit = () => {
    if (!symbol.trim()) return;

    const tradeData: TradeFormData = {
      symbol: symbol.trim(),
      side: direction,
      instrument,
      entries,
      tradeRisk,
      tradeTarget,
      accountName: accountName.trim(),
      strategyId: strategyId || undefined,
      tags: selectedTags,
      notes: notes.trim(),
      positionMAE,
      positionMFE,
      potentialMAE,
      potentialMFE,
      missedTrade,
    };

    if (editingTrade) {
      updateTrade(editingTrade.id, tradeData);
    } else {
      addTrade(tradeData);
    }
    closeModal();
    resetForm();
  };

  const handleDiscard = () => {
    closeModal();
    resetForm();
  };

  // Calculated summary metrics
  const rrr = tradeRisk > 0 && tradeTarget > 0 ? (tradeTarget / tradeRisk).toFixed(0) : '0';
  const rMultiple = metrics.rFactor.toFixed(0);
  const returnPercent = metrics.returnPercent.toFixed(2) + '%';

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && handleDiscard()}>
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-[520px] p-0 flex flex-col bg-background border-l border-border overflow-hidden"
      >
        {/* Header */}
        <SheetHeader className="px-6 py-4 border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Star className="w-5 h-5 text-muted-foreground" />
              <SheetTitle className="text-lg font-semibold">
                {editingTrade ? `Edit Trade #${editingTrade.id.slice(0, 7)}` : 'Add Trade'}
              </SheetTitle>
              <Settings2 className="w-4 h-4 text-muted-foreground" />
            </div>
            <button
              onClick={handleDiscard}
              className="p-1.5 rounded-md hover:bg-muted/50 transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </SheetHeader>

        {/* Tabs */}
        <div className="px-6 pt-4 flex-shrink-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full grid grid-cols-3 h-10 bg-muted/50">
              <TabsTrigger value="regular" className="text-sm">Regular Data</TabsTrigger>
              <TabsTrigger value="advanced" className="text-sm">Advanced Data</TabsTrigger>
              <TabsTrigger value="screenshots" className="text-sm">Screenshots</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {activeTab === 'regular' && (
            <div className="space-y-6">
              {/* General Trade Data Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-foreground">General Trade Data</h3>
                
                {/* Entry Date */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Entry Date *</Label>
                  <div className="relative">
                    <Input
                      type="datetime-local"
                      value={entryDate}
                      onChange={(e) => setEntryDate(e.target.value)}
                      className="h-10 bg-input border-border pr-10"
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                {/* Instrument */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Instrument *</Label>
                  <Select value={symbol || instrument} onValueChange={(val) => setSymbol(val)}>
                    <SelectTrigger className="h-10 bg-input border-border">
                      <SelectValue placeholder="Select instrument..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USDJPY">USDJPY</SelectItem>
                      <SelectItem value="EURUSD">EURUSD</SelectItem>
                      <SelectItem value="GBPUSD">GBPUSD</SelectItem>
                      <SelectItem value="BTCUSD">BTCUSD</SelectItem>
                      <SelectItem value="SPY">SPY</SelectItem>
                      <SelectItem value="AAPL">AAPL</SelectItem>
                      <SelectItem value="TSLA">TSLA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Setup & Setup Checklist */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Setup *</Label>
                    <Select value={strategyId || "none"} onValueChange={(val) => setStrategyId(val === "none" ? "" : val)}>
                      <SelectTrigger className="h-10 bg-input border-border">
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="reversal">Reversal</SelectItem>
                        <SelectItem value="breakout">Breakout</SelectItem>
                        <SelectItem value="trend">Trend Following</SelectItem>
                        {strategies.map((s) => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Setup Checklist</Label>
                    <Select defaultValue="5of6">
                      <SelectTrigger className="h-10 bg-input border-border">
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6of6">6 of 6</SelectItem>
                        <SelectItem value="5of6">5 of 6</SelectItem>
                        <SelectItem value="4of6">4 of 6</SelectItem>
                        <SelectItem value="3of6">3 of 6</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Direction Section */}
              <div className="space-y-3">
                <Label className="text-xs text-muted-foreground">Direction *</Label>
                <div className="grid grid-cols-2 gap-0 border border-border rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setDirection('LONG')}
                    className={cn(
                      "h-10 text-sm font-medium transition-colors",
                      direction === 'LONG'
                        ? "bg-foreground text-background"
                        : "bg-background text-foreground hover:bg-muted/50"
                    )}
                  >
                    Long
                  </button>
                  <button
                    type="button"
                    onClick={() => setDirection('SHORT')}
                    className={cn(
                      "h-10 text-sm font-medium transition-colors border-l border-border",
                      direction === 'SHORT'
                        ? "bg-foreground text-background"
                        : "bg-background text-foreground hover:bg-muted/50"
                    )}
                  >
                    Short
                  </button>
                </div>
              </div>

              {/* Trade Entry & Exit Side by Side */}
              <div className="grid grid-cols-2 gap-4">
                {/* Trade Entry */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-foreground">Trade Entry</h4>
                  
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Entry Price *</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={entryPrice || ''}
                        onChange={(e) => setEntryPrice(parseFloat(e.target.value) || 0)}
                        className="h-10 bg-input border-border pr-8"
                      />
                      <Plus className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Quantity *</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={quantity || ''}
                      onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                      className="h-10 bg-input border-border"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Stop Loss</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={stopLoss || ''}
                      onChange={(e) => setStopLoss(parseFloat(e.target.value) || 0)}
                      className="h-10 bg-input border-border"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Take Profit</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={takeProfit || ''}
                      onChange={(e) => setTakeProfit(parseFloat(e.target.value) || 0)}
                      className="h-10 bg-input border-border"
                    />
                  </div>
                </div>

                {/* Trade Exit */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-foreground">Trade Exit</h4>
                  
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Exit Date *</Label>
                    <div className="relative">
                      <Input
                        type="datetime-local"
                        value={exitDate}
                        onChange={(e) => setExitDate(e.target.value)}
                        className="h-10 bg-input border-border pr-10"
                      />
                      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Exit Price *</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={exitPrice || ''}
                        onChange={(e) => setExitPrice(parseFloat(e.target.value) || 0)}
                        className="h-10 bg-input border-border pr-8"
                      />
                      <Plus className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Net P/L *</Label>
                    <Input
                      type="text"
                      value={`${currencyConfig.symbol}${metrics.netPnl.toFixed(2)}`}
                      readOnly
                      className="h-10 bg-muted/50 border-border text-muted-foreground"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Gross P/L *</Label>
                      <Input
                        type="text"
                        value={`${currencyConfig.symbol}${metrics.grossPnl.toFixed(2)}`}
                        readOnly
                        className="h-10 bg-muted/50 border-border text-muted-foreground text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Fees</Label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={fees || ''}
                        onChange={(e) => setFees(parseFloat(e.target.value) || 0)}
                        className="h-10 bg-input border-border text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal Notes Section */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-foreground">Personal Notes</h4>
                <Textarea
                  placeholder="Add notes about this trade..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[100px] bg-input border-border resize-none"
                />
              </div>
            </div>
          )}

          {activeTab === 'advanced' && (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              <p className="text-sm">Advanced Data - Coming Soon</p>
            </div>
          )}

          {activeTab === 'screenshots' && (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              <p className="text-sm">Screenshots - Coming Soon</p>
            </div>
          )}
        </div>

        {/* Sticky Footer */}
        <div className="flex-shrink-0 border-t border-border px-6 py-4 bg-background">
          <div className="flex items-center justify-between">
            {/* Left - Action Buttons */}
            <div className="flex items-center gap-2">
              <Button 
                onClick={handleSubmit}
                disabled={!symbol.trim()}
                className="h-9 px-6 bg-foreground text-background hover:bg-foreground/90"
              >
                Save
              </Button>
              <Button 
                variant="outline" 
                onClick={handleDiscard}
                className="h-9 px-6"
              >
                Cancel
              </Button>
            </div>

            {/* Right - Summary Metrics */}
            <div className="flex items-center gap-6 text-sm">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">RRR</p>
                <p className="font-semibold">{rrr}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">R-Multiple</p>
                <p className="font-semibold">{rMultiple}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Return</p>
                <p className="font-semibold">{returnPercent}</p>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
