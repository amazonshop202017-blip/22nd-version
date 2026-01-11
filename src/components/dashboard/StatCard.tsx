import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  trend?: 'profit' | 'loss' | 'neutral';
  delay?: number;
}

export const StatCard = ({ label, value, icon, trend = 'neutral', delay = 0 }: StatCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="glass-card rounded-2xl p-6 relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 w-32 h-32 opacity-5 transform translate-x-8 -translate-y-8">
        {icon}
      </div>
      
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="stat-label mb-2">{label}</p>
          <p className={cn(
            "stat-value",
            trend === 'profit' && "profit-text",
            trend === 'loss' && "loss-text",
          )}>
            {value}
          </p>
        </div>
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center",
          trend === 'profit' && "profit-bg",
          trend === 'loss' && "loss-bg",
          trend === 'neutral' && "bg-primary/10",
        )}>
          <div className={cn(
            trend === 'profit' && "profit-text",
            trend === 'loss' && "loss-text",
            trend === 'neutral' && "text-primary",
          )}>
            {icon}
          </div>
        </div>
      </div>

      <motion.div
        className="absolute inset-0 border-2 border-primary/0 rounded-2xl"
        whileHover={{ borderColor: 'hsl(199 89% 48% / 0.2)' }}
        transition={{ duration: 0.2 }}
      />
    </motion.div>
  );
};
