import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CustomStatsOptions {
  timeframes: string[];
  confluences: string[];
  patterns: string[];
  preparations: string[];
  entryComments: string[];
  tradeManagements: string[];
  exitComments: string[];
  mentals: string[];
  indicators: string[];
  marketGenerals: string[];
  biases: string[];
}

interface CustomStatsContextType {
  options: CustomStatsOptions;
  addTimeframe: (value: string) => void;
  removeTimeframe: (value: string) => void;
  addConfluence: (value: string) => void;
  removeConfluence: (value: string) => void;
  addPattern: (value: string) => void;
  removePattern: (value: string) => void;
  addPreparation: (value: string) => void;
  removePreparation: (value: string) => void;
  addEntryComment: (value: string) => void;
  removeEntryComment: (value: string) => void;
  addTradeManagement: (value: string) => void;
  removeTradeManagement: (value: string) => void;
  addExitComment: (value: string) => void;
  removeExitComment: (value: string) => void;
  addMental: (value: string) => void;
  removeMental: (value: string) => void;
  addIndicator: (value: string) => void;
  removeIndicator: (value: string) => void;
  addMarketGeneral: (value: string) => void;
  removeMarketGeneral: (value: string) => void;
  addBias: (value: string) => void;
  removeBias: (value: string) => void;
}

const defaultTimeframes = ['1M', '5M', '15M', '30M', '1H', '4H', '1D', '1W'];
const defaultEntryComments = ['Good entry', 'Early entry', 'Late entry', 'Perfect entry'];
const defaultTradeManagements = ['Managed well', 'Over-managed', 'Under-managed', 'Perfect management'];
const defaultExitComments = ['All Rules', 'Early exit', 'Late exit', 'Perfect exit'];

const STORAGE_KEY = 'trading-journal-custom-stats';

const CustomStatsContext = createContext<CustomStatsContextType | undefined>(undefined);

const getDefaultOptions = (): CustomStatsOptions => ({
  timeframes: defaultTimeframes,
  confluences: [],
  patterns: [],
  preparations: [],
  entryComments: defaultEntryComments,
  tradeManagements: defaultTradeManagements,
  exitComments: defaultExitComments,
  mentals: [],
  indicators: [],
  marketGenerals: [],
  biases: [],
});

export const CustomStatsProvider = ({ children }: { children: ReactNode }) => {
  const [options, setOptions] = useState<CustomStatsOptions>(() => {
    const defaults = getDefaultOptions();
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Merge stored data with defaults to handle new fields
        return {
          timeframes: parsed.timeframes ?? defaults.timeframes,
          confluences: parsed.confluences ?? defaults.confluences,
          patterns: parsed.patterns ?? defaults.patterns,
          preparations: parsed.preparations ?? defaults.preparations,
          entryComments: parsed.entryComments ?? defaults.entryComments,
          tradeManagements: parsed.tradeManagements ?? defaults.tradeManagements,
          exitComments: parsed.exitComments ?? defaults.exitComments,
          mentals: parsed.mentals ?? defaults.mentals,
          indicators: parsed.indicators ?? defaults.indicators,
          marketGenerals: parsed.marketGenerals ?? defaults.marketGenerals,
          biases: parsed.biases ?? defaults.biases,
        };
      } catch {
        // Return defaults if parse fails
      }
    }
    return defaults;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(options));
  }, [options]);

  const addToList = (key: keyof CustomStatsOptions, value: string) => {
    if (!value.trim()) return;
    setOptions(prev => {
      if (prev[key].includes(value.trim())) return prev;
      return { ...prev, [key]: [...prev[key], value.trim()] };
    });
  };

  const removeFromList = (key: keyof CustomStatsOptions, value: string) => {
    setOptions(prev => ({
      ...prev,
      [key]: prev[key].filter(v => v !== value),
    }));
  };

  return (
    <CustomStatsContext.Provider value={{
      options,
      addTimeframe: (v) => addToList('timeframes', v),
      removeTimeframe: (v) => removeFromList('timeframes', v),
      addConfluence: (v) => addToList('confluences', v),
      removeConfluence: (v) => removeFromList('confluences', v),
      addPattern: (v) => addToList('patterns', v),
      removePattern: (v) => removeFromList('patterns', v),
      addPreparation: (v) => addToList('preparations', v),
      removePreparation: (v) => removeFromList('preparations', v),
      addEntryComment: (v) => addToList('entryComments', v),
      removeEntryComment: (v) => removeFromList('entryComments', v),
      addTradeManagement: (v) => addToList('tradeManagements', v),
      removeTradeManagement: (v) => removeFromList('tradeManagements', v),
      addExitComment: (v) => addToList('exitComments', v),
      removeExitComment: (v) => removeFromList('exitComments', v),
      addMental: (v) => addToList('mentals', v),
      removeMental: (v) => removeFromList('mentals', v),
      addIndicator: (v) => addToList('indicators', v),
      removeIndicator: (v) => removeFromList('indicators', v),
      addMarketGeneral: (v) => addToList('marketGenerals', v),
      removeMarketGeneral: (v) => removeFromList('marketGenerals', v),
      addBias: (v) => addToList('biases', v),
      removeBias: (v) => removeFromList('biases', v),
    }}>
      {children}
    </CustomStatsContext.Provider>
  );
};

export const useCustomStats = () => {
  const context = useContext(CustomStatsContext);
  if (!context) {
    throw new Error('useCustomStats must be used within a CustomStatsProvider');
  }
  return context;
};
