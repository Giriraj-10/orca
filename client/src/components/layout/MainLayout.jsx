import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import DisclaimerBanner from '../common/DisclaimerBanner';

const MainLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-ocean-950 flex flex-col font-sans">
      {/* Fixed Left Sidebar */}
      <Sidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isSidebarCollapsed ? 'pl-20' : 'pl-64'
        }`}
      >
        {/* Fixed Topbar */}
        <Topbar isSidebarCollapsed={isSidebarCollapsed} />

        {/* Content Body */}
        <main className="flex-1 mt-16 p-4 sm:p-6 overflow-x-hidden">
          <Outlet />
        </main>

        {/* Persistent Scientific & Safety Disclaimer Footer */}
        <DisclaimerBanner compact={true} />
      </div>
    </div>
  );
};

export default MainLayout;
