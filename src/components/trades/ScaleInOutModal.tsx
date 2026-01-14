import { useState, useMemo, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useGlobalFilters } from '@/contexts/GlobalFiltersContext';
import { ScaleEntry } from '@/types/trade';

interface ScaleEntryRow {
  id: string;
  price: string;
  quantity: string;
}

interface ScaleInOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (avgEntry: number, avgExit: number, totalExitQty: number, entries: ScaleEntry[], exits: ScaleEntry[], openQty: number) => void;
  initialEntryPrice?: string;
  initialQuantity?: string;
  initialExitPrice?: string;
  initialExitQuantity?: string;
  existingScaleEntries?: ScaleEntry[];
  existingScaleExits?: ScaleEntry[];
}

const createEmptyEntry = (): ScaleEntryRow => ({
  id: crypto.randomUUID(),
  price: '',
  quantity: '',
});

const scaleEntryToRow = (entry: ScaleEntry): ScaleEntryRow => ({
  id: entry.id,
  price: entry.price.toString(),
  quantity: entry.quantity.toString(),
});

const rowToScaleEntry = (row: ScaleEntryRow): ScaleEntry | null => {
  const price = parseFloat(row.price);
  const quantity = parseFloat(row.quantity);
  if (price > 0 && quantity > 0) {
    return { id: row.id, price, quantity };
  }
  return null;
};

