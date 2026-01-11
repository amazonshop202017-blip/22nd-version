import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTradeModal } from '@/contexts/TradeModalContext';

export const FloatingAddButton = () => {
  const { openModal } = useTradeModal();

  return (
    <motion.button
      onClick={() => openModal()}
      className="fixed left-72 bottom-8 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center z-50"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ boxShadow: '0 0 30px -5px hsl(199 89% 48% / 0.5)' }}
    >
      <Plus className="w-6 h-6" />
    </motion.button>
  );
};
