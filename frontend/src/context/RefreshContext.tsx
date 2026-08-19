import React, { useState, useCallback } from 'react';
import { useQueryClient, useIsFetching } from '@tanstack/react-query';
import { RefreshContext, type PollingInterval } from './RefreshContextDefinition';

export function RefreshProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const isFetchingCount = useIsFetching();
  const [pollingInterval, setPollingInterval] = useState<PollingInterval>(30000); // 30s default
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());

  const refreshAll = useCallback(async () => {
    await queryClient.invalidateQueries();
    setLastRefreshedAt(new Date());
  }, [queryClient]);

  const isRefreshing = isFetchingCount > 0;

  return (
    <RefreshContext.Provider
      value={{
        pollingInterval,
        setPollingInterval,
        refreshAll,
        isRefreshing,
        lastRefreshedAt,
      }}
    >
      {children}
    </RefreshContext.Provider>
  );
}
