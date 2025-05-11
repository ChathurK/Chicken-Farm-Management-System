import React from 'react';
import Sidebar from '../shared/Sidebar';
import Topbar from '../shared/Topbar';
import AdminSidebarContent from './AdminSidebarContent';

export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar>
        <AdminSidebarContent />
      </Sidebar>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="p-4 h-screen space-y-4 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}