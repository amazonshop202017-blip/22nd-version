import { PerformanceByTimeChart } from '@/components/chartroom/PerformanceByTimeChart';

const PerformanceByTime = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Performance by Time</h1>
        <p className="text-muted-foreground mt-1">Analyze your trading performance across different time periods.</p>
      </div>

      {/* Side-by-Side Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PerformanceByTimeChart defaultDisplayType="dollar" />
        <PerformanceByTimeChart defaultDisplayType="winrate" />
      </div>
    </div>
  );
};

export default PerformanceByTime;
