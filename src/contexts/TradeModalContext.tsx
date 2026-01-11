import { createContext, useContext, useState, ReactNode } from 'react';
import { Trade } from '@/types/trade';

interface TradeModalContextType {
  isOpen: boolean;
  editingTrade: Trade | null;
  openModal: (trade?: Trade) => void;
  closeModal: () => void;
}

const TradeModalContext = createContext<TradeModalContextType | undefined>(undefined);

export const TradeModalProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);

  const openModal = (trade?: Trade) => {
    setEditingTrade(trade || null);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setEditingTrade(null);
  };

  return (
    <TradeModalContext.Provider value={{ isOpen, editingTrade, openModal, closeModal }}>
      {children}
    </TradeModalContext.Provider>
  );
};

export const useTradeModal = () => {
  const context = useContext(TradeModalContext);
  if (!context) {
    throw new Error('useTradeModal must be used within TradeModalProvider');
  }
  return context;
};
