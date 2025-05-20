import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { ShoppingCart, ArchiveBox, Hand, Package, CalendarBlank, Tag, ChartLine } from '@phosphor-icons/react';
import api from '../../utils/api';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboardStats, setDashboardStats] = useState({
    inventoryCount: 0,
    orderCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentInventory, setRecentInventory] = useState([]);
  const [ongoingOrders, setOngoingOrders] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch relevant employee dashboard stats in parallel
        const [inventoryRes, ordersRes] = await Promise.all([
          api.get('/api/inventory'),
          api.get('/api/orders'),
        ]);

        const ongoingOrdersCount = ordersRes.data.filter(
          (order) => order.status == 'Ongoing'
        ).length;

        setDashboardStats({
          inventoryCount: inventoryRes.data.length,
          orderCount: ongoingOrdersCount,
        });
        setLoading(false);

        // Get recent inventory records
        setInventoryLoading(true);
        try {
          // Inventory data and sort it by a timestamp field
          const inventoryRecords = [...inventoryRes.data]
            .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))
            .slice(0, 5);

          setRecentInventory(inventoryRecords);
          setInventoryLoading(false);
        } catch (err) {
          console.error('Error fetching recent inventory records:', err);
          setInventoryLoading(false);
        }

        // Get ongoing orders
        setOrdersLoading(true);
        try {
          // Filter orders from the API response
          const filteredOngoingOrders = ordersRes.data.filter(order => order.status === 'Ongoing');

          // Sort by due date (nearest deadline first) and get the 5 most urgent orders
          const activeOrders = filteredOngoingOrders
            .sort((a, b) => new Date(a.deadline_date) - new Date(b.deadline_date))
            .slice(0, 5);

          setOngoingOrders(activeOrders);
          setOrdersLoading(false);
        } catch (err) {
          console.error('Error fetching ongoing orders:', err);
          setOrdersLoading(false);
        }
      } catch (error) {
        setLoading(false);
        setInventoryLoading(false);
        setOrdersLoading(false);
        console.error('Error fetching dashboard data:', error);
      }
    };
    fetchDashboardData();
  }, []);

  // Status color utility
  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Ongoing':
        return 'bg-blue-100 text-blue-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout>
      {/* Welcome Section */}
      <div className="mb-6 rounded-lg bg-white p-6 shadow">
        <div className="flex items-center">
          <Hand size={32} weight="duotone" className="mr-3 text-amber-500" />
          <h1 className="text-2xl font-bold">
            Hello, {user?.first_name ? user.first_name : 'User'}!
          </h1>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Inventory Stats Card */}
        <div
          onClick={() => navigate('/employee/inventory')}
          className="flex cursor-pointer items-center rounded-lg border-l-4 border-amber-500 bg-white p-4 shadow transition-all duration-200 hover:bg-gray-50 hover:shadow-lg"
        >
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
        <div
          onClick={() => navigate('/employee/orders')}
          className="flex cursor-pointer items-center rounded-lg border-l-4 border-blue-500 bg-white p-4 shadow transition-all duration-200 hover:bg-gray-50 hover:shadow-lg"
        >
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
      </div>
      {/* Dashboard Widgets */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Recent Inventory Records */}
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Recent Inventory Records</h3>
            <button
              className="flex items-center text-sm text-amber-600 hover:text-amber-800"
              onClick={() => navigate('/employee/inventory')}
            >
              View All <ChartLine size={16} className="ml-1" />
            </button>
          </div>

          {inventoryLoading ? (
            <div className="flex justify-center py-6">
              <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-amber-500"></div>
            </div>
          ) : recentInventory.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <Package size={40} weight="duotone" className="mx-auto mb-2" />
              <p>No recent inventory records found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {recentInventory.map((item) => (
                <div key={item.inventory_id || item.id} className="py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Tag className="mr-2 text-amber-500" size={20} />
                      <div>
                        <p className="font-medium">
                          {item.item_name || item.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Qty: {parseInt(item.quantity)} {item.unit}
                        </p>
                      </div>
                    </div>
                    <span className={item.quantity > 10 ? "text-green-600" : "text-orange-600"}>
                      {item.status || (item.quantity > 10 ? "In Stock" : "Low Stock")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ongoing Orders */}
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Ongoing Orders</h3>
            <button
              className="flex items-center text-sm text-amber-600 hover:text-amber-800"
              onClick={() => navigate('/employee/orders')}
            >
              View All <ChartLine size={16} className="ml-1" />
            </button>
          </div>

          {ordersLoading ? (
            <div className="flex justify-center py-6">
              <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-amber-500"></div>
            </div>
          ) : ongoingOrders.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <ShoppingCart size={40} weight="duotone" className="mx-auto mb-2" />
              <p>No ongoing orders found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {ongoingOrders.map((order) => (
                <div key={order.order_id || order.id} className="py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <ShoppingCart className="mr-2 text-blue-500" size={20} />
                      <div>
                        <p className="font-medium">
                          Order #{order.order_id || order.id}
                        </p>
                        <div className="flex items-center text-xs text-gray-500">
                          <CalendarBlank className="mr-1 inline-block" size={12} />
                          Due:
                          <p className="ml-1 text-red-500">
                            {new Date(order.deadline_date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full font-semibold ${getStatusColor(order.status)}`}
                    >
                      {order.status || 'Processing'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}