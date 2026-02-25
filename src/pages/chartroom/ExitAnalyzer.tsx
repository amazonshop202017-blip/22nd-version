import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useFilteredTrades } from '@/hooks/useFilteredTrades';
import { prepareExitTrades, computeHeatmap, HeatmapCell } from '@/lib/exitAnalyzerCalc';
import { Crosshair, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Heatmap } from '@mui/x-charts-pro/Heatmap';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, ReferenceLine, Cell as RechartsCell
} from 'recharts';

// Dark MUI theme to match app
const muiDarkTheme = createTheme({
  palette: { mode: 'dark', background: { default: 'transparent', paper: 'transparent' } },
});

const InputField = ({ label, value, onChange, min }: {
  label: string; value: number; onChange: (v: number) => void; min?: number;
}) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</label>
    <input
      type="number"
      value={value}
      min={min ?? 1}
      onChange={e => onChange(Number(e.target.value))}
      className="h-9 w-24 rounded-md border border-border bg-secondary px-2 text-sm text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-ring"
    />
  </div>
);

const ExitAnalyzer = () => {
  const { filteredTrades } = useFilteredTrades();

  // Inputs
  const [minSL, setMinSL] = useState(5);
  const [maxSL, setMaxSL] = useState(30);
  const [minTP, setMinTP] = useState(5);
  const [maxTP, setMaxTP] = useState(30);
  const [slStep, setSlStep] = useState(5);
  const [tpStep, setTpStep] = useState(5);
  const [treatMissingAsZero, setTreatMissingAsZero] = useState(true);

  // Selection
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const [activeModel, setActiveModel] = useState<{ sl: number; tp: number } | null>(null);

  // Prepare trades
  const exitTrades = useMemo(
    () => prepareExitTrades(filteredTrades, treatMissingAsZero),
    [filteredTrades, treatMissingAsZero]
  );

  // Zoom logic
  const zoomedRange = useMemo(() => {
    if (selectedCells.size === 0) return null;
    const selected = Array.from(selectedCells).map(k => {
      const [s, t] = k.split(':').map(Number);
      return { sl: s, tp: t };
    });
    const sls = selected.map(s => s.sl);
    const tps = selected.map(s => s.tp);
    const margin = 2;
    return {
      minSL: Math.max(1, Math.min(...sls) - margin * slStep),
      maxSL: Math.max(...sls) + margin * slStep,
      minTP: Math.max(1, Math.min(...tps) - margin * tpStep),
      maxTP: Math.max(...tps) + margin * tpStep,
      slStep: Math.max(1, Math.round(slStep / 2)),
      tpStep: Math.max(1, Math.round(tpStep / 2)),
    };
  }, [selectedCells, slStep, tpStep]);

  const heatmapRange = zoomedRange || { minSL, maxSL, minTP, maxTP, slStep, tpStep };
  const isValidRange = heatmapRange.minSL > 0 && heatmapRange.maxSL >= heatmapRange.minSL &&
    heatmapRange.minTP > 0 && heatmapRange.maxTP >= heatmapRange.minTP &&
    heatmapRange.slStep > 0 && heatmapRange.tpStep > 0;

  const heatmapCells = useMemo(() => {
    if (!isValidRange || exitTrades.length === 0) return [];
    return computeHeatmap(
      exitTrades,
      heatmapRange.minSL, heatmapRange.maxSL, heatmapRange.slStep,
      heatmapRange.minTP, heatmapRange.maxTP, heatmapRange.tpStep
    );
  }, [exitTrades, heatmapRange, isValidRange]);

  // Build MUI heatmap data
  const { tpValues, slValues, cellMap, muiData } = useMemo(() => {
    const tpSet = new Set<number>();
    const slSet = new Set<number>();
    const map = new Map<string, HeatmapCell>();
    for (const c of heatmapCells) {
      tpSet.add(c.tp);
      slSet.add(c.sl);
      map.set(`${c.sl}:${c.tp}`, c);
    }
    const tpArr = Array.from(tpSet).sort((a, b) => a - b);
    const slArr = Array.from(slSet).sort((a, b) => a - b);

    // MUI Heatmap data: [xIndex, yIndex, value]
    const data: [number, number, number][] = [];
    for (let xi = 0; xi < tpArr.length; xi++) {
      for (let yi = 0; yi < slArr.length; yi++) {
        const cell = map.get(`${slArr[yi]}:${tpArr[xi]}`);
        if (cell) {
          data.push([xi, yi, cell.expectancy]);
        }
      }
    }

    return { tpValues: tpArr, slValues: slArr, cellMap: map, muiData: data };
  }, [heatmapCells]);

  const toggleCell = useCallback((key: string) => {
    setSelectedCells(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedCells(new Set());
    setActiveModel(null);
  }, []);

  const comparisonRows = useMemo(() => {
    return Array.from(selectedCells).map(key => cellMap.get(key)!).filter(Boolean);
  }, [selectedCells, cellMap]);

  const scatterData = useMemo(() => {
    return exitTrades.map((t, i) => ({ x: t.mae, y: t.mfe, id: i }));
  }, [exitTrades]);

  // Handle MUI heatmap cell click
  const handleHeatmapClick = useCallback((_event: any, data: any) => {
    if (data?.dataIndex != null) {
      const tuple = muiData[data.dataIndex];
      if (tuple) {
        const tp = tpValues[tuple[0]];
        const sl = slValues[tuple[1]];
        if (tp != null && sl != null) {
          toggleCell(`${sl}:${tp}`);
        }
      }
    }
  }, [muiData, tpValues, slValues, toggleCell]);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <Crosshair className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Exit Analyzer</h1>
            <p className="text-muted-foreground mt-1">Discover optimal SL/TP exits using historical MFE/MAE behavior</p>
          </div>
        </div>
      </motion.div>

      {/* Inputs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="glass-card rounded-2xl p-5"
      >
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-wrap items-end gap-3">
            <InputField label="Min SL" value={minSL} onChange={setMinSL} />
            <InputField label="Max SL" value={maxSL} onChange={setMaxSL} />
            <InputField label="SL Step" value={slStep} onChange={setSlStep} />
          </div>
          <div className="w-px h-9 bg-border" />
          <div className="flex flex-wrap items-end gap-3">
            <InputField label="Min TP" value={minTP} onChange={setMinTP} />
            <InputField label="Max TP" value={maxTP} onChange={setMaxTP} />
            <InputField label="TP Step" value={tpStep} onChange={setTpStep} />
          </div>
          <div className="w-px h-9 bg-border" />
          <label className="flex items-center gap-2 cursor-pointer select-none pb-0.5">
            <input
              type="checkbox"
              checked={treatMissingAsZero}
              onChange={e => setTreatMissingAsZero(e.target.checked)}
              className="h-4 w-4 rounded border-border accent-primary"
            />
            <span className="text-sm text-muted-foreground">Treat missing as 0</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3.5 w-3.5 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-[200px] text-xs">When enabled, trades without MFE/MAE data are treated as 0 ticks movement. When disabled, they are excluded.</p>
              </TooltipContent>
            </Tooltip>
          </label>
        </div>
        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="font-mono">{exitTrades.length} trades</span>
          {selectedCells.size > 0 && (
            <button onClick={clearSelection} className="text-primary hover:underline">
              Clear selection ({selectedCells.size})
            </button>
          )}
          {zoomedRange && <span className="text-primary">🔍 Zoomed view</span>}
        </div>
      </motion.div>

      {/* Empty state */}
      {exitTrades.length === 0 && (
        <div className="glass-card rounded-2xl p-12 flex flex-col items-center justify-center min-h-[300px]">
          <p className="text-muted-foreground text-lg">No trades with MFE/MAE data available.</p>
          <p className="text-muted-foreground text-sm mt-1">Add MFE/MAE tick values to your trades to use the Exit Analyzer.</p>
        </div>
      )}

      {/* Invalid range */}
      {exitTrades.length > 0 && !isValidRange && (
        <div className="glass-card rounded-2xl p-12 flex flex-col items-center justify-center min-h-[200px]">
          <p className="text-muted-foreground">Invalid SL/TP ranges. Please adjust the inputs.</p>
        </div>
      )}

      {/* MUI Heatmap */}
      {muiData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-5"
        >
          <h2 className="text-lg font-semibold mb-4">SL / TP Performance Heatmap</h2>
          <ThemeProvider theme={muiDarkTheme}>
            <Heatmap
              xAxis={[{ data: tpValues.map(v => `TP ${v}`), label: 'Take Profit (ticks)' }]}
              yAxis={[{ data: slValues.map(v => `SL ${v}`), label: 'Stop Loss (ticks)' }]}
              series={[{
                data: muiData,
                highlightScope: { highlight: 'item', fade: 'global' },
                label: 'Expectancy (R)',
              }]}
              zAxis={[{
                min: Math.min(...muiData.map(d => d[2]), -1),
                max: Math.max(...muiData.map(d => d[2]), 1),
                colorMap: {
                  type: 'continuous',
                  min: Math.min(...muiData.map(d => d[2]), -1),
                  max: Math.max(...muiData.map(d => d[2]), 1),
                  color: ['hsl(0, 84%, 40%)', 'hsl(142, 76%, 40%)'] as [string, string],
                },
              }]}
              height={Math.max(350, slValues.length * 60 + 80)}
              margin={{ left: 80, bottom: 60, top: 20, right: 20 }}
              onItemClick={handleHeatmapClick}
              hideLegend={false}
            />
          </ThemeProvider>
        </motion.div>
      )}

      {/* Comparison Table */}
      {comparisonRows.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-5"
        >
          <h2 className="text-lg font-semibold mb-4">Model Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">SL</th>
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">TP</th>
                  <th className="text-right py-2 px-3 text-muted-foreground font-medium">Expectancy</th>
                  <th className="text-right py-2 px-3 text-muted-foreground font-medium">Win Rate</th>
                  <th className="text-right py-2 px-3 text-muted-foreground font-medium">Avg R</th>
                  <th className="text-right py-2 px-3 text-muted-foreground font-medium">Trades</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map(row => {
                  const isActive = activeModel?.sl === row.sl && activeModel?.tp === row.tp;
                  return (
                    <tr
                      key={`${row.sl}:${row.tp}`}
                      onClick={() => setActiveModel({ sl: row.sl, tp: row.tp })}
                      className={`cursor-pointer transition-colors border-b border-border/50 hover:bg-secondary/50 ${isActive ? 'bg-primary/10' : ''}`}
                    >
                      <td className="py-2.5 px-3 font-mono">{row.sl}</td>
                      <td className="py-2.5 px-3 font-mono">{row.tp}</td>
                      <td className={`py-2.5 px-3 text-right font-mono font-semibold ${row.expectancy > 0 ? 'profit-text' : row.expectancy < 0 ? 'loss-text' : ''}`}>
                        {row.expectancy >= 0 ? '+' : ''}{row.expectancy.toFixed(3)}R
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono">{row.winRate.toFixed(1)}%</td>
                      <td className="py-2.5 px-3 text-right font-mono">{row.avgR.toFixed(3)}</td>
                      <td className="py-2.5 px-3 text-right font-mono">{row.tradesCount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* MFE/MAE Scatter Chart */}
      {exitTrades.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="glass-card rounded-2xl p-5"
        >
          <h2 className="text-lg font-semibold mb-4">MFE / MAE Scatter</h2>
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 47% 18%)" />
              <XAxis
                type="number" dataKey="x" name="MAE (ticks)"
                label={{ value: 'MAE (ticks)', position: 'bottom', offset: 0, style: { fill: 'hsl(215 20% 55%)', fontSize: 12 } }}
                tick={{ fill: 'hsl(215 20% 55%)', fontSize: 11 }}
                stroke="hsl(222 47% 18%)"
              />
              <YAxis
                type="number" dataKey="y" name="MFE (ticks)"
                label={{ value: 'MFE (ticks)', angle: -90, position: 'insideLeft', style: { fill: 'hsl(215 20% 55%)', fontSize: 12 } }}
                tick={{ fill: 'hsl(215 20% 55%)', fontSize: 11 }}
                stroke="hsl(222 47% 18%)"
              />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: 'hsl(222 47% 10%)',
                  border: '1px solid hsl(222 47% 18%)',
                  borderRadius: '8px',
                  color: 'hsl(210 40% 98%)',
                  fontSize: 12,
                }}
              />
              {activeModel && (
                <>
                  <ReferenceLine
                    x={activeModel.sl} stroke="hsl(0 84% 60%)" strokeDasharray="6 3" strokeWidth={2}
                    label={{ value: `SL ${activeModel.sl}`, fill: 'hsl(0 84% 60%)', fontSize: 11, position: 'top' }}
                  />
                  <ReferenceLine
                    y={activeModel.tp} stroke="hsl(142 76% 45%)" strokeDasharray="6 3" strokeWidth={2}
                    label={{ value: `TP ${activeModel.tp}`, fill: 'hsl(142 76% 45%)', fontSize: 11, position: 'right' }}
                  />
                </>
              )}
              <Scatter data={scatterData} fill="hsl(199 89% 48%)" fillOpacity={0.6} r={4}>
                {scatterData.map((_, i) => (
                  <RechartsCell key={i} fill="hsl(199 89% 48%)" />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </motion.div>
      )}
    </div>
  );
};

export default ExitAnalyzer;
