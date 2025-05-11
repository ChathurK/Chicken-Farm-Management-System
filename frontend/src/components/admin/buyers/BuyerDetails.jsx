import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash, User, Phone, Envelope, MapPin, Clock } from '@phosphor-icons/react';
import DashboardLayout from '../DashboardLayout';
import BuyerOrderHistory from './BuyerOrderHistory';
import { ConfirmationModal } from './BuyerModal';
import api from '../../../utils/api';

const BuyerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [buyer, setBuyer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const fetchBuyerDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/buyers/${id}`);
        setBuyer(response.data);
        setLoading(false);
      } catch (err) {
        if (err.response.status === 404) {
          setBuyer(false);
        } else {
          setError('Failed to load buyer details. Please try again.');
        }
        setLoading(false);
        console.error('Error fetching buyer details:', err);
      }
    };

    fetchBuyerDetails();
  }, [id]);

  const handleDelete = async () => {
    try {
      await api.delete(`/api/buyers/${id}`);
      navigate('/admin/buyers');
    } catch (err) {
      setError(err.response.data.msg);
      console.error('Error deleting buyer:', err);
    } finally {
      setShowDeleteModal(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
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
            onClick={() => navigate('/admin/buyers')}
            className="mt-2 text-red-700 underline hover:text-red-800"
          >
            Return to Buyers List
          </button>
        </div>
      </DashboardLayout>
    );
  }

  if (!buyer) {
    return (
      <DashboardLayout>
        <div className="py-8 text-center">
          <p className="text-gray-500">Buyer not found.</p>
          <button
            onClick={() => navigate('/admin/buyers')}
            className="mt-2 text-amber-500 hover:text-amber-600"
          >
            Return to Buyers List
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
              onClick={() => navigate('/admin/buyers')}
              className="mr-4 text-gray-600 hover:text-amber-500"
            >
              <ArrowLeft size={24} weight="duotone" />
            </button>
            <h1 className="text-2xl font-bold">
              {buyer.first_name} {buyer.last_name}
            </h1>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/admin/buyers/edit/${id}`)}
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

        {/* Buyer details card */}
        <div className="mb-8 rounded-lg bg-gray-50 p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="flex items-start gap-3">
              <User
                size={24}
                weight="duotone"
                className="mt-0.5 text-amber-500"
              />
              <div>
                <h3 className="text-sm text-gray-500">Name</h3>
                <p className="font-medium text-gray-800">
                  {buyer.first_name} {buyer.last_name}
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
                <h3 className="text-sm text-gray-500">Contact Number</h3>
                <p className="font-medium text-gray-800">
                  {buyer.contact_number}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Envelope
                size={24}
                weight="duotone"
                className="mt-0.5 text-amber-500"
              />
              <div>
                <h3 className="text-sm text-gray-500">Email</h3>
                <p className="font-medium text-gray-800">
                  {buyer.email || 'Not provided'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock
                size={24}
                weight="duotone"
                className="mt-0.5 text-amber-500"
              />
              <div>
                <h3 className="text-sm text-gray-500">Customer Since</h3>
                <p className="font-medium text-gray-800">
                  {formatDate(buyer.created_at)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 md:col-span-2">
              <MapPin
                size={24}
                weight="duotone"
                className="mt-0.5 text-amber-500"
              />
              <div>
                <h3 className="text-sm text-gray-500">Address</h3>
                <p className="font-medium text-gray-800">
                  {buyer.address || 'Not provided'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Order History */}
        <BuyerOrderHistory buyerId={id} />
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        title="Delete Buyer"
        message="Are you sure you want to delete this buyer? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonClass="bg-red-500 hover:bg-red-600"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </DashboardLayout>
  );
};

export default BuyerDetails;