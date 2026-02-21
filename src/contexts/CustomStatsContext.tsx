import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CommentOption {
  value: string;
  archived: boolean;
}

export interface CustomStatsOptions {
  entryComments: CommentOption[];
  tradeManagements: CommentOption[];
  exitComments: CommentOption[];
}

interface CustomStatsContextType {
  options: CustomStatsOptions;
  // Entry Comments (with archive support)
  addEntryComment: (value: string) => void;
  archiveEntryComment: (value: string) => void;
  unarchiveEntryComment: (value: string) => void;
  deleteEntryComment: (value: string) => void;
  getActiveEntryComments: () => string[];
  // Trade Managements (with archive support)
  addTradeManagement: (value: string) => void;
  archiveTradeManagement: (value: string) => void;
  unarchiveTradeManagement: (value: string) => void;
  deleteTradeManagement: (value: string) => void;
  getActiveTradeManagements: () => string[];
  // Exit Comments (with archive support)
  addExitComment: (value: string) => void;
  archiveExitComment: (value: string) => void;
  unarchiveExitComment: (value: string) => void;
  deleteExitComment: (value: string) => void;
  getActiveExitComments: () => string[];
}

const defaultEntryComments: CommentOption[] = [
  { value: 'Good entry', archived: false },
  { value: 'Early entry', archived: false },
  { value: 'Late entry', archived: false },
  { value: 'Perfect entry', archived: false },
];
const defaultTradeManagements: CommentOption[] = [
  { value: 'Managed well', archived: false },
  { value: 'Over-managed', archived: false },
  { value: 'Under-managed', archived: false },
  { value: 'Perfect management', archived: false },
];
const defaultExitComments: CommentOption[] = [
  { value: 'All Rules', archived: false },
  { value: 'Early exit', archived: false },
  { value: 'Late exit', archived: false },
  { value: 'Perfect exit', archived: false },
];

const STORAGE_KEY = 'trading-journal-custom-stats';

const CustomStatsContext = createContext<CustomStatsContextType | undefined>(undefined);

// Helper to migrate old string[] format to CommentOption[]
const migrateToCommentOptions = (data: string[] | CommentOption[]): CommentOption[] => {
  if (!data || data.length === 0) return [];
  if (typeof data[0] === 'object' && 'value' in data[0]) {
    return data as CommentOption[];
  }
  return (data as string[]).map(value => ({ value, archived: false }));
};

const getDefaultOptions = (): CustomStatsOptions => ({
  entryComments: defaultEntryComments,
  tradeManagements: defaultTradeManagements,
  exitComments: defaultExitComments,
});

export const CustomStatsProvider = ({ children }: { children: ReactNode }) => {
  const [options, setOptions] = useState<CustomStatsOptions>(() => {
    const defaults = getDefaultOptions();
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return {
          entryComments: migrateToCommentOptions(parsed.entryComments ?? defaults.entryComments),
          tradeManagements: migrateToCommentOptions(parsed.tradeManagements ?? defaults.tradeManagements),
          exitComments: migrateToCommentOptions(parsed.exitComments ?? defaults.exitComments),
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

  // Comment option handlers
  const addCommentOption = (key: 'entryComments' | 'tradeManagements' | 'exitComments', value: string) => {
    if (!value.trim()) return;
    setOptions(prev => {
      const exists = prev[key].some(opt => opt.value === value.trim());
      if (exists) return prev;
      return { ...prev, [key]: [...prev[key], { value: value.trim(), archived: false }] };
    });
  };

  const archiveCommentOption = (key: 'entryComments' | 'tradeManagements' | 'exitComments', value: string) => {
    setOptions(prev => ({
      ...prev,
      [key]: prev[key].map(opt => 
        opt.value === value ? { ...opt, archived: true } : opt
      ),
    }));
  };

  const unarchiveCommentOption = (key: 'entryComments' | 'tradeManagements' | 'exitComments', value: string) => {
    setOptions(prev => ({
      ...prev,
      [key]: prev[key].map(opt => 
        opt.value === value ? { ...opt, archived: false } : opt
      ),
    }));
  };

  const deleteCommentOption = (key: 'entryComments' | 'tradeManagements' | 'exitComments', value: string) => {
    setOptions(prev => ({
      ...prev,
      [key]: prev[key].filter(opt => opt.value !== value),
    }));
  };

  const getActiveComments = (key: 'entryComments' | 'tradeManagements' | 'exitComments'): string[] => {
    return options[key].filter(opt => !opt.archived).map(opt => opt.value);
  };

  return (
    <CustomStatsContext.Provider value={{
      options,
      // Entry Comments
      addEntryComment: (v) => addCommentOption('entryComments', v),
      archiveEntryComment: (v) => archiveCommentOption('entryComments', v),
      unarchiveEntryComment: (v) => unarchiveCommentOption('entryComments', v),
      deleteEntryComment: (v) => deleteCommentOption('entryComments', v),
      getActiveEntryComments: () => getActiveComments('entryComments'),
      // Trade Managements
      addTradeManagement: (v) => addCommentOption('tradeManagements', v),
      archiveTradeManagement: (v) => archiveCommentOption('tradeManagements', v),
      unarchiveTradeManagement: (v) => unarchiveCommentOption('tradeManagements', v),
      deleteTradeManagement: (v) => deleteCommentOption('tradeManagements', v),
      getActiveTradeManagements: () => getActiveComments('tradeManagements'),
      // Exit Comments
      addExitComment: (v) => addCommentOption('exitComments', v),
      archiveExitComment: (v) => archiveCommentOption('exitComments', v),
      unarchiveExitComment: (v) => unarchiveCommentOption('exitComments', v),
      deleteExitComment: (v) => deleteCommentOption('exitComments', v),
      getActiveExitComments: () => getActiveComments('exitComments'),
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