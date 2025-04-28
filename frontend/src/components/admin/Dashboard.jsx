import React from 'react';
import DashboardLayout from './DashboardLayout';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <p><span className="font-semibold">Welcome,</span> {user?.first_name ? `${user.first_name} ${user.last_name}` : 'User'}</p>
          <p><span className="font-semibold">Email:</span> {user?.email}</p>
          <p><span className="font-semibold">Role:</span> {user?.role}</p>
        </div>
        <p className="text-gray-600">
          This is the admin dashboard where you can manage all aspects of the chicken farm management system.
        </p>
      </div>
    </DashboardLayout>
  );
}