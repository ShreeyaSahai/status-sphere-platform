import { createContext } from 'react';

export type PollingInterval = 0 | 15000 | 30000 | 60000;

export interface RefreshContextType {
  pollingInterval: PollingInterval;
  setPollingInterval: (interval: PollingInterval) => void;
  refreshAll: () => Promise<void>;
  isRefreshing: boolean;
  lastRefreshedAt: Date;
}

export const RefreshContext = createContext<RefreshContextType | undefined>(undefined);
