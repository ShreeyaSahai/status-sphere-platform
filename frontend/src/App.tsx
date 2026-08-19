import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RefreshProvider } from '@/context';
import { AppLayout } from '@/components/layout/AppLayout';
import { DashboardPage } from '@/pages/DashboardPage';
import { ApplicationsPage } from '@/pages/ApplicationsPage';
import { ApplicationDetailPage } from '@/pages/ApplicationDetailPage';
import { CreateApplicationPage } from '@/pages/CreateApplicationPage';
import { EditApplicationPage } from '@/pages/EditApplicationPage';
import { IncidentsPage } from '@/pages/IncidentsPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5000,
      refetchOnWindowFocus: true,
      retry: 1,
      refetchIntervalInBackground: false, // Disables background polling when tab is hidden
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <RefreshProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/applications" element={<ApplicationsPage />} />
              <Route path="/applications/new" element={<CreateApplicationPage />} />
              <Route path="/applications/:id" element={<ApplicationDetailPage />} />
              <Route path="/applications/:id/edit" element={<EditApplicationPage />} />
              <Route path="/incidents" element={<IncidentsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </RefreshProvider>
    </QueryClientProvider>
  );
};

export default App;