export const ScaleInOutModal = ({
  isOpen,
  onClose,
  onSave,
  initialEntryPrice = '',
  initialQuantity = '',
  initialExitPrice = '',
  initialExitQuantity = '',
  existingScaleEntries = [],
  existingScaleExits = [],
}: ScaleInOutModalProps) => {
  const { currencyConfig } = useGlobalFilters();
  const [activeTab, setActiveTab] = useState<'entries' | 'exits'>('entries');
  const [entries, setEntries] = useState<ScaleEntryRow[]>([createEmptyEntry()]);
  const [exits, setExits] = useState<ScaleEntryRow[]>([createEmptyEntry()]);

  // Initialize with existing values when modal opens
  useEffect(() => {
    if (isOpen) {
      // Load existing scale entries if available
      if (existingScaleEntries.length > 0) {
        setEntries(existingScaleEntries.map(scaleEntryToRow));
      } else if (initialEntryPrice || initialQuantity) {
        // Pre-fill first entry with existing values
        setEntries([{
          id: crypto.randomUUID(),
          price: initialEntryPrice,
          quantity: initialQuantity,
        }]);
      } else {
        setEntries([createEmptyEntry()]);
      }

      // Load existing scale exits if available
      if (existingScaleExits.length > 0) {
        setExits(existingScaleExits.map(scaleEntryToRow));
      } else if (initialExitPrice || initialExitQuantity) {
        // Pre-fill first exit with existing values
        setExits([{
          id: crypto.randomUUID(),
          price: initialExitPrice,
          quantity: initialExitQuantity || initialQuantity,
        }]);
      } else {
        setExits([createEmptyEntry()]);
      }
    }
  }, [isOpen, initialEntryPrice, initialQuantity, initialExitPrice, initialExitQuantity, existingScaleEntries, existingScaleExits]);

  // Handle entry row updates
  const updateEntry = (id: string, field: 'price' | 'quantity', value: string) => {
    // Validate: only allow positive numbers and decimals
    if (value !== '' && !/^\d*\.?\d*$/.test(value)) return;
    
    setEntries(prev =>
      prev.map(entry =>
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    );
  };

  // Handle exit row updates
  const updateExit = (id: string, field: 'price' | 'quantity', value: string) => {
    // Validate: only allow positive numbers and decimals
    if (value !== '' && !/^\d*\.?\d*$/.test(value)) return;
    
    setExits(prev =>
      prev.map(exit =>
        exit.id === id ? { ...exit, [field]: value } : exit
      )
    );
  };

  // Add new entry row
  const addEntry = () => {
    setEntries(prev => [...prev, createEmptyEntry()]);
  };

  // Add new exit row
  const addExit = () => {
    setExits(prev => [...prev, createEmptyEntry()]);
  };

  // Remove entry row
  const removeEntry = (id: string) => {
    if (entries.length > 1) {
      setEntries(prev => prev.filter(entry => entry.id !== id));
    }
  };

  // Remove exit row
  const removeExit = (id: string) => {
    if (exits.length > 1) {
      setExits(prev => prev.filter(exit => exit.id !== id));
    }
  };

  // Calculate metrics
  const calculations = useMemo(() => {
    // Calculate average entry price (weighted average)
    const validEntries = entries.filter(e => 
      parseFloat(e.price) > 0 && parseFloat(e.quantity) > 0
    );
    const totalEntryQty = validEntries.reduce((sum, e) => sum + parseFloat(e.quantity), 0);
    const totalEntryCost = validEntries.reduce(
      (sum, e) => sum + parseFloat(e.price) * parseFloat(e.quantity), 
      0
    );
    const avgEntry = totalEntryQty > 0 ? totalEntryCost / totalEntryQty : 0;

    // Calculate average exit price (weighted average)
    const validExits = exits.filter(e => 
      parseFloat(e.price) > 0 && parseFloat(e.quantity) > 0
    );
    const totalExitQty = validExits.reduce((sum, e) => sum + parseFloat(e.quantity), 0);
    const totalExitValue = validExits.reduce(
      (sum, e) => sum + parseFloat(e.price) * parseFloat(e.quantity), 
      0
    );
    const avgExit = totalExitQty > 0 ? totalExitValue / totalExitQty : 0;

    // Calculate open quantity
    const openQty = totalEntryQty - totalExitQty;

    return {
      avgEntry,
      avgExit,
      openQty,
      totalEntryQty,
      totalExitQty,
    };
  }, [entries, exits]);

  // Handle save
  const handleSave = () => {
    // Convert rows to ScaleEntry objects (only valid ones)
    const validScaleEntries = entries.map(rowToScaleEntry).filter((e): e is ScaleEntry => e !== null);
    const validScaleExits = exits.map(rowToScaleEntry).filter((e): e is ScaleEntry => e !== null);
    
    onSave(
      calculations.avgEntry, 
      calculations.avgExit, 
      calculations.totalExitQty,
      validScaleEntries, 
      validScaleExits,
      calculations.openQty
    );
    onClose();
  };

  // Handle cancel
  const handleCancel = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="sm:max-w-[480px] p-0 gap-0 bg-background border-border">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-border">
          <DialogTitle className="text-lg font-semibold">Scale in/out</DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="px-6 pt-4">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'entries' | 'exits')}>
            <TabsList className="w-full grid grid-cols-2 h-10 bg-muted/50">
              <TabsTrigger value="entries" className="text-sm">Entries</TabsTrigger>
              <TabsTrigger value="exits" className="text-sm">Exits</TabsTrigger>
            </TabsList>

            {/* Entries Tab */}
            <TabsContent value="entries" className="mt-4 space-y-3">
              {entries.map((entry, index) => (
                <div key={entry.id} className="flex items-end gap-2">
                  <div className="flex-1 space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Price</Label>
                    <Input
                      type="text"
                      inputMode="decimal"
                      placeholder="0.00"
                      value={entry.price}
                      onChange={(e) => updateEntry(entry.id, 'price', e.target.value)}
                      className="h-10 bg-input border-border"
                    />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Quantity</Label>
                    <Input
                      type="text"
                      inputMode="decimal"
                      placeholder="0.00"
                      value={entry.quantity}
                      onChange={(e) => updateEntry(entry.id, 'quantity', e.target.value)}
                      className="h-10 bg-input border-border"
                    />
                  </div>
                  {entries.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 text-muted-foreground hover:text-destructive"
                      onClick={() => removeEntry(entry.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={addEntry}
                className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 font-medium mt-2"
              >
                <Plus className="w-4 h-4" />
                Add Entry
              </button>
            </TabsContent>

            {/* Exits Tab */}
            <TabsContent value="exits" className="mt-4 space-y-3">
              {exits.map((exit, index) => (
                <div key={exit.id} className="flex items-end gap-2">
                  <div className="flex-1 space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Price</Label>
                    <Input
                      type="text"
                      inputMode="decimal"
                      placeholder="0.00"
                      value={exit.price}
                      onChange={(e) => updateExit(exit.id, 'price', e.target.value)}
                      className="h-10 bg-input border-border"
                    />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Quantity</Label>
                    <Input
                      type="text"
                      inputMode="decimal"
                      placeholder="0.00"
                      value={exit.quantity}
                      onChange={(e) => updateExit(exit.id, 'quantity', e.target.value)}
                      className="h-10 bg-input border-border"
                    />
                  </div>
                  {exits.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 text-muted-foreground hover:text-destructive"
                      onClick={() => removeExit(exit.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={addExit}
                className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 font-medium mt-2"
              >
                <Plus className="w-4 h-4" />
                Add Exit
              </button>
            </TabsContent>
          </Tabs>
        </div>

        {/* Calculated Summary */}
        <div className="px-6 py-6 mt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="text-center">
              <p className="text-lg font-semibold">
                {currencyConfig.symbol}{calculations.avgEntry.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground">Avg. Entry</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold">
                {currencyConfig.symbol}{calculations.avgExit.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground">Avg. Exit</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold">
                {calculations.openQty.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground">Open Qty.</p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-border flex items-center gap-2">
          <Button
            onClick={handleSave}
            className="h-9 px-6 bg-foreground text-background hover:bg-foreground/90"
          >
            Save
          </Button>
          <Button
            variant="outline"
            onClick={handleCancel}
            className="h-9 px-6"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
