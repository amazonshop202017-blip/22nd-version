import { motion } from 'framer-motion';
import { BarChart3, PieChart, TrendingUp, Calendar } from 'lucide-react';

const Analytics = () => {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground mt-1">Deep dive into your trading performance</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-8 flex flex-col items-center justify-center min-h-[300px]"
        >
          <BarChart3 className="w-16 h-16 text-primary mb-4" />
          <h3 className="text-xl font-semibold mb-2">P&L Over Time</h3>
          <p className="text-muted-foreground text-center">
            Charts and detailed analytics coming soon
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-8 flex flex-col items-center justify-center min-h-[300px]"
        >
          <PieChart className="w-16 h-16 text-primary mb-4" />
          <h3 className="text-xl font-semibold mb-2">Win/Loss Distribution</h3>
          <p className="text-muted-foreground text-center">
            Visual breakdown of your trades
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-2xl p-8 flex flex-col items-center justify-center min-h-[300px]"
        >
          <TrendingUp className="w-16 h-16 text-primary mb-4" />
          <h3 className="text-xl font-semibold mb-2">Performance Metrics</h3>
          <p className="text-muted-foreground text-center">
            Advanced statistics and insights
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-2xl p-8 flex flex-col items-center justify-center min-h-[300px]"
        >
          <Calendar className="w-16 h-16 text-primary mb-4" />
          <h3 className="text-xl font-semibold mb-2">Calendar Heatmap</h3>
          <p className="text-muted-foreground text-center">
            Daily trading performance view
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Analytics;
