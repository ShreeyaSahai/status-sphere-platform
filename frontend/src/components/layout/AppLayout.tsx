import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const AppLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#171717] flex">
      {/* Narrow icon sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-[68px]">
        <Header onMenuToggle={() => setIsSidebarOpen((prev) => !prev)} />
        <main className="flex-1 p-6 md:p-10 max-w-6xl w-full mx-auto animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
