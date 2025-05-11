import { useState, useEffect } from 'react';
import { ClockCounterClockwise, Package, CurrencyCircleDollar, CalendarBlank } from '@phosphor-icons/react';
import api from '../../../utils/api';

const BuyerOrderHistory = ({ buyerId }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/buyers/${buyerId}/orders`);
        setOrders(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load order history. Please try again.');
        setLoading(false);
        console.error('Error fetching orders:', err);
      }
    };

    if (buyerId) {
      fetchOrders();
    }
  }, [buyerId]);
  // Format date to a more readable format
  const formatDate = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR',
    }).format(amount);
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'ongoing': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
        <p>{error}</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="py-6 text-center">
        <Package
          size={48}
          weight="duotone"
          className="mx-auto mb-2 text-gray-400"
        />
        <p className="text-gray-500">
          No order history found for this buyer.
        </p>
      </div>
    );
  }
  return (
    <div className="rounded-lg bg-white">
      <div className="mb-4 flex items-center gap-2 text-gray-700">
        <ClockCounterClockwise size={20} weight="duotone" />
        <h3 className="text-lg font-semibold">Order History</h3>
      </div>

      <div className="overflow-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="w-full text-left text-sm text-gray-500">
          <thead className="sticky top-0 bg-gray-50 text-xs uppercase text-gray-700">
            <tr>
              <th scope="col" className="px-4 py-3">Order ID</th>
              <th scope="col" className="px-4 py-3">Date</th>
              <th scope="col" className="px-4 py-3">Items</th>
              <th scope="col" className="px-4 py-3">Total</th>
              <th scope="col" className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.order_id}
                className="border-b bg-white hover:bg-gray-50 cursor-pointer"
                onClick={() => window.location.href = `/admin/orders/${order.order_id}`}
              >
                <td className="px-4 py-4 font-medium text-amber-600">
                  #{order.order_id}
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center">
                    <CalendarBlank size={16} weight="duotone" className="mr-2 text-gray-400" />
                    {formatDate(order.order_date)}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center">
                    <Package size={16} weight="duotone" className="mr-2 text-gray-400" />
                    {order.total_items || 0} items
                  </div>
                </td>
                <td className="px-4 py-4 font-medium">
                  <div className="flex items-center">
                    <CurrencyCircleDollar size={16} weight="duotone" className="mr-2 text-gray-400" />
                    {formatCurrency(order.order_total || 0)}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BuyerOrderHistory;
