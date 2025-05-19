import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash, User, Calendar, CalendarCheck, ClockClockwise, Package, Phone, MapPin, Plus, Check, X } from '@phosphor-icons/react';
import DashboardLayout from '../DashboardLayout';
import api from '../../../utils/api';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDeleteItemModal, setShowDeleteItemModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/orders/${id}`);
        setOrder(response.data);
        setLoading(false);
      } catch (err) {
        if (err.response?.status === 404) {
          setOrder(false);
        } else {
          setError('Failed to load order details. Please try again.');
        }
        setLoading(false);
        console.error('Error fetching order details:', err);
      }
    };

    fetchOrderDetails();
  }, [id]);

  const handleDelete = async () => {
    try {
      await api.delete(`/api/orders/${id}`);
      navigate('/admin/orders');
    } catch (err) {
      setError(err.response?.data?.msg || 'Error deleting order');
      console.error('Error deleting order:', err);
    } finally {
      setShowDeleteModal(false);
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await api.delete(`/api/orders/${id}/items/${itemId}`);
      
      // Update the order state by filtering out the deleted item
      setOrder({
        ...order,
        items: order.items.filter(item => item.order_item_id !== itemId)
      });
      
      setShowDeleteItemModal(false);
      setItemToDelete(null);
    } catch (err) {
      setError(err.response?.data?.msg || 'Error deleting item');
      console.error('Error deleting item:', err);
    }
  };

  const handleStatusChange = async () => {
    try {
      await api.patch(`/api/orders/${id}/status`, { status: newStatus });
      // Update the order state
      setOrder({
        ...order,
        status: newStatus
      });
      setShowStatusModal(false);
    } catch (err) {
      setError(err.response?.data?.msg || 'Error updating status');
      console.error('Error updating status:', err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Ongoing': return 'bg-blue-100 text-blue-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProductTypeColor = (type) => {
    switch(type) {
      case 'Chicken': return 'bg-amber-100 text-amber-800';
      case 'Chick': return 'bg-yellow-100 text-yellow-800';
      case 'Egg': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateTotal = (items) => {
    if (!items || items.length === 0) return 0;
    return items.reduce((sum, item) => sum + parseFloat(item.total_price), 0);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-amber-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="mb-4 rounded-lg bg-red-100 px-4 py-3 text-red-700">
          <p>{error}</p>
          <button
            onClick={() => navigate('/admin/orders')}
            className="mt-2 text-red-700 underline hover:text-red-800"
          >
            Return to Orders List
          </button>
        </div>
      </DashboardLayout>
    );
  }

  if (!order) {
    return (
      <DashboardLayout>
        <div className="py-8 text-center">
          <p className="text-gray-500">Order not found.</p>
          <button
            onClick={() => navigate('/admin/orders')}
            className="mt-2 text-amber-500 hover:text-amber-600"
          >
            Return to Orders List
          </button>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="rounded-lg bg-white p-6 shadow">
        {/* Header with back button and actions */}
        <div className="mb-6 flex flex-wrap items-center justify-between">
          <div className="mb-2 flex items-center sm:mb-0">
            <button
              onClick={() => navigate('/admin/orders')}
              className="mr-4 text-gray-600 hover:text-amber-500"
            >
              <ArrowLeft size={24} weight="duotone" />
            </button>
            <h1 className="text-2xl font-bold">
              Order #{order.order_id}
            </h1>
            <span className={`ml-4 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getStatusColor(order.status)}`}>
              {order.status}
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                setNewStatus(order.status);
                setShowStatusModal(true);
              }}
              className="flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300"
            >
              <ClockClockwise size={18} weight="bold" />
              Update Status
            </button>
            <button
              onClick={() => navigate(`/admin/orders/edit/${id}`)}
              className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <Pencil size={18} weight="bold" />
              Edit
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300"
            >
              <Trash size={18} weight="bold" />
              Delete
            </button>
          </div>
        </div>

        {/* Order details */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Order Information */}
          <div className="rounded-lg bg-gray-50 p-6">
            <h2 className="mb-4 text-lg font-semibold">Order Information</h2>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-start gap-3">
                <Calendar
                  size={24}
                  weight="duotone"
                  className="mt-0.5 text-amber-500"
                />
                <div>
                  <h3 className="text-sm text-gray-500">Order Date</h3>
                  <p className="font-medium text-gray-800">
                    {formatDate(order.order_date)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CalendarCheck
                  size={24}
                  weight="duotone"
                  className="mt-0.5 text-amber-500"
                />
                <div>
                  <h3 className="text-sm text-gray-500">Delivery Deadline</h3>
                  <p className="font-medium text-gray-800">
                    {formatDate(order.deadline_date)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ClockClockwise
                  size={24}
                  weight="duotone"
                  className="mt-0.5 text-amber-500"
                />
                <div>
                  <h3 className="text-sm text-gray-500">Status</h3>
                  <p className="font-medium text-gray-800">
                    {order.status}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Buyer Information */}
          <div className="rounded-lg bg-gray-50 p-6">
            <h2 className="mb-4 text-lg font-semibold">Buyer Information</h2>
            {order.buyer ? (
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-start gap-3">
                  <User
                    size={24}
                    weight="duotone"
                    className="mt-0.5 text-amber-500"
                  />
                  <div>
                    <h3 className="text-sm text-gray-500">Name</h3>
                    <p className="font-medium text-gray-800">
                      {order.buyer.first_name} {order.buyer.last_name}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone
                    size={24}
                    weight="duotone"
                    className="mt-0.5 text-amber-500"
                  />
                  <div>
                    <h3 className="text-sm text-gray-500">Contact</h3>
                    <p className="font-medium text-gray-800">
                      {order.buyer.contact_number}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin
                    size={24}
                    weight="duotone"
                    className="mt-0.5 text-amber-500"
                  />
                  <div>
                    <h3 className="text-sm text-gray-500">Address</h3>
                    <p className="font-medium text-gray-800">
                      {order.buyer.address || 'Not provided'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Buyer information not available</p>
            )}
          </div>
        </div>

        {/* Order Items */}
        <div className="mb-4 rounded-lg bg-gray-50 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Order Items</h2>
            <button
              onClick={() => navigate(`/admin/orders/${id}/add-item`)}
              className="flex items-center gap-2 rounded-lg bg-amber-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-300"
            >
              <Plus size={16} weight="bold" />
              Add Item
            </button>
          </div>

          {order.items && order.items.length > 0 ? (
            <>
              <div className="overflow-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 text-xs uppercase">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium tracking-wider text-gray-500">#</th>
                      <th className="px-4 py-3 text-left font-medium tracking-wider text-gray-500">Product</th>
                      <th className="px-4 py-3 text-left font-medium tracking-wider text-gray-500">Details</th>
                      <th className="px-4 py-3 text-left font-medium tracking-wider text-gray-500">Qty</th>
                      <th className="px-4 py-3 text-left font-medium tracking-wider text-gray-500">Unit Price</th>
                      <th className="px-4 py-3 text-left font-medium tracking-wider text-gray-500">Total</th>
                      <th className="px-4 py-3 text-right font-medium tracking-wider text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {order.items.map((item, index) => (
                      <tr key={item.order_item_id} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getProductTypeColor(item.product_type)}`}>
                            {item.product_type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {item.notes ? (
                            <div className="max-w-xs">
                              {item.notes}
                            </div>
                          ) : (
                            <span className="text-gray-400">No details</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          Rs. {parseFloat(item.unit_price).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          Rs. {parseFloat(item.total_price).toFixed(2)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium">
                          <div className="flex justify-end">
                            <button
                              onClick={() => navigate(`/admin/orders/${id}/items/${item.order_item_id}/edit`)}
                              className="mr-2 text-blue-500 hover:text-blue-700"
                              title="Edit item"
                            >
                              <Pencil size={18} weight="duotone" />
                            </button>
                            <button
                              onClick={() => {
                                setItemToDelete(item);
                                setShowDeleteItemModal(true);
                              }}
                              className="text-red-500 hover:text-red-700"
                              title="Delete item"
                            >
                              <Trash size={18} weight="duotone" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 font-medium">
                      <td colSpan="5" className="px-4 py-3 text-right">
                        Total:
                      </td>
                      <td className="px-4 py-3 text-gray-900">
                        Rs. {calculateTotal(order.items).toFixed(2)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </>
          ) : (
            <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
              <p className="text-gray-500">No items in this order yet.</p>
              <button
                onClick={() => navigate(`/admin/orders/${id}/add-item`)}
                className="mt-2 text-amber-500 hover:text-amber-600"
              >
                Add your first item
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Order Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 !mt-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h3 className="mb-4 text-xl font-bold">Delete Order</h3>
            <p className="mb-6">
              Are you sure you want to delete this order? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="rounded-lg bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Item Confirmation Modal */}
      {showDeleteItemModal && itemToDelete && (
        <div className="fixed inset-0 z-50 !mt-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h3 className="mb-4 text-xl font-bold">Delete Item</h3>
            <p className="mb-6">
              Are you sure you want to remove this order item from the order? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowDeleteItemModal(false);
                  setItemToDelete(null);
                }}
                className="rounded-lg bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteItem(itemToDelete.order_item_id)}
                className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 !mt-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h3 className="mb-4 text-xl font-bold">Update Order Status</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Select New Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
              >
                <option value="Ongoing">Ongoing</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowStatusModal(false)}
                className="flex items-center gap-1 rounded-lg bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                <X size={16} weight="bold" />
                Cancel
              </button>
              <button
                onClick={handleStatusChange}
                className="flex items-center gap-1 rounded-lg bg-green-500 px-4 py-2 text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300"
              >
                <Check size={16} weight="bold" />
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default OrderDetails;
