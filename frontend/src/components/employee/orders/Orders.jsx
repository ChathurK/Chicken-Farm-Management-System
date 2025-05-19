import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../DashboardLayout';
import {
  MagnifyingGlass,
  CaretDown,
  Eye,
} from '@phosphor-icons/react';
import api from '../../../utils/api';

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/orders');
        setOrders(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders. Please try again.');
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Filter orders based on search term and status
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      String(order.order_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.buyer?.first_name || '')
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (order.buyer?.last_name || '')
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === 'All' || order.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

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

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleRowClick = (orderId) => {
    navigate(`/employee/orders/${orderId}`);
  };

  return (
    <DashboardLayout>
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Orders Management</h1>
          <p className="text-gray-600 mt-1">View and update order status</p>
        </div>

        {/* Show error if any */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-700">
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-2 font-medium underline"
            >
              Dismiss
            </button>
          </div>
        )}
        
        {/* Search and Filter */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlass size={20} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pl-10 text-sm text-gray-900 focus:border-amber-500 focus:ring-amber-500"
              placeholder="Search orders by ID or customer"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-64">
            <div className="relative">
              <select
                className="block w-full appearance-none rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-amber-500 focus:ring-amber-500"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <CaretDown size={16} className="text-gray-400" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Orders Table */}
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-amber-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500">
              <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    Order ID
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Customer
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Deadline
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr
                    key={order.order_id}
                    className="border-b bg-white hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleRowClick(order.order_id)}
                  >
                    <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">
                      #{order.order_id}
                    </td>
                    <td className="px-6 py-4">
                      {order.buyer
                        ? `${order.buyer.first_name} ${order.buyer.last_name}`
                        : 'Unknown Buyer'}
                    </td>
                    <td className="px-6 py-4">
                      {formatDate(order.order_date)}
                    </td>
                    <td className="px-6 py-4">
                      {order.deadline_date
                        ? formatDate(order.deadline_date)
                        : 'Not set'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 text-xs font-semibold ${getStatusColor(order.status)}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex space-x-2">
                        <button
                          onClick={() =>
                            navigate(`/employee/orders/${order.order_id}`)
                          }
                          className="text-blue-500 hover:text-blue-700"
                          title="View Details"
                        >
                          <Eye size={18} weight="bold" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filteredOrders.length === 0 && !loading && (
          <div className="py-4 text-center">
            <p className="text-gray-500">
              No orders found matching your criteria.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Orders;
