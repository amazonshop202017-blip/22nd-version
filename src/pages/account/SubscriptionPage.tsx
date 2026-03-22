import { Card } from '@/components/ui/card';
import { CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';

const SubscriptionPage = () => {
  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">Subscription</h1>
        <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8">Manage your plan and billing</p>

        <Card className="p-6 sm:p-8 flex flex-col items-center justify-center min-h-[250px] sm:min-h-[300px] text-center">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <CreditCard className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">Coming Soon</h3>
          <p className="text-sm sm:text-base text-muted-foreground max-w-sm">
            Subscription management and billing details will be available here soon.
          </p>
        </Card>
      </motion.div>
    </div>
  );
};

export default SubscriptionPage;
