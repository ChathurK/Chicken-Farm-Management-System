import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../DashboardLayout';
import { MagnifyingGlass, CaretDown, DotsThreeVertical, Eye, Pencil, Trash, Plus, X } from '@phosphor-icons/react';
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
    return new Date(dateString).toLocaleDateString('en-CA');
  };

  const calculateOrderTotal = (items) => {
    if (!items || items.length === 0) return 0;
    return items.reduce(
      (sum, item) => sum + item.quantity * item.unit_price,
      0
    );
  };

  const handleDeleteClick = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await api.delete(`/api/orders/${orderId}`);
        setOrders((prev) => prev.filter((order) => order.order_id !== orderId));
      } catch (err) {
        console.error('Error deleting order:', err);
        setError('Failed to delete order. Please try again.');
      }
    }
  }
  
  const handleRowClick = (orderId) => {
    navigate(`/admin/orders/${orderId}`);
  };

  return (
    <DashboardLayout>
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Orders</h1>
          <button
            className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-white transition-colors hover:bg-amber-600"
            onClick={() => navigate('/admin/orders/new')}
          >
            <Plus size={18} weight="bold" />
            Create New Order
          </button>
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
              <MagnifyingGlass
                size={20}
                weight="duotone"
                className="text-gray-400"
              />
            </div>
            <input
              type="text"
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pl-10 text-sm text-gray-900 focus:border-amber-500 focus:outline-none"
              placeholder="Search orders by ID or customer"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                title="Clear search"
              >
                <X size={18} weight="bold" />
              </button>
            )}
          </div>

          <div className="w-full md:w-64">
            <div className="relative">
              <select
                className="block w-full cursor-pointer appearance-none rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-amber-500 focus:outline-none"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <CaretDown
                  size={16}
                  weight="duotone"
                  className="text-gray-400"
                />
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
          <div className="overflow-auto rounded-lg border border-gray-200 shadow-sm">
            <table className="w-full text-left text-sm text-gray-500">
              <thead className="sticky top-0 bg-gray-50 text-xs uppercase text-gray-700">
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
                  <th scope="col" className="px-6 py-3 text-right">
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
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() =>
                            navigate(`/admin/orders/${order.order_id}`)
                          }
                          className="text-amber-500 hover:text-amber-700"
                          title="View Details"
                        >
                          <Eye size={18} weight="duotone" />
                        </button>
                        <button
                          onClick={() =>
                            navigate(`/admin/orders/edit/${order.order_id}`)
                          }
                          className="text-blue-500 hover:text-blue-700"
                          title="Edit Order"
                        >
                          <Pencil size={18} weight="duotone" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(order.order_id)}
                          className="text-red-500 hover:text-red-700"
                          title="Delete Order"
                        >
                          <Trash size={18} weight="duotone" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filteredOrders.length === 0 && (
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
