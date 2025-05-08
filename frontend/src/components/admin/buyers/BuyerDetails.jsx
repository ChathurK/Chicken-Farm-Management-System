import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../DashboardLayout';
import { ArrowLeft, Pencil, Package, CalendarBlank, CurrencyCircleDollar, ClockCountdown } from '@phosphor-icons/react';
import api from '../../../utils/api';

const BuyerDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [buyer, setBuyer] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBuyerData();
    fetchOrderHistory();
  }, [id]);

  const fetchBuyerData = async () => {
    try {
      const response = await api.get(`/api/buyers/${id}`);
      setBuyer(response.data);
    } catch (err) {
      setError(err.response?.data?.msg || 'Error fetching buyer data');
    }
  };

  const fetchOrderHistory = async () => {
    try {
      const response = await api.get(`/api/buyers/${id}/orders`);
      setOrderHistory(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.msg || 'Error fetching order history');
      setLoading(false);
    }
  };

  // Format date to a more readable format
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
            <span className="ml-2">Loading...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="bg-white rounded-lg shadow">
        {/* Header with back button */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <button 
              onClick={() => navigate('/admin/buyers')}
              className="mr-4 text-gray-600 hover:text-amber-600"
            >
              <ArrowLeft size={24} weight="duotone" />
            </button>
            <h1 className="text-2xl font-bold">Buyer Details</h1>
            
            {/* Edit button */}
            <button 
              onClick={() => navigate(`/admin/buyers/edit/${id}`)}
              className="ml-auto text-amber-600 hover:text-amber-700 flex items-center"
            >
              <Pencil size={18} weight="duotone" className="mr-1" />
              Edit
            </button>
          </div>
        </div>
        
        {error && (
          <div className="m-6 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        {buyer && (
          <div className="p-6">
            {/* Buyer Information */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Name</h3>
                  <p className="mt-1 text-base">{buyer.first_name} {buyer.last_name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Contact Number</h3>
                  <p className="mt-1 text-base">{buyer.contact_number}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Email</h3>
                  <p className="mt-1 text-base">{buyer.email || "-"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Address</h3>
                  <p className="mt-1 text-base">{buyer.address || "-"}</p>
                </div>
                {buyer.created_at && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Customer Since</h3>
                    <p className="mt-1 text-base">{formatDate(buyer.created_at)}</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Order History Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Order History</h2>
              </div>
              
              {orderHistory.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <Package size={48} weight="duotone" className="mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-600">No order history found for this buyer.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3">Order ID</th>
                        <th scope="col" className="px-6 py-3">Date</th>
                        <th scope="col" className="px-6 py-3">Items</th>
                        <th scope="col" className="px-6 py-3">Total</th>
                        <th scope="col" className="px-6 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderHistory.map((order) => (
                        <tr key={order.order_id} className="bg-white border-b hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/admin/orders/${order.order_id}`)}>
                          <td className="px-6 py-4 font-medium text-amber-600">#{order.order_id}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <CalendarBlank size={16} weight="duotone" className="text-gray-400 mr-2" />
                              {formatDate(order.order_date)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <Package size={16} weight="duotone" className="text-gray-400 mr-2" />
                              {order.total_items || 0}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <CurrencyCircleDollar size={16} weight="duotone" className="text-gray-400 mr-2" />
                              ${parseFloat(order.order_total || 0).toFixed(2)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default BuyerDetails;