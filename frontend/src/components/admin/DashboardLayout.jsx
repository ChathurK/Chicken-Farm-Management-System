import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
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
        <main className="p-4 space-y-4 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}