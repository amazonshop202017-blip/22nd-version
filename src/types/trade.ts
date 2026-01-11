export interface Trade {
  id: string;
  symbol: string;
  charges: number;
  openDate: string;
  closeDate: string;
  netPnl: number;
  grossPnl: number;
  rewardRatio: number;
  tradeRisk: number;
  side: 'LONG' | 'SHORT';
  duration: string;
  durationMinutes: number;
  accountName: string;
  quantity: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export type TradeFormData = Omit<Trade, 'id' | 'createdAt' | 'updatedAt'>;
