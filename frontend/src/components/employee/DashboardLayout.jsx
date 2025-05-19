import React from 'react';
import Sidebar from '../shared/Sidebar';
import Topbar from '../shared/Topbar';
import EmployeeSidebarContent from './EmployeeSidebarContent';

export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar>
        <EmployeeSidebarContent />
      </Sidebar>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        <Topbar />
        <main className="h-screen space-y-4 overflow-y-auto p-4">
          {children}
        </main>
      </div>
    </div>
  );
}