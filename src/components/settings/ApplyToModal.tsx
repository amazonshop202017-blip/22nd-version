import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';

interface ApplyToModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply?: (emptyOnly: boolean, overwrite: boolean) => void;
  /** Controls the descriptions shown for each option */
  context?: 'tpsl' | 'fees';
}

const descriptions = {
  tpsl: {
    emptyTitle: 'Apply to trades with no TP/SL set',
    emptySub: 'Only targets trades where both Take Profit and Stop Loss are empty.',
    overwriteTitle: 'Apply to trades with existing TP/SL values',
    overwriteSub: 'Only targets trades that already have a Take Profit or Stop Loss value and overwrites them.',
  },
  fees: {
    emptyTitle: 'Apply to trades with no fees set',
    emptySub: 'Only targets trades where fees have not been manually entered.',
    overwriteTitle: 'Apply to trades with existing fee values',
    overwriteSub: 'Only targets trades that already have a fee value and overwrites it.',
  },
  default: {
    emptyTitle: 'Apply to trades with empty fields only',
    emptySub: 'Only trades where the related field is null/empty.',
    overwriteTitle: 'Apply to trades and overwrite current values',
    overwriteSub: 'Replace existing values with this rule\'s values.',
  },
};

export const ApplyToModal = ({ open, onOpenChange, onApply, context }: ApplyToModalProps) => {
  const [emptyOnly, setEmptyOnly] = useState(false);
  const [overwrite, setOverwrite] = useState(false);

  const desc = descriptions[context ?? 'default'];

  const handleApply = () => {
    if (onApply) {
      onApply(emptyOnly, overwrite);
    }
    setEmptyOnly(false);
    setOverwrite(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Apply Settings</DialogTitle>
          <DialogDescription>
            Choose how this rule should be applied to your existing trades.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <Checkbox
              checked={emptyOnly}
              onCheckedChange={(v) => setEmptyOnly(!!v)}
              className="mt-0.5"
            />
            <div>
              <p className="text-sm font-medium">{desc.emptyTitle}</p>
              <p className="text-xs text-muted-foreground">{desc.emptySub}</p>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <Checkbox
              checked={overwrite}
              onCheckedChange={(v) => setOverwrite(!!v)}
              className="mt-0.5"
            />
            <div>
              <p className="text-sm font-medium">{desc.overwriteTitle}</p>
              <p className="text-xs text-muted-foreground">{desc.overwriteSub}</p>
            </div>
          </label>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleApply}>Apply</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
