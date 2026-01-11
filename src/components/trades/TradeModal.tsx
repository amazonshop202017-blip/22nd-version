import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTradeModal } from '@/contexts/TradeModalContext';
import { useTradesContext } from '@/contexts/TradesContext';
import { TradeFormData } from '@/types/trade';

const tradeSchema = z.object({
  symbol: z.string().min(1, 'Symbol is required').max(20),
  charges: z.coerce.number().min(0),
  openDate: z.string().min(1, 'Open date is required'),
  closeDate: z.string().min(1, 'Close date is required'),
  netPnl: z.coerce.number(),
  grossPnl: z.coerce.number(),
  rewardRatio: z.coerce.number().min(0),
  tradeRisk: z.coerce.number().min(0),
  side: z.enum(['LONG', 'SHORT']),
  duration: z.string().min(1),
  durationMinutes: z.coerce.number().min(0),
  accountName: z.string().min(1, 'Account name is required'),
  quantity: z.coerce.number().min(0.0001),
  tags: z.string(),
});

type FormData = z.infer<typeof tradeSchema>;

export const TradeModal = () => {
  const { isOpen, editingTrade, closeModal } = useTradeModal();
  const { addTrade, updateTrade } = useTradesContext();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(tradeSchema),
    defaultValues: {
      symbol: '',
      charges: 0,
      openDate: '',
      closeDate: '',
      netPnl: 0,
      grossPnl: 0,
      rewardRatio: 0,
      tradeRisk: 0,
      side: 'LONG',
      duration: '',
      durationMinutes: 0,
      accountName: 'Main Account',
      quantity: 0,
      tags: '',
    },
  });

  useEffect(() => {
    if (editingTrade) {
      reset({
        symbol: editingTrade.symbol,
        charges: editingTrade.charges,
        openDate: editingTrade.openDate,
        closeDate: editingTrade.closeDate,
        netPnl: editingTrade.netPnl,
        grossPnl: editingTrade.grossPnl,
        rewardRatio: editingTrade.rewardRatio,
        tradeRisk: editingTrade.tradeRisk,
        side: editingTrade.side,
        duration: editingTrade.duration,
        durationMinutes: editingTrade.durationMinutes,
        accountName: editingTrade.accountName,
        quantity: editingTrade.quantity,
        tags: editingTrade.tags.join(', '),
      });
    } else {
      reset({
        symbol: '',
        charges: 0,
        openDate: '',
        closeDate: '',
        netPnl: 0,
        grossPnl: 0,
        rewardRatio: 0,
        tradeRisk: 0,
        side: 'LONG',
        duration: '',
        durationMinutes: 0,
        accountName: 'Main Account',
        quantity: 0,
        tags: '',
      });
    }
  }, [editingTrade, reset]);

  const onSubmit = (data: FormData) => {
    const tradeData: TradeFormData = {
      symbol: data.symbol,
      charges: data.charges,
      openDate: data.openDate,
      closeDate: data.closeDate,
      netPnl: data.netPnl,
      grossPnl: data.grossPnl,
      rewardRatio: data.rewardRatio,
      tradeRisk: data.tradeRisk,
      side: data.side,
      duration: data.duration,
      durationMinutes: data.durationMinutes,
      accountName: data.accountName,
      quantity: data.quantity,
      tags: data.tags.split(',').map(t => t.trim()).filter(t => t.length > 0),
    };

    if (editingTrade) {
      updateTrade(editingTrade.id, tradeData);
    } else {
      addTrade(tradeData);
    }
    closeModal();
  };

  const sideValue = watch('side');

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="max-w-2xl bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {editingTrade ? 'Edit Trade' : 'Enter New Trade'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="symbol">Symbol</Label>
              <Input
                id="symbol"
                placeholder="e.g., AAPL, BTC/USD"
                {...register('symbol')}
                className="bg-input border-border"
              />
              {errors.symbol && <p className="text-xs text-loss">{errors.symbol.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="side">Side</Label>
              <Select value={sideValue} onValueChange={(v) => setValue('side', v as 'LONG' | 'SHORT')}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LONG">Long</SelectItem>
                  <SelectItem value="SHORT">Short</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="openDate">Open Date</Label>
              <Input
                id="openDate"
                type="datetime-local"
                {...register('openDate')}
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="closeDate">Close Date</Label>
              <Input
                id="closeDate"
                type="datetime-local"
                {...register('closeDate')}
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                step="0.0001"
                {...register('quantity')}
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="charges">Charges/Fees</Label>
              <Input
                id="charges"
                type="number"
                step="0.01"
                {...register('charges')}
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="grossPnl">Gross P&L</Label>
              <Input
                id="grossPnl"
                type="number"
                step="0.01"
                {...register('grossPnl')}
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="netPnl">Net P&L</Label>
              <Input
                id="netPnl"
                type="number"
                step="0.01"
                {...register('netPnl')}
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rewardRatio">Reward Ratio (R:R)</Label>
              <Input
                id="rewardRatio"
                type="number"
                step="0.01"
                {...register('rewardRatio')}
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tradeRisk">Trade Risk ($)</Label>
              <Input
                id="tradeRisk"
                type="number"
                step="0.01"
                {...register('tradeRisk')}
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                placeholder="e.g., 2h 30m"
                {...register('duration')}
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="durationMinutes">Duration (Minutes)</Label>
              <Input
                id="durationMinutes"
                type="number"
                {...register('durationMinutes')}
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="accountName">Account Name</Label>
              <Input
                id="accountName"
                {...register('accountName')}
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                placeholder="e.g., breakout, momentum, scalp"
                {...register('tags')}
                className="bg-input border-border"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {editingTrade ? 'Update Trade' : 'Add Trade'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
