import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RefreshProvider } from '@/context';
import { WorkspaceLayout } from '@/components/layout/WorkspaceLayout';
import { LandingPage } from '@/pages/LandingPage';
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
      refetchIntervalInBackground: false,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <RefreshProvider>
        <BrowserRouter>
          <Routes>
            {/* Landing page */}
            <Route path="/" element={<LandingPage />} />

            {/* Workspace-scoped routes */}
            <Route path="/w/:workspaceId" element={<WorkspaceLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="applications" element={<ApplicationsPage />} />
              <Route path="applications/new" element={<CreateApplicationPage />} />
              <Route path="applications/:id" element={<ApplicationDetailPage />} />
              <Route path="applications/:id/edit" element={<EditApplicationPage />} />
              <Route path="incidents" element={<IncidentsPage />} />
            </Route>

            {/* Catch-all 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </RefreshProvider>
    </QueryClientProvider>
  );
};

export default App;
