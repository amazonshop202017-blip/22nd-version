import { Trade, calculateTradeMetrics } from '@/types/trade';

export interface HeatmapCell {
  sl: number;
  tp: number;
  expectancy: number;
  winRate: number;
  avgR: number;
  tradesCount: number;
}

export interface ExitAnalyzerTrade {
  side: 'LONG' | 'SHORT';
  mfe: number;
  mae: number;
  realizedR: number;
}

/**
 * Prepare trades for exit analysis. Filters and normalizes.
 */
export function prepareExitTrades(
  trades: Trade[],
  treatMissingAsZero: boolean
): ExitAnalyzerTrade[] {
  const result: ExitAnalyzerTrade[] = [];

  for (const trade of trades) {
    const mfe = trade.mfeTickPip;
    const mae = trade.maeTickPip;

    // Both missing → always skip
    if (mfe == null && mae == null) continue;

    let mfeVal: number;
    let maeVal: number;

    if (mfe != null && mae != null) {
      // Both present → always include
      mfeVal = mfe;
      maeVal = mae;
    } else if (treatMissingAsZero) {
      // One present, one missing, checkbox ticked → treat missing as 0
      mfeVal = mfe ?? 0;
      maeVal = mae ?? 0;
    } else {
      // One missing, checkbox not ticked → skip
      continue;
    }

    const metrics = calculateTradeMetrics(trade);
    // Use savedRMultiple if available, otherwise compute from metrics
    const realizedR = trade.savedRMultiple ?? (trade.tradeRisk > 0 ? metrics.netPnl / trade.tradeRisk : 0);

    result.push({
      side: trade.side,
      mfe: mfeVal,
      mae: maeVal,
      realizedR,
    });
  }

  return result;
}

/**
 * Simulate exit for a single trade given SL/TP in ticks.
 * Returns the R result of the simulated exit.
 */
function simulateExit(trade: ExitAnalyzerTrade, sl: number, tp: number): number {
  // MAE >= SL means stop loss would have been hit
  if (trade.mae >= sl) {
    return -1; // Lost 1R
  }
  // MFE >= TP means take profit would have been hit
  if (trade.mfe >= tp) {
    return tp / sl; // Won TP/SL ratio in R
  }
  // Neither hit → use realized R
  return trade.realizedR;
}

/**
 * Compute the full heatmap grid.
 */
export function computeHeatmap(
  trades: ExitAnalyzerTrade[],
  minSL: number,
  maxSL: number,
  slStep: number,
  minTP: number,
  maxTP: number,
  tpStep: number
): HeatmapCell[] {
  if (trades.length === 0 || slStep <= 0 || tpStep <= 0) return [];

  const cells: HeatmapCell[] = [];

  for (let sl = minSL; sl <= maxSL; sl += slStep) {
    for (let tp = minTP; tp <= maxTP; tp += tpStep) {
      let totalR = 0;
      let wins = 0;
      let relevantCount = 0;

      for (const trade of trades) {
        // Only count trades where MFE or MAE is within range of this cell's SL/TP
        // i.e., trade could potentially interact with this exit model
        const r = simulateExit(trade, sl, tp);
        totalR += r;
        if (r > 0) wins++;
        relevantCount++;
      }

      if (relevantCount === 0) continue;

      cells.push({
        sl,
        tp,
        expectancy: totalR / relevantCount,
        winRate: (wins / relevantCount) * 100,
        avgR: totalR / relevantCount,
        tradesCount: relevantCount,
      });
    }
  }

  return cells;
}
