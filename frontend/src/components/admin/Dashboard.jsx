import React, { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import InventoryAlerts from './inventory/InventoryAlerts';
import {
  ChartLine,
  ShoppingCart,
  Bird,
  ArchiveBox,
  CurrencyCircleDollar,
  UsersThree,
  UserPlus,
} from '@phosphor-icons/react';
import api from '../../utils/api';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [dashboardStats, setDashboardStats] = useState({
    inventoryCount: 0,
    orderCount: 0,
    buyerCount: 0,
    sellerCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // In a real implementation, this could fetch data from multiple endpoints
        // For now, we'll just show static data with a loading effect

        // Simulating API calls
        setLoading(true);
        setTimeout(() => {
          setDashboardStats({
            inventoryCount: 24,
            orderCount: 12,
            buyerCount: 18,
            sellerCount: 7,
          });
          setLoading(false);
        }, 500);

        // The actual implementation would look like:
        // const inventoryResponse = await api.get('/api/inventory/count');
        // const orderResponse = await api.get('/api/orders/count');
        // const buyerResponse = await api.get('/api/buyers/count');
        // const sellerResponse = await api.get('/api/sellers/count');

        // setDashboardStats({
        //   inventoryCount: inventoryResponse.data.count,
        //   orderCount: orderResponse.data.count,
        //   buyerCount: buyerResponse.data.count,
        //   sellerCount: sellerResponse.data.count
        // });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <DashboardLayout>
      {/* Welcome Section */}
      <div className="mb-6 rounded-lg bg-white p-6 shadow">
        <h1 className="mb-4 text-2xl font-bold">Admin Dashboard</h1>
        <div className="rounded-lg border border-amber-100 bg-amber-50 p-4">
          <p>
            <span className="font-semibold">Welcome,</span>{' '}
            {user?.first_name ? `${user.first_name} ${user.last_name}` : 'User'}
          </p>
          <p>
            <span className="font-semibold">Email:</span> {user?.email}
          </p>
          <p>
            <span className="font-semibold">Role:</span> {user?.role}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Inventory Stats Card */}
        <div className="flex items-center rounded-lg border-l-4 border-amber-500 bg-white p-4 shadow">
          <div className="mr-4 rounded-full bg-amber-100 p-3">
            <ArchiveBox size={24} weight="duotone" className="text-amber-600" />
          </div>
          <div>
            <h3 className="text-sm text-gray-500">Inventory Items</h3>
            <p className="text-2xl font-bold">
              {loading ? (
                <span className="inline-block h-8 w-12 animate-pulse rounded bg-gray-200"></span>
              ) : (
                dashboardStats.inventoryCount
              )}
            </p>
          </div>
        </div>

        {/* Orders Stats Card */}
        <div className="flex items-center rounded-lg border-l-4 border-blue-500 bg-white p-4 shadow">
          <div className="mr-4 rounded-full bg-blue-100 p-3">
            <ShoppingCart
              size={24}
              weight="duotone"
              className="text-blue-600"
            />
          </div>
          <div>
            <h3 className="text-sm text-gray-500">Active Orders</h3>
            <p className="text-2xl font-bold">
              {loading ? (
                <span className="inline-block h-8 w-12 animate-pulse rounded bg-gray-200"></span>
              ) : (
                dashboardStats.orderCount
              )}
            </p>
          </div>
        </div>

        {/* Buyers Stats Card */}
        <div className="flex items-center rounded-lg border-l-4 border-green-500 bg-white p-4 shadow">
          <div className="mr-4 rounded-full bg-green-100 p-3">
            <UsersThree size={24} weight="duotone" className="text-green-600" />
          </div>
          <div>
            <h3 className="text-sm text-gray-500">Buyers</h3>
            <p className="text-2xl font-bold">
              {loading ? (
                <span className="inline-block h-8 w-12 animate-pulse rounded bg-gray-200"></span>
              ) : (
                dashboardStats.buyerCount
              )}
            </p>
          </div>
        </div>

        {/* Sellers Stats Card */}
        <div className="flex items-center rounded-lg border-l-4 border-purple-500 bg-white p-4 shadow">
          <div className="mr-4 rounded-full bg-purple-100 p-3">
            <UserPlus size={24} weight="duotone" className="text-purple-600" />
          </div>
          <div>
            <h3 className="text-sm text-gray-500">Sellers</h3>
            <p className="text-2xl font-bold">
              {loading ? (
                <span className="inline-block h-8 w-12 animate-pulse rounded bg-gray-200"></span>
              ) : (
                dashboardStats.sellerCount
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Dashboard Widgets */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Inventory Alerts Widget */}
        <InventoryAlerts />

        {/* Recent Activity Widget - Placeholder for future implementation */}
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Recent Activity</h3>
            <button className="flex items-center text-sm text-amber-600 hover:text-amber-800">
              View All <ChartLine size={16} className="ml-1" />
            </button>
          </div>
          <div className="py-12 text-center text-gray-500">
            <CurrencyCircleDollar
              size={40}
              weight="duotone"
              className="mx-auto mb-2"
            />
            <p>Activity tracking coming soon</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
