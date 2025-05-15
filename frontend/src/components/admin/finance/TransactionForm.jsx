import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FloppyDisk, CurrencyDollar, CalendarDots, ChatText, UserCircle, ShoppingBag, Bird, Egg, Plus, Warning, Tag, CircleWavyCheck } from '@phosphor-icons/react';
import DashboardLayout from '../DashboardLayout';
import api from '../../../utils/api';

import ContactModal from '../../shared/ContactModal';

const TransactionForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;  // Form state
  const [formData, setFormData] = useState({
    transaction_type: '',
    category: '',
    amount: '',
    notes: '',
    buyer_id: '',
    seller_id: '',
    inventory_id: '',
    transaction_date: new Date().toISOString().split('T')[0],
    livestock_type: '',
    // Chicken specific fields
    chicken_type: '',
    breed: '',
    chicken_record_id: '',
    // Chick specific fields
    parent_breed: '',
    chick_record_id: '',
    // Egg specific fields
    size: '',
    color: '',
    egg_record_id: '',
    quantity: '',
  });
  // Status states
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState({
    title: '',
    details: '',
    category: '',
    id: null
  });
  const [formErrors, setFormErrors] = useState({});
  const [showNewBuyerForm, setShowNewBuyerForm] = useState(false);
  const [showNewSellerForm, setShowNewSellerForm] = useState(false);
  const [availableQuantity, setAvailableQuantity] = useState(0);
  // Options for dropdowns
  const [buyers, setBuyers] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [chickenTypes] = useState(['Layer', 'Broiler', 'Breeder']);
  const [chickenBreeds, setChickenBreeds] = useState([]);
  const [eggSizes] = useState(['Small', 'Medium', 'Large']);
  const [eggColors] = useState(['White', 'Brown']);
  const [transactionCategories] = useState([
    'Chicken Sale',
    'Chicken Purchase',
    'Chick Sale',
    'Chick Purchase',
    'Egg Sale',
    'Egg Purchase',
    'Inventory Purchase',
    'Other'
  ]);

  // Load transaction data if in edit mode
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Create an array of promises for concurrent API calls
        const dataPromises = [
          api.get('/api/buyers'),
          api.get('/api/sellers'),
          api.get('/api/inventory'),
          api.get('/api/chickens'),
          api.get('/api/chicks'),
          api.get('/api/eggs'),
        ];

        // Add transaction data promise for edit mode
        if (isEditMode) {
          dataPromises.push(api.get(`/api/transactions/${id}`));
        }

        const responses = await Promise.all(dataPromises);
        console.log('All API calls succeeded:', responses);

        // Log transaction data fetch if applicable
        if (isEditMode) {
          console.log('Fetching transaction data for edit mode with ID:', id, 'is success:', responses);
        }

        // Extract response data
        const buyersRes = responses[0];
        const sellersRes = responses[1];
        const inventoryRes = responses[2];
        const chickenRes = responses[3];
        const chicksRes = responses[4];
        const eggRes = responses[5];

        // Set data for dropdowns
        setBuyers(buyersRes.data);
        setSellers(sellersRes.data);
        setInventoryItems(inventoryRes.data);

        // Extract unique breeds for the chicken breed dropdown
        const uniqueBreeds = [...new Set(chickenRes.data.map(chicken => chicken.breed))];
        setChickenBreeds(uniqueBreeds);

        // Handle transaction data in edit mode
        if (isEditMode && responses.length > 6) {
          const transactionData = responses[6].data;
          // Set form data with the transaction data
          setFormData({
            ...transactionData,
          });
        }

        setLoading(false);
      } catch (err) {
        setError('Error loading data. Please try again.');
        setLoading(false);
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, [id, isEditMode]);

  // Fetch available quantity when livestock type changes
  useEffect(() => {
    fetchAvailableQuantity(formData);
  }, [
    formData.livestock_type,
    formData.chicken_type,
    formData.breed,
    formData.parent_breed,
    formData.size,
    formData.color
  ]);

  // Helper function to fetch available quantity
  const fetchAvailableQuantity = async (data) => {
    try {
      if (!data.livestock_type) return;

      if (data.livestock_type === 'Chicken') {
        if (!data.chicken_type || !data.breed) return;

        const res = await api.get('/api/chickens', {
          params: {
            type: data.chicken_type,
            breed: data.breed
          }
        });

        if (res.data.length > 0) {
          const total = res.data.reduce((sum, item) => sum + item.quantity, 0);
          setAvailableQuantity(total);
        } else {
          setAvailableQuantity(0);
        }
      } else if (data.livestock_type === 'Chick') {
        if (!data.parent_breed) return;

        const res = await api.get('/api/chicks', {
          params: {
            parent_breed: data.parent_breed
          }
        });

        if (res.data.length > 0) {
          const total = res.data.reduce((sum, item) => sum + item.quantity, 0);
          setAvailableQuantity(total);
        } else {
          setAvailableQuantity(0);
        }
      } else if (data.livestock_type === 'Egg') {
        if (!data.size || !data.color) return;

        const res = await api.get('/api/eggs', {
          params: {
            size: data.size,
            color: data.color
          }
        });

        if (res.data.length > 0) {
          const total = res.data.reduce((sum, item) => sum + item.quantity, 0);
          setAvailableQuantity(total);
        } else {
          setAvailableQuantity(0);
        }
      }
    } catch (err) {
      console.error('Error fetching available quantity:', err);
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    setError(null); // Clear error when user types
    const { name, value } = e.target;    // Special handling for different form fields
    if (name === 'transaction_type') {
      // Set appropriate default category based on transaction type
      let defaultCategory = '';
      let livestockType = '';

      if (value === 'Income') {
        defaultCategory = ''; // Default for income
        livestockType = '';
      } else if (value === 'Expense') {
        defaultCategory = ''; // Default for expense
      }

      setFormData(prev => ({
        ...prev,
        [name]: value,
        category: defaultCategory,
        buyer_id: value === 'Income' ? prev.buyer_id : '',
        seller_id: value === 'Expense' ? prev.seller_id : '',
        // Reset livestock-related fields if transaction type changes
        livestock_type: value === 'Income' ? livestockType : '',
        chicken_type: '',
        breed: '',
        parent_breed: '',
        size: '',
        color: '',
        quantity: '',
        chicken_record_id: '',
        chick_record_id: '',
        egg_record_id: '',
      }));

      // Trigger a check for available quantity if appropriate
      if (value === 'Income' && livestockType) {
        setTimeout(() => {
          fetchAvailableQuantity({
            ...formData,
            transaction_type: value,
            category: defaultCategory,
            livestock_type: livestockType
          });
        }, 0);
      }
    } else if (name === 'category') {
      // Handle category change
      let resetFields = {};
      let additionalFields = {};

      // Reset livestock-related fields if not a livestock sale
      if (!['Chicken Sale', 'Chick Sale', 'Egg Sale'].includes(value)) {
        resetFields = {
          livestock_type: '',
          chicken_type: '',
          breed: '',
          parent_breed: '',
          size: '',
          color: '',
          quantity: '',
          chicken_record_id: '',
          chick_record_id: '',
          egg_record_id: ''
        };
      } else {
        // Set appropriate livestock type based on category
        let livestockType = '';
        if (value === 'Chicken Sale') {
          livestockType = 'Chicken';
        } else if (value === 'Chick Sale') {
          livestockType = 'Chick';
        } else if (value === 'Egg Sale') {
          livestockType = 'Egg';
        }

        // if (livestockType) {
        //   additionalFields = { 
        //     livestock_type: livestockType,
        //     batch_number: generateBatchNumber(livestockType)
        //   };
        // }
      }

      setFormData(prev => ({
        ...prev,
        [name]: value,
        ...resetFields,
        ...additionalFields
      }));
    } else if (name === 'livestock_type') {
      // Reset type-specific fields when livestock type changes
      setFormData(prev => ({
        ...prev,
        [name]: value,
        chicken_type: '',
        breed: '',
        parent_breed: '',
        size: '',
        color: '',
        quantity: '',
        chicken_record_id: '',
        chick_record_id: '',
        egg_record_id: ''
      }));

      setAvailableQuantity(0);
    } else if (
      name === 'chicken_type' ||
      name === 'breed' ||
      name === 'parent_breed' ||
      name === 'size' ||
      name === 'color'
    ) {
      // Reset quantity when attributes change
      setFormData(prev => ({
        ...prev,
        [name]: value,
        quantity: ''
      }));

      // If we have all required fields for available quantity check, trigger it immediately
      setTimeout(() => {
        const updatedFormData = { ...formData, [name]: value };
        if (
          (updatedFormData.livestock_type === 'Chicken' && updatedFormData.chicken_type && updatedFormData.breed) ||
          (updatedFormData.livestock_type === 'Chick' && updatedFormData.parent_breed) ||
          (updatedFormData.livestock_type === 'Egg' && updatedFormData.size && updatedFormData.color)
        ) {
          fetchAvailableQuantity(updatedFormData);
        }
      }, 0);
    } else if (name === 'buyer_id' && value === 'new') {
      // Set flag to show new buyer form
      setShowNewBuyerForm(true);
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    } else if (name === 'seller_id' && value === 'new') {
      // Set flag to show new seller form
      setShowNewSellerForm(true);
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear field-specific error when user types in that field
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Add new buyer handler
  const handleAddNewBuyer = (newBuyer) => {
    setBuyers(prev => [...prev, newBuyer]);
    setFormData(prev => ({ ...prev, buyer_id: newBuyer.buyer_id }));
    setShowNewBuyerForm(false);
  };

  // Add new seller handler
  const handleAddNewSeller = (newSeller) => {
    setSellers(prev => [...prev, newSeller]);
    setFormData(prev => ({ ...prev, seller_id: newSeller.seller_id }));
    setShowNewSellerForm(false);
  };

  // Form validation
  const validateForm = () => {
    const errors = {};

    if (!formData.transaction_type) {
      errors.transaction_type = 'Transaction type is required';
    }

    if (!formData.category) {
      errors.category = 'Transaction category is required';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      errors.amount = 'Amount must be greater than zero';
    }

    // if (!formData.notes) {
    //   errors.notes = 'notes is required';
    // }

    // For income transactions, require buyer_id
    if (formData.transaction_type === 'Income' && !formData.buyer_id) {
      errors.buyer_id = 'Buyer is required for income transactions';
    }

    // For expense transactions, require seller_id
    if (formData.transaction_type === 'Expense' && !formData.seller_id) {
      errors.seller_id = 'Seller is required for expense transactions';
    }

    // For Livestock Sale transactions, validate livestock fields
    if (formData.category === 'Chicken Sale' ||
      formData.category === 'Chick Sale' ||
      formData.category === 'Egg Sale') {
      if (!formData.livestock_type) {
        errors.livestock_type = 'Livestock type is required';
      } else {
        if (formData.livestock_type === 'Chicken') {
          if (!formData.chicken_type) {
            errors.chicken_type = 'Chicken type is required';
          }
          if (!formData.breed) {
            errors.breed = 'Breed is required';
          }
        } else if (formData.livestock_type === 'Chick') {
          if (!formData.parent_breed) {
            errors.parent_breed = 'Parent breed is required';
          }
        } else if (formData.livestock_type === 'Egg') {
          if (!formData.size) {
            errors.size = 'Egg size is required';
          }
          if (!formData.color) {
            errors.color = 'Egg color is required';
          }
        }

        if (!formData.quantity || parseInt(formData.quantity) <= 0) {
          errors.quantity = 'Quantity must be greater than zero';
        } else if (parseInt(formData.quantity) > availableQuantity) {
          errors.quantity = `Quantity cannot exceed available quantity (${availableQuantity})`;
        }
      }
    }

    // For Inventory Purchase transactions, validate inventory fields
    if (formData.transaction_type === 'Expense' && formData.category === 'Inventory Purchase') {
      if (!formData.inventory_id) {
        errors.inventory_id = 'Inventory item is required';
      }

      if (!formData.quantity || parseInt(formData.quantity) <= 0) {
        errors.quantity = 'Quantity must be greater than zero';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      // Scroll to the first error field
      const firstErrorField = Object.keys(formErrors)[0];
      const element = document.querySelector(`[name="${firstErrorField}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    try {
      setSubmitting(true);

      // Prepare data for API
      const apiData = { ...formData };
      // For Livestock Sale transactions, create or update livestock records
      if ((apiData.category === 'Chicken Sale' ||
        apiData.category === 'Chick Sale' ||
        apiData.category === 'Egg Sale') &&
        apiData.livestock_type && parseInt(apiData.quantity) > 0) {
        // Validate that we have enough quantity available
        if (parseInt(apiData.quantity) > availableQuantity) {
          setError(`Cannot sell more than the available quantity (${availableQuantity})`);
          setSubmitting(false);
          return;
        }
        // Create specific records based on livestock type
        if (apiData.livestock_type === 'Chicken') {
          const chickenData = {
            type: apiData.chicken_type,
            breed: apiData.breed,
            quantity: apiData.quantity
          };

          // Find existing chicken records with the same attributes
          const chickenRes = await api.get('/api/chickens', {
            params: {
              type: apiData.chicken_type,
              breed: apiData.breed
            }
          });
          if (chickenRes.data.length > 0) {
            // Update existing chicken record
            const existingChicken = chickenRes.data[0];
            apiData.chicken_record_id = existingChicken.chicken_record_id;

            // Deduct quantity from existing record
            const newQuantity = existingChicken.quantity - parseInt(apiData.quantity);
            if (newQuantity < 0) {
              setError(`Cannot sell more than the available quantity (${existingChicken.quantity})`);
              setSubmitting(false);
              return;
            }

            await api.put(`/api/chickens/${existingChicken.chicken_record_id}`, {
              ...chickenData,
              quantity: newQuantity,
              notes: existingChicken.notes ? `${existingChicken.notes}; Sold ${apiData.quantity} on ${new Date().toISOString().split('T')[0]}` : `Sold ${apiData.quantity} on ${new Date().toISOString().split('T')[0]}`
            });
          } else {
            // Create new chicken record
            const newChickenRes = await api.post('/api/chickens', {
              ...chickenData,
              status: 'Sold'
            });
            apiData.chicken_record_id = newChickenRes.data.chicken_record_id;
          }
        } else if (apiData.livestock_type === 'Chick') {
          const chickData = {
            parent_breed: apiData.parent_breed,
            hatched_date: new Date().toISOString().split('T')[0], // Default to today
            quantity: apiData.quantity
          };

          // Find existing chick records with the same attributes
          const chicksRes = await api.get('/api/chicks', {
            params: {
              parent_breed: apiData.parent_breed
            }
          });

          if (chicksRes.data.length > 0) {
            // Update existing chick record
            const existingChick = chicksRes.data[0];
            apiData.chick_record_id = existingChick.chick_record_id;

            // Deduct quantity from existing record
            const newQuantity = existingChick.quantity - parseInt(apiData.quantity);
            if (newQuantity < 0) {
              setError(`Cannot sell more than the available quantity (${existingChick.quantity})`);
              setSubmitting(false);
              return;
            }

            await api.put(`/api/chicks/${existingChick.chick_record_id}`, {
              ...chickData,
              quantity: newQuantity,
              notes: existingChick.notes ? `${existingChick.notes}; Sold ${apiData.quantity} on ${new Date().toISOString().split('T')[0]}` : `Sold ${apiData.quantity} on ${new Date().toISOString().split('T')[0]}`
            });
          } else {
            // Create new chick record
            const newChickRes = await api.post('/api/chicks', {
              ...chickData,
              status: 'Sold'
            });
            apiData.chick_record_id = newChickRes.data.chick_record_id;
          }
        } else if (apiData.livestock_type === 'Egg') {
          const eggData = {
            size: apiData.size,
            color: apiData.color,
            laid_date: new Date().toISOString().split('T')[0], // Default to today
            expiration_date: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0], // Default to 30 days from now
            quantity: apiData.quantity
          };

          // Find existing egg records with the same attributes
          const eggsRes = await api.get('/api/eggs', {
            params: {
              size: apiData.size,
              color: apiData.color
            }
          });

          if (eggsRes.data.length > 0) {
            // Update existing egg record
            const existingEgg = eggsRes.data[0];
            apiData.egg_record_id = existingEgg.egg_record_id;

            // Deduct quantity from existing record
            const newQuantity = existingEgg.quantity - parseInt(apiData.quantity);
            if (newQuantity < 0) {
              setError(`Cannot sell more than the available quantity (${existingEgg.quantity})`);
              setSubmitting(false);
              return;
            }

            await api.put(`/api/eggs/${existingEgg.egg_record_id}`, {
              ...eggData,
              quantity: newQuantity,
              notes: existingEgg.notes ? `${existingEgg.notes}; Sold ${apiData.quantity} on ${new Date().toISOString().split('T')[0]}` : `Sold ${apiData.quantity} on ${new Date().toISOString().split('T')[0]}`
            });
          } else {
            // Create new egg record
            const newEggRes = await api.post('/api/eggs', {
              ...eggData,
              status: 'Sold'
            });
            apiData.egg_record_id = newEggRes.data.egg_record_id;
          }
        }
      }

      // After handling livestock records, handle inventory purchases
      if (apiData.transaction_type === 'Expense' && apiData.category === 'Inventory Purchase' && apiData.inventory_id) {
        try {
          // Get the current inventory item
          const inventoryRes = await api.get(`/api/inventory/${apiData.inventory_id}`);
          const inventoryItem = inventoryRes.data;

          if (inventoryItem) {
            // Update the inventory quantity - for purchases, we add to the quantity
            const newQuantity = inventoryItem.quantity
              ? parseInt(inventoryItem.quantity) + (parseInt(apiData.quantity) || 1)
              : (parseInt(apiData.quantity) || 1);

            await api.put(`/api/inventory/${apiData.inventory_id}`, {
              ...inventoryItem,
              quantity: newQuantity,
              last_restocked: new Date().toISOString().split('T')[0],
              notes: inventoryItem.notes
                ? `${inventoryItem.notes}; Purchased ${apiData.quantity || 1} on ${new Date().toISOString().split('T')[0]}`
                : `Purchased ${apiData.quantity || 1} on ${new Date().toISOString().split('T')[0]}`
            });
          }
        } catch (err) {
          console.error('Error updating inventory quantity:', err);
          // Don't block the transaction if this fails
        }
      }

      // Remove fields that shouldn't be sent to the transaction API
      const transactionData = {
        transaction_type: apiData.transaction_type,
        category: apiData.category,
        amount: apiData.amount,
        notes: apiData.notes,
        buyer_id: apiData.buyer_id || null,
        seller_id: apiData.seller_id || null,
        inventory_id: apiData.inventory_id || null,
        transaction_date: apiData.transaction_date,
        chicken_record_id: apiData.chicken_record_id || null,
        chick_record_id: apiData.chick_record_id || null,
        egg_record_id: apiData.egg_record_id || null
      };

      // Convert empty strings to null
      for (const key in transactionData) {
        if (transactionData[key] === '') {
          transactionData[key] = null;
        }
      }

      // Send transaction data to API
      if (isEditMode) {
        await api.put(`/api/transactions/${id}`, transactionData);
        setSuccess(true);

        // Set detailed success message
        setSuccessMessage({
          title: 'Transaction updated successfully!',
          details: `${formData.transaction_type} transaction for ${formatCurrency(formData.amount)} has been updated.`,
          category: formData.category
        });

        // After a delay, navigate back to transaction list
        setTimeout(() => {
          navigate('/admin/finance/transactions');
        }, 2000);
      } else {
        const response = await api.post('/api/transactions', transactionData);
        setSuccess(true);

        // Set detailed success message
        setSuccessMessage({
          title: 'Transaction created successfully!',
          details: `${formData.transaction_type} transaction for ${formatCurrency(formData.amount)} has been recorded.`,
          category: formData.category,
          id: response.data.transaction_id
        });

        // After a delay, navigate back to transaction list
        setTimeout(() => {
          navigate('/admin/finance/transactions');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'An error occurred. Please try again.');
      setSubmitting(false);
      console.error('Error saving transaction:', err);
    }
  };

  // Format currency for display
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <DashboardLayout>
      <div className="bg-white-50 rounded-lg p-6 shadow">
        <div className="mb-6 flex items-center">
          <button
            onClick={() =>
              isEditMode
                ? navigate(`/admin/finance/transactions/${id}`)
                : navigate('/admin/finance/transactions')
            }
            className="mr-4 text-gray-600 hover:text-amber-500"
          >
            <ArrowLeft size={24} weight="duotone" />
          </button>
          <h1 className="text-2xl font-bold">
            {isEditMode ? 'Edit Transaction' : 'Add New Transaction'}
          </h1>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-amber-500"></div>
          </div>
        ) : (
          <div className="rounded-lg bg-white p-6 shadow">
            {error && (
              <div className="mb-4 rounded-lg bg-red-100 px-4 py-3 text-red-700">
                <p>{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-4 rounded-lg bg-green-100 px-4 py-3 text-green-700">
                <div className="flex items-center space-x-2">
                  <CircleWavyCheck size={24} weight="duotone" />
                  <p className="font-medium">{successMessage.title}</p>
                </div>
                <p className="mt-1">{successMessage.details}</p>
                {successMessage.id && (
                  <button
                    onClick={() =>
                      navigate(
                        `/admin/finance/transactions/${successMessage.id}`
                      )
                    }
                    className="mt-2 text-sm font-medium text-amber-600 hover:text-amber-800"
                  >
                    View Transaction Details →
                  </button>
                )}
                <p className="mt-2 text-sm">
                  You will be redirected back to the transactions list...
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-6 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
                {/* Transaction Type */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Transaction Type <span className="text-red-500">*</span>
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex cursor-pointer items-center">
                      <input
                        type="radio"
                        name="transaction_type"
                        value="Income"
                        checked={formData.transaction_type === 'Income'}
                        onChange={handleChange}
                        className="h-4 w-4 cursor-pointer"
                      />
                      <span className="ml-2 text-sm text-gray-700">Income</span>
                    </label>
                    <label className="flex cursor-pointer items-center">
                      <input
                        type="radio"
                        name="transaction_type"
                        value="Expense"
                        checked={formData.transaction_type === 'Expense'}
                        onChange={handleChange}
                        className="h-4 w-4 cursor-pointer"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Expense
                      </span>
                    </label>
                  </div>
                  {formErrors.transaction_type && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.transaction_type}
                    </p>
                  )}
                </div>
                {/* Transaction Category */}
                <div>
                  <label
                    htmlFor="category"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Transaction Category <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Tag size={20} className="text-gray-500" />
                    </div>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className={`block w-full cursor-pointer rounded-md border ${formErrors.category
                        ? 'border-red-300'
                        : 'border-gray-300'
                        } py-2 pl-10 pr-4 focus:border-amber-500 focus:outline-none`}
                    >
                      <option value="">Select a Category</option>
                      {transactionCategories
                        .filter((category) => {
                          // For Income, show only sale categories
                          if (formData.transaction_type === 'Income') {
                            return (
                              category.includes('Sale') || category === 'Other'
                            );
                          }
                          // For Expense, show only purchase categories
                          return (
                            category.includes('Purchase') ||
                            category === 'Other'
                          );
                        })
                        .map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                    </select>
                  </div>
                  {formErrors.category && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.category}
                    </p>
                  )}
                </div>
                {/* Amount */}
                <div>
                  <label
                    htmlFor="amount"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Amount <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-lg font-normal text-gray-500">
                        Rs.
                      </span>
                    </div>
                    <input
                      type="number"
                      id="amount"
                      name="amount"
                      min="0.01"
                      step="0.01"
                      value={formData.amount}
                      onChange={handleChange}
                      className={`block w-full rounded-md border ${formErrors.amount ? 'border-red-300' : 'border-gray-300'
                        } py-2 pl-10 pr-4 focus:border-amber-500 focus:outline-none`}
                      placeholder="0.00"
                    />
                  </div>
                  {formErrors.amount && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.amount}
                    </p>
                  )}
                </div>
                {/* Transaction Date */}
                <div>
                  <label
                    htmlFor="transaction_date"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Transaction Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <CalendarDots size={20} className="text-gray-500" />
                    </div>
                    <input
                      type="date"
                      id="transaction_date"
                      name="transaction_date"
                      value={formData.transaction_date}
                      onChange={handleChange}
                      className="block w-full cursor-pointer rounded-md border border-gray-300 py-2 pl-10 pr-4 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
                {/* Buyer - only show for income transactions */}
                {formData.transaction_type === 'Income' && (
                  <div>
                    <label
                      htmlFor="buyer_id"
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      Buyer <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <UserCircle size={20} className="text-gray-500" />
                      </div>
                      <select
                        id="buyer_id"
                        name="buyer_id"
                        value={formData.buyer_id}
                        onChange={handleChange}
                        className={`block w-full cursor-pointer rounded-md border ${formErrors.buyer_id
                          ? 'border-red-300'
                          : 'border-gray-300'
                          } py-2 pl-10 pr-4 focus:border-amber-500 focus:outline-none`}
                      >
                        <option value="">Select a Buyer</option>
                        {buyers.map((buyer) => (
                          <option key={buyer.buyer_id} value={buyer.buyer_id}>
                            {buyer.first_name} {buyer.last_name}
                          </option>
                        ))}
                        <option value="new">+ Add New Buyer</option>
                      </select>
                    </div>
                    {/* If buyer_id is 'new', the handleChange function already sets showNewBuyerForm to true */}
                    {formErrors.buyer_id && (
                      <p className="mt-1 text-sm text-red-600">
                        {formErrors.buyer_id}
                      </p>
                    )}
                  </div>
                )}
                {/* Seller - only show for expense transactions */}
                {formData.transaction_type === 'Expense' && (
                  <div>
                    <label
                      htmlFor="seller_id"
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      Seller <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <UserCircle size={20} className="text-gray-500" />
                      </div>
                      <select
                        id="seller_id"
                        name="seller_id"
                        value={formData.seller_id}
                        onChange={handleChange}
                        className={`block w-full cursor-pointer rounded-md border ${formErrors.seller_id
                          ? 'border-red-300'
                          : 'border-gray-300'
                          } py-2 pl-10 pr-4 focus:border-amber-500 focus:outline-none`}
                      >
                        <option value="">Select a Seller</option>
                        {sellers.map((seller) => (
                          <option key={seller.seller_id} value={seller.seller_id}>
                            {seller.first_name} {seller.last_name}
                          </option>
                        ))}
                        <option value="new">+ Add New Seller</option>
                      </select>
                    </div>
                    {/* If seller_id is 'new', the handleChange function already sets showNewSellerForm to true */}
                    {formErrors.seller_id && (
                      <p className="mt-1 text-sm text-red-600">
                        {formErrors.seller_id}
                      </p>
                    )}
                  </div>
                )}

                {/* Inventory Item - optional for expense transactions */}
                {formData.transaction_type === 'Expense' &&
                  formData.category === 'Inventory Purchase' && (
                    <>
                      <div>
                        <label
                          htmlFor="inventory_id"
                          className="mb-1 block text-sm font-medium text-gray-700"
                        >
                          Inventory Item <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <ShoppingBag size={20} className="text-gray-500" />
                          </div>
                          <select
                            id="inventory_id"
                            name="inventory_id"
                            value={formData.inventory_id || ''}
                            onChange={handleChange}
                            className={`block w-full rounded-md border ${formErrors.inventory_id ? 'border-red-300' : 'border-gray-300'} py-2 pl-10 pr-4 focus:border-amber-500 focus:outline-none focus:ring-amber-500`}
                          >
                            <option value="">Select an Inventory Item</option>
                            {inventoryItems.map((item) => (
                              <option
                                key={item.inventory_id}
                                value={item.inventory_id}
                              >
                                {item.item_name} - {item.category}{' '}
                                {item.quantity
                                  ? `(Current: ${item.quantity})`
                                  : ''}
                              </option>
                            ))}
                          </select>
                        </div>
                        {formErrors.inventory_id && (
                          <p className="mt-1 text-sm text-red-600">
                            {formErrors.inventory_id}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="quantity"
                          className="mb-1 block text-sm font-medium text-gray-700"
                        >
                          Quantity to Purchase{' '}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          id="quantity"
                          name="quantity"
                          min="1"
                          step="1"
                          value={formData.quantity}
                          onChange={handleChange}
                          className={`block w-full rounded-md border ${formErrors.quantity ? 'border-red-300' : 'border-gray-300'} px-3 py-2 focus:border-amber-500 focus:outline-none focus:ring-amber-500`}
                          placeholder="Enter quantity"
                        />
                        {formErrors.quantity && (
                          <p className="mt-1 text-sm text-red-600">
                            {formErrors.quantity}
                          </p>
                        )}
                      </div>
                    </>
                  )}
                {' '}

                {/* Livestock Sale Section - only for income transactions with livestock sale categories */}
                {formData.transaction_type === 'Income' &&
                  (formData.category === 'Chicken Sale' ||
                    formData.category === 'Chick Sale' ||
                    formData.category === 'Egg Sale') && (
                    <>
                      {/* Divider */}
                      <div className="col-span-full mb-4 mt-2">
                        <h3 className="text-lg font-medium text-gray-700">
                          Livestock Information
                        </h3>
                        <div className="mt-2 border-t border-gray-200"></div>
                      </div>
                      {' '}
                      {/* Livestock Type */}
                      <div>
                        <label
                          htmlFor="livestock_type"
                          className="mb-1 block text-sm font-medium text-gray-700"
                        >
                          Livestock Type <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <Bird size={20} className="text-gray-500" />
                          </div>
                          <select
                            id="livestock_type"
                            name="livestock_type"
                            value={formData.livestock_type}
                            onChange={(e) => {
                              if (e.target.value) {
                                handleLivestockTypeChange(e.target.value);
                              } else {
                                handleChange(e);
                              }
                            }}
                            disabled={
                              formData.category === 'Chicken Sale' ||
                              formData.category === 'Chick Sale' ||
                              formData.category === 'Egg Sale'
                            }
                            className={`block w-full rounded-md border ${formErrors.livestock_type
                              ? 'border-red-300'
                              : 'border-gray-300'
                              } py-2 pl-10 pr-4 focus:border-amber-500 focus:outline-none focus:ring-amber-500 ${formData.category === 'Chicken Sale' || formData.category === 'Chick Sale' || formData.category === 'Egg Sale' ? 'bg-gray-100' : ''}`}
                          >
                            <option value="">Select Livestock Type</option>
                            <option value="Chicken">Chicken</option>
                            <option value="Chick">Chick</option>
                            <option value="Egg">Egg</option>
                          </select>
                        </div>
                        {formErrors.livestock_type && (
                          <p className="mt-1 text-sm text-red-600">
                            {formErrors.livestock_type}
                          </p>
                        )}
                      </div>
                      {/* Chicken-specific fields */}
                      {formData.livestock_type === 'Chicken' && (
                        <>
                          <div>
                            <label
                              htmlFor="chicken_type"
                              className="mb-1 block text-sm font-medium text-gray-700"
                            >
                              Chicken Type{' '}
                              <span className="text-red-500">*</span>
                            </label>
                            <select
                              id="chicken_type"
                              name="chicken_type"
                              value={formData.chicken_type}
                              onChange={handleChange}
                              className={`block w-full rounded-md border ${formErrors.chicken_type
                                ? 'border-red-300'
                                : 'border-gray-300'
                                } px-3 py-2 focus:border-amber-500 focus:outline-none focus:ring-amber-500`}
                            >
                              <option value="">Select Type</option>
                              {chickenTypes.map((type) => (
                                <option key={type} value={type}>
                                  {type}
                                </option>
                              ))}
                            </select>
                            {formErrors.chicken_type && (
                              <p className="mt-1 text-sm text-red-600">
                                {formErrors.chicken_type}
                              </p>
                            )}
                          </div>

                          <div>
                            <label
                              htmlFor="breed"
                              className="mb-1 block text-sm font-medium text-gray-700"
                            >
                              Breed <span className="text-red-500">*</span>
                            </label>
                            <select
                              id="breed"
                              name="breed"
                              value={formData.breed}
                              onChange={handleChange}
                              className={`block w-full rounded-md border ${formErrors.breed
                                ? 'border-red-300'
                                : 'border-gray-300'
                                } px-3 py-2 focus:border-amber-500 focus:outline-none focus:ring-amber-500`}
                            >
                              <option value="">Select Breed</option>
                              {chickenBreeds.map((breed) => (
                                <option key={breed} value={breed}>
                                  {breed}
                                </option>
                              ))}
                            </select>
                            {formErrors.breed && (
                              <p className="mt-1 text-sm text-red-600">
                                {formErrors.breed}
                              </p>
                            )}
                          </div>
                        </>
                      )}
                      {/* Chick-specific fields */}
                      {formData.livestock_type === 'Chick' && (
                        <div>
                          <label
                            htmlFor="parent_breed"
                            className="mb-1 block text-sm font-medium text-gray-700"
                          >
                            Parent Breed <span className="text-red-500">*</span>
                          </label>
                          <select
                            id="parent_breed"
                            name="parent_breed"
                            value={formData.parent_breed}
                            onChange={handleChange}
                            className={`block w-full rounded-md border ${formErrors.parent_breed
                              ? 'border-red-300'
                              : 'border-gray-300'
                              } px-3 py-2 focus:border-amber-500 focus:outline-none focus:ring-amber-500`}
                          >
                            <option value="">Select Parent Breed</option>
                            {chickenBreeds.map((breed) => (
                              <option key={breed} value={breed}>
                                {breed}
                              </option>
                            ))}
                          </select>
                          {formErrors.parent_breed && (
                            <p className="mt-1 text-sm text-red-600">
                              {formErrors.parent_breed}
                            </p>
                          )}
                        </div>
                      )}
                      {/* Egg-specific fields */}
                      {formData.livestock_type === 'Egg' && (
                        <>
                          <div>
                            <label
                              htmlFor="size"
                              className="mb-1 block text-sm font-medium text-gray-700"
                            >
                              Size <span className="text-red-500">*</span>
                            </label>
                            <select
                              id="size"
                              name="size"
                              value={formData.size}
                              onChange={handleChange}
                              className={`block w-full rounded-md border ${formErrors.size
                                ? 'border-red-300'
                                : 'border-gray-300'
                                } px-3 py-2 focus:border-amber-500 focus:outline-none focus:ring-amber-500`}
                            >
                              <option value="">Select Size</option>
                              {eggSizes.map((size) => (
                                <option key={size} value={size}>
                                  {size}
                                </option>
                              ))}
                            </select>
                            {formErrors.size && (
                              <p className="mt-1 text-sm text-red-600">
                                {formErrors.size}
                              </p>
                            )}
                          </div>

                          <div>
                            <label
                              htmlFor="color"
                              className="mb-1 block text-sm font-medium text-gray-700"
                            >
                              Color <span className="text-red-500">*</span>
                            </label>
                            <select
                              id="color"
                              name="color"
                              value={formData.color}
                              onChange={handleChange}
                              className={`block w-full rounded-md border ${formErrors.color
                                ? 'border-red-300'
                                : 'border-gray-300'
                                } px-3 py-2 focus:border-amber-500 focus:outline-none focus:ring-amber-500`}
                            >
                              <option value="">Select Color</option>
                              {eggColors.map((color) => (
                                <option key={color} value={color}>
                                  {color}
                                </option>
                              ))}
                            </select>
                            {formErrors.color && (
                              <p className="mt-1 text-sm text-red-600">
                                {formErrors.color}
                              </p>
                            )}
                          </div>
                        </>
                      )}
                      {/* Quantity field - common for all livestock types */}
                      {formData.livestock_type && (
                        <div className="col-span-full sm:col-span-1">
                          <label
                            htmlFor="quantity"
                            className="mb-1 block text-sm font-medium text-gray-700"
                          >
                            Quantity <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              id="quantity"
                              name="quantity"
                              min="1"
                              step="1"
                              value={formData.quantity}
                              onChange={handleChange}
                              className={`block w-full rounded-md border ${formErrors.quantity
                                ? 'border-red-300'
                                : 'border-gray-300'
                                } px-3 py-2 focus:border-amber-500 focus:outline-none focus:ring-amber-500`}
                              placeholder="Enter quantity"
                            />
                          </div>{' '}
                          {availableQuantity > 0 ? (
                            <p className="mt-1 flex items-center text-xs">
                              <span className="rounded bg-green-100 px-2 py-1 font-medium text-green-800">
                                Available: {availableQuantity}
                              </span>
                            </p>
                          ) : (
                            formData.livestock_type && (
                              <p className="mt-1 flex items-center text-xs">
                                <span className="rounded bg-red-100 px-2 py-1 font-medium text-red-800">
                                  No stock available
                                </span>
                              </p>
                            )
                          )}
                          {formErrors.quantity && (
                            <p className="mt-1 text-sm text-red-600">
                              {formErrors.quantity}
                            </p>
                          )}
                        </div>
                      )}
                      {/* Batch Tracking - common for all livestock sales */}
                      {formData.livestock_type && (
                        <>
                          <div className="sm:col-span-1">
                            <label
                              htmlFor="batch_number"
                              className="mb-1 block text-sm font-medium text-gray-700"
                            >
                              Batch/Lot Number
                            </label>
                            <input
                              type="text"
                              id="batch_number"
                              name="batch_number"
                              value={formData.batch_number}
                              onChange={handleChange}
                              className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                              placeholder="Batch #"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                              Optional: For tracking purposes
                            </p>
                          </div>

                          <div className="sm:col-span-1">
                            <label
                              htmlFor="batch_source"
                              className="mb-1 block text-sm font-medium text-gray-700"
                            >
                              Batch Source/Origin
                            </label>
                            <input
                              type="text"
                              id="batch_source"
                              name="batch_source"
                              value={formData.batch_source}
                              onChange={handleChange}
                              className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                              placeholder="Source location"
                            />
                          </div>
                        </>
                      )}
                    </>
                  )}{' '}
                {/* Notes */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="notes"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Notes <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <ChatText size={20} className="text-gray-500" />
                    </div>
                    <textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows="3"
                      className={`block w-full rounded-md border ${formErrors.notes
                        ? 'border-red-300'
                        : 'border-gray-300'
                        } py-2 pl-10 pr-4 focus:border-amber-500 focus:outline-none focus:ring-amber-500`}
                      placeholder="Add notes about the transaction..."
                    ></textarea>
                  </div>
                  {formErrors.notes && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Transaction Preview Card (shown before submission) */}
              {formData.amount &&
                formData.transaction_type &&
                formData.category &&
                !success && (
                  <div className="mb-6 mt-6 rounded-lg bg-amber-50 p-4 shadow-sm">
                    <h3 className="mb-2 text-lg font-medium text-amber-800">
                      Transaction Preview
                    </h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Transaction Type:
                        </p>
                        <p
                          className={`text-base ${formData.transaction_type === 'Income' ? 'text-green-600' : 'text-red-600'} font-medium`}
                        >
                          {formData.transaction_type}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Category:
                        </p>
                        <p className="text-base font-medium">
                          {formData.category}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Amount:
                        </p>
                        <p className="text-base font-medium">
                          {formatCurrency(formData.amount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Date:
                        </p>
                        <p className="text-base font-medium">
                          {new Date(
                            formData.transaction_date
                          ).toLocaleDateString()}
                        </p>
                      </div>

                      {formData.livestock_type && (
                        <div className="col-span-2">
                          <p className="text-sm font-medium text-gray-600">
                            Livestock:
                          </p>
                          <p className="text-base font-medium">
                            {formData.quantity} {formData.livestock_type}
                            {formData.livestock_type === 'Chicken' &&
                              formData.chicken_type &&
                              formData.breed && (
                                <span>
                                  {' '}
                                  ({formData.chicken_type} - {formData.breed})
                                </span>
                              )}
                            {formData.livestock_type === 'Chick' &&
                              formData.parent_breed && (
                                <span> ({formData.parent_breed})</span>
                              )}
                            {formData.livestock_type === 'Egg' &&
                              formData.size &&
                              formData.color && (
                                <span>
                                  {' '}
                                  ({formData.size} - {formData.color})
                                </span>
                              )}
                            {formData.batch_number && (
                              <span className="ml-2 text-sm text-gray-500">
                                Batch: {formData.batch_number}
                              </span>
                            )}
                          </p>
                        </div>
                      )}

                      {formData.transaction_type === 'Income' &&
                        formData.buyer_id &&
                        buyers.length > 0 && (
                          <div className="col-span-2">
                            <p className="text-sm font-medium text-gray-600">
                              Buyer:
                            </p>
                            <p className="text-base font-medium">
                              {
                                buyers.find(
                                  (b) => b.buyer_id == formData.buyer_id
                                )?.first_name
                              }{' '}
                              {
                                buyers.find(
                                  (b) => b.buyer_id == formData.buyer_id
                                )?.last_name
                              }
                            </p>
                          </div>
                        )}

                      {formData.transaction_type === 'Expense' &&
                        formData.seller_id &&
                        sellers.length > 0 && (
                          <div className="col-span-2">
                            <p className="text-sm font-medium text-gray-600">
                              Seller:
                            </p>
                            <p className="text-base font-medium">
                              {
                                sellers.find(
                                  (s) => s.seller_id == formData.seller_id
                                )?.first_name
                              }{' '}
                              {
                                sellers.find(
                                  (s) => s.seller_id == formData.seller_id
                                )?.last_name
                              }
                            </p>
                          </div>
                        )}
                    </div>
                  </div>
                )}

              <div className="mt-6 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() =>
                    isEditMode
                      ? navigate(`/admin/finance/transactions/${id}`)
                      : navigate('/admin/finance/transactions')
                  }
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-300 disabled:opacity-70"
                >
                  {submitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <FloppyDisk size={18} weight="bold" />
                      Save Transaction
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Buyer or Seller Modals */}
      {showNewBuyerForm && (
        <ContactModal
          type="buyer"
          onClose={() => setShowNewBuyerForm(false)}
          onSave={handleAddNewBuyer}
        />
      )}

      {showNewSellerForm && (
        <ContactModal
          type="seller"
          onClose={() => setShowNewSellerForm(false)}
          onSave={handleAddNewSeller}
        />
      )}
    </DashboardLayout>
  );
};

export default TransactionForm;
