import { TpSlRule } from '@/components/settings/TpSlSettings';

const STORAGE_KEY = 'trading-journal-tpsl-rules';

/** Migrate legacy single-account rule to multi-account */
const migrateRule = (raw: any): TpSlRule => {
  if (raw.accountIds && raw.accountNames) return raw as TpSlRule;
  return {
    ...raw,
    accountIds: raw.accountId ? [raw.accountId] : [],
    accountNames: raw.accountName ? [raw.accountName] : [],
  };
};

export function loadTpSlRules(): TpSlRule[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return (JSON.parse(stored) as any[]).map(migrateRule);
  } catch {
    return [];
  }
}

export function findMatchingTpSlRule(
  rules: TpSlRule[],
  accountName: string,
  symbol: string
): TpSlRule | null {
  return rules.find(r => r.accountNames.includes(accountName) && r.symbol === symbol) || null;
}
