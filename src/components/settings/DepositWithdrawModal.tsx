import { useState } from 'react';
import { format } from 'date-fns';
import { ArrowDownCircle, ArrowUpCircle, Plus, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface Transaction {
  id: string;
  accountId: string;
  type: 'deposit' | 'withdraw';
  amount: number;
  date: string;
  note?: string;
}

interface DepositWithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountId: string;
  accountName: string;
  transactions: Transaction[];
  onAddTransaction: (type: 'deposit' | 'withdraw', amount: number, note?: string) => void;
}

const DepositWithdrawModal = ({
  isOpen,
  onClose,
  accountName,
  transactions,
  onAddTransaction,
}: DepositWithdrawModalProps) => {
  const [showAddForm, setShowAddForm] = useState<'deposit' | 'withdraw' | null>(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const handleSubmit = () => {
    if (showAddForm && amount) {
      onAddTransaction(showAddForm, parseFloat(amount), note || undefined);
      setAmount('');
      setNote('');
      setShowAddForm(null);
    }
  };

  const totalDeposits = transactions
    .filter(t => t.type === 'deposit')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalWithdrawals = transactions
    .filter(t => t.type === 'withdraw')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>Deposits & Withdrawals</span>
            <span className="text-sm font-normal text-muted-foreground">- {accountName}</span>
          </DialogTitle>
        </DialogHeader>

        {/* Action Buttons */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={showAddForm === 'deposit' ? 'default' : 'outline'}
            className="flex-1"
            onClick={() => setShowAddForm(showAddForm === 'deposit' ? null : 'deposit')}
          >
            <ArrowDownCircle className="w-4 h-4 mr-2 text-profit" />
            Deposit
          </Button>
          <Button
            variant={showAddForm === 'withdraw' ? 'default' : 'outline'}
            className="flex-1"
            onClick={() => setShowAddForm(showAddForm === 'withdraw' ? null : 'withdraw')}
          >
            <ArrowUpCircle className="w-4 h-4 mr-2 text-loss" />
            Withdraw
          </Button>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="p-4 rounded-lg border border-border bg-muted/30 mb-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                New {showAddForm === 'deposit' ? 'Deposit' : 'Withdrawal'}
              </span>
              <Button size="sm" variant="ghost" onClick={() => setShowAddForm(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₹</span>
                <Input
                  type="number"
                  placeholder="Amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-7"
                  autoFocus
                />
              </div>
              <Input
                placeholder="Note (optional)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="flex-1"
              />
            </div>
            <Button onClick={handleSubmit} disabled={!amount} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add {showAddForm === 'deposit' ? 'Deposit' : 'Withdrawal'}
            </Button>
          </div>
        )}

        {/* Summary */}
        <div className="flex gap-4 p-3 rounded-lg bg-muted/50 mb-4">
          <div className="flex-1 text-center">
            <p className="text-xs text-muted-foreground mb-1">Total Deposits</p>
            <p className="font-mono text-profit font-medium">+₹{totalDeposits.toLocaleString()}</p>
          </div>
          <div className="w-px bg-border" />
          <div className="flex-1 text-center">
            <p className="text-xs text-muted-foreground mb-1">Total Withdrawals</p>
            <p className="font-mono text-loss font-medium">-₹{totalWithdrawals.toLocaleString()}</p>
          </div>
        </div>

        {/* Transaction History */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No transactions yet</p>
              <p className="text-xs">Use the buttons above to add deposits or withdrawals</p>
            </div>
          ) : (
            transactions
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-input border border-border"
                >
                  <div className="flex items-center gap-3">
                    {transaction.type === 'deposit' ? (
                      <ArrowDownCircle className="w-5 h-5 text-profit" />
                    ) : (
                      <ArrowUpCircle className="w-5 h-5 text-loss" />
                    )}
                    <div>
                      <p className="text-sm font-medium capitalize">{transaction.type}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(transaction.date), 'MMM dd, yyyy')}
                        {transaction.note && ` • ${transaction.note}`}
                      </p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      'font-mono font-medium',
                      transaction.type === 'deposit' ? 'text-profit' : 'text-loss'
                    )}
                  >
                    {transaction.type === 'deposit' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                  </span>
                </div>
              ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DepositWithdrawModal;
