import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  CalendarBlank,
  ArrowCircleUp,
  ArrowCircleDown,
} from '@phosphor-icons/react';
import api from '../../utils/api';

// Recent Activity Component
const RecentActivity = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecentTransactions = async () => {
      try {
        setLoading(true);
        // Get the 5 most recent transactions
        const response = await api.get('/api/transactions', {
          params: { limit: 5 },
        });
        setTransactions(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load recent activity');
        setLoading(false);
        console.error('Error fetching recent transactions:', err);
      }
    };

    fetchRecentTransactions();
  }, []);

  // Format date to display in a readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6 text-center text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500">
        <CurrencyCircleDollar
          size={40}
          weight="duotone"
          className="mx-auto mb-2"
        />
        <p>No recent activity found</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {transactions.map((transaction) => (
        <div key={transaction.transaction_id} className="py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {transaction.transaction_type === 'Income' ? (
                <ArrowCircleUp className="mr-2 text-green-500" size={20} />
              ) : (
                <ArrowCircleDown className="mr-2 text-red-500" size={20} />
              )}
              <div>
                <p className="font-medium">
                  {transaction.description ||
                    (transaction.item_name
                      ? `${transaction.transaction_type} - ${transaction.item_name}`
                      : transaction.transaction_type)}
                </p>
                <p className="text-xs text-gray-500">
                  <CalendarBlank className="mr-1 inline-block" size={12} />
                  {formatDate(transaction.transaction_date)}
                </p>
              </div>
            </div>
            <span
              className={`font-semibold ${transaction.transaction_type === 'Income' ? 'text-green-600' : 'text-red-600'}`}
            >
              {transaction.transaction_type === 'Income' ? '+' : '-'}$
              {transaction.amount.toFixed(2)}
            </span>
          </div>
        </div>
      ))}
      <div className="pt-3 text-center">
        <button
          className="text-sm text-amber-600 hover:text-amber-800"
          onClick={() => navigate('/admin/finance/transactions')}
        >
          View All Transactions
        </button>
      </div>
    </div>
  );
};

// --- Admin Dashboard ---
export default function AdminDashboard() {
  const navigate = useNavigate();
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
        setLoading(true);
        // Fetch all dashboard stats in parallel
        const [inventoryRes, ordersRes, buyersRes, sellersRes] =
          await Promise.all([
            api.get('/api/inventory'),
            api.get('/api/orders'),
            api.get('/api/buyers'),
            api.get('/api/sellers'),
          ]);
        setDashboardStats({
          inventoryCount: inventoryRes.data.length,
          orderCount: ordersRes.data.length,
          buyerCount: buyersRes.data.length,
          sellerCount: sellersRes.data.length,
        });
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.error('Error fetching dashboard data:', error);
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
        {/* Recent Activity Widget */}
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Recent Activity</h3>
            <button
              className="flex items-center text-sm text-amber-600 hover:text-amber-800"
              onClick={() => navigate('/admin/finance/transactions')}
            >
              View All <ChartLine size={16} className="ml-1" />
            </button>
          </div>
          <RecentActivity />
        </div>
      </div>
    </DashboardLayout>
  );
}
