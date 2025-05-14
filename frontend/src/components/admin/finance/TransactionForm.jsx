import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  FloppyDisk, 
  CurrencyDollar, 
  CalendarBlank, 
  ChatText, 
  UserCircle, 
  ShoppingBag, 
  Bird, 
  Egg, 
  Plus,
  Warning,
  Tag
} from '@phosphor-icons/react';
import DashboardLayout from '../DashboardLayout';
import api from '../../../utils/api';

// New Buyer Modal Component
const NewBuyerModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    contact_number: '',
    email: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await api.post('/api/buyers', formData);
      onSave(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to create buyer');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h3 className="mb-4 text-lg font-medium text-gray-900">Add New Buyer</h3>
        
        {error && (
          <div className="mb-4 rounded-lg bg-red-100 px-4 py-3 text-red-700">
            <p>{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">First Name *</label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
              className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
            />
          </div>
          
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">Last Name *</label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
              className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
            />
          </div>
          
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">Contact Number *</label>
            <input
              type="text"
              name="contact_number"
              value={formData.contact_number}
              onChange={handleChange}
              required
              className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
            />
          </div>
          
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
            />
          </div>
          
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="2"
              className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
            ></textarea>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-70"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Plus size={18} />
                  Add Buyer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TransactionForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  // Form state
  const [formData, setFormData] = useState({
    transaction_type: 'Expense',
    category: 'Other',
    amount: '',
    description: '',
    buyer_id: '',
    seller_id: '',
    inventory_id: '',
    transaction_date: new Date().toISOString().split('T')[0],
    livestock_id: '',
    livestock_type: '',
    // Chicken specific fields
    chicken_type: '',
    breed: '',
    // Chick specific fields
    parent_breed: '',
    // Egg specific fields
    size: '',
    color: '',
    quantity: '',
  });

  // Status states
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [showNewBuyerForm, setShowNewBuyerForm] = useState(false);
  const [availableQuantity, setAvailableQuantity] = useState(0);
  
  // Options for dropdowns
  const [buyers, setBuyers] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [livestockItems, setLivestockItems] = useState([]);
  const [chickenTypes] = useState(['Layer', 'Broiler', 'Breeder']);
  const [chickenBreeds, setChickenBreeds] = useState([]);
  const [eggSizes] = useState(['Small', 'Medium', 'Large', 'Extra Large']);
  const [eggColors] = useState(['White', 'Brown']);
  const [transactionCategories] = useState([
    'Livestock Purchase',
    'Livestock Sale',
    'Inventory Purchase',
    'Other'
  ]);
  // Load transaction data if in edit mode
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch buyers, sellers, and inventory for dropdowns
        const [buyersRes, sellersRes, inventoryRes] = await Promise.all([
          api.get('/api/buyers'),
          api.get('/api/sellers'),
          api.get('/api/inventory')
        ]);
        
        setBuyers(buyersRes.data);
        setSellers(sellersRes.data);
        setInventoryItems(inventoryRes.data);

        // Set default category for income transactions
        if (formData.transaction_type === 'Income' && !formData.category) {
          setFormData(prev => ({
            ...prev,
            category: 'Livestock Sale'
          }));
        }
        
        // If in edit mode, fetch transaction data
        if (isEditMode) {
          const transactionRes = await api.get(`/api/transactions/${id}`);
          const transactionData = transactionRes.data;
          
          // Format transaction date
          if (transactionData.transaction_date) {
            transactionData.transaction_date = new Date(transactionData.transaction_date)
              .toISOString().split('T')[0];
          }
          
          setFormData(transactionData);

          // Fetch related livestock data if available
          if (transactionData.livestock_id) {
            const livestockRes = await api.get(`/api/livestock/${transactionData.livestock_id}`);
            const livestockData = livestockRes.data;
            
            // Fetch additional details based on livestock type
            if (livestockData.type === 'Chicken') {
              const chickenRes = await api.get(`/api/chickens?livestock_id=${transactionData.livestock_id}`);
              if (chickenRes.data.length > 0) {
                const chickenData = chickenRes.data[0];
                setFormData(prev => ({
                  ...prev,
                  chicken_type: chickenData.type,
                  breed: chickenData.breed,
                  quantity: chickenData.quantity
                }));
              }
            } else if (livestockData.type === 'Chick') {
              const chickRes = await api.get(`/api/chicks?livestock_id=${transactionData.livestock_id}`);
              if (chickRes.data.length > 0) {
                const chickData = chickRes.data[0];
                setFormData(prev => ({
                  ...prev,
                  parent_breed: chickData.parent_breed,
                  quantity: chickData.quantity
                }));
              }
            } else if (livestockData.type === 'Egg') {
              const eggRes = await api.get(`/api/eggs?livestock_id=${transactionData.livestock_id}`);
              if (eggRes.data.length > 0) {
                const eggData = eggRes.data[0];
                setFormData(prev => ({
                  ...prev,
                  size: eggData.size,
                  color: eggData.color,
                  quantity: eggData.quantity
                }));
              }
            }
          }
        }
        
        // Fetch chicken breeds
        const chickenRes = await api.get('/api/chickens');
        const uniqueBreeds = [...new Set(chickenRes.data.map(chicken => chicken.breed))];
        setChickenBreeds(uniqueBreeds);
        
        // Fetch livestock
        const livestockRes = await api.get('/api/livestock');
        setLivestockItems(livestockRes.data);
        
        setLoading(false);
      } catch (err) {
        setError('Error loading data. Please try again.');
        setLoading(false);
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, [id, isEditMode, formData.transaction_type]);

  // Fetch available quantity when livestock type changes
  useEffect(() => {
    const fetchAvailableQuantity = async () => {
      try {
        if (!formData.livestock_type) return;
        
        if (formData.livestock_type === 'Chicken') {
          if (!formData.chicken_type || !formData.breed) return;
          
          const res = await api.get('/api/chickens', {
            params: {
              type: formData.chicken_type,
              breed: formData.breed
            }
          });
          
          if (res.data.length > 0) {
            const total = res.data.reduce((sum, item) => sum + item.quantity, 0);
            setAvailableQuantity(total);
          } else {
            setAvailableQuantity(0);
          }
        } else if (formData.livestock_type === 'Chick') {
          if (!formData.parent_breed) return;
          
          const res = await api.get('/api/chicks', {
            params: {
              parent_breed: formData.parent_breed
            }
          });
          
          if (res.data.length > 0) {
            const total = res.data.reduce((sum, item) => sum + item.quantity, 0);
            setAvailableQuantity(total);
          } else {
            setAvailableQuantity(0);
          }
        } else if (formData.livestock_type === 'Egg') {
          if (!formData.size || !formData.color) return;
          
          const res = await api.get('/api/eggs', {
            params: {
              size: formData.size,
              color: formData.color
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
    
    fetchAvailableQuantity();
  }, [
    formData.livestock_type, 
    formData.chicken_type, 
    formData.breed, 
    formData.parent_breed,
    formData.size,
    formData.color
  ]);
  // Handle input changes
  const handleChange = (e) => {
    setError(null); // Clear error when user types
    const { name, value } = e.target;
    
    // Special handling for different form fields
    if (name === 'transaction_type') {
      // Default category for income is Livestock Sale, for expense is Inventory Purchase
      const defaultCategory = value === 'Income' ? 'Livestock Sale' : 'Inventory Purchase';
      
      setFormData(prev => ({
        ...prev,
        [name]: value,
        category: defaultCategory,
        buyer_id: value === 'Income' ? prev.buyer_id : '',
        seller_id: value === 'Expense' ? prev.seller_id : '',
        // Reset livestock-related fields if transaction type changes
        livestock_type: '',
        chicken_type: '',
        breed: '',
        parent_breed: '',
        size: '',
        color: '',
        quantity: ''
      }));
    } else if (name === 'category') {
      // Reset related fields when category changes
      const resetFields = value !== 'Livestock Sale' ? {
        livestock_type: '',
        chicken_type: '',
        breed: '',
        parent_breed: '',
        size: '',
        color: '',
        quantity: ''
      } : {};
      
      setFormData(prev => ({
        ...prev,
        [name]: value,
        ...resetFields
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
        quantity: ''
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
    } else if (name === 'buyer_id' && value === 'new') {
      // Set flag to show new buyer form
      setShowNewBuyerForm(true);
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
    
    if (!formData.description) {
      errors.description = 'Description is required';
    }
    
    // For income transactions, require buyer_id
    if (formData.transaction_type === 'Income' && !formData.buyer_id) {
      errors.buyer_id = 'Buyer is required for income transactions';
    }
    
    // For expense transactions, require seller_id
    if (formData.transaction_type === 'Expense' && !formData.seller_id) {
      errors.seller_id = 'Seller is required for expense transactions';
    }
    
    // For Livestock Sale transactions, validate livestock fields
    if (formData.category === 'Livestock Sale') {
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
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Scroll to the first error
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
      if (apiData.category === 'Livestock Sale' && apiData.livestock_type) {
        let livestockData = {
          type: apiData.livestock_type,
          total_quantity: apiData.quantity,
          status: 'Sold'
        };
        
        // Create specific records based on livestock type
        if (apiData.livestock_type === 'Chicken') {
          const chickenData = {
            type: apiData.chicken_type,
            breed: apiData.breed,
            quantity: apiData.quantity
          };
          
          // Find existing livestock with the same attributes
          const existingLivestock = livestockItems.find(item => 
            item.type === 'Chicken' && 
            item.chicken_type === apiData.chicken_type && 
            item.breed === apiData.breed
          );
          
          if (existingLivestock) {
            // Update existing livestock record
            apiData.livestock_id = existingLivestock.livestock_id;
            // Deduct quantity from existing record
            await api.put(`/api/chickens/${existingLivestock.chicken_record_id}`, {
              ...chickenData,
              quantity: existingLivestock.quantity - parseInt(apiData.quantity)
            });
          } else {
            // Create new livestock record for tracking the sale
            const livestockRes = await api.post('/api/livestock', livestockData);
            apiData.livestock_id = livestockRes.data.livestock_id;
            
            // Create chicken record
            await api.post('/api/chickens', {
              ...chickenData,
              livestock_id: apiData.livestock_id
            });
          }
        } else if (apiData.livestock_type === 'Chick') {
          const chickData = {
            parent_breed: apiData.parent_breed,
            hatched_date: new Date().toISOString().split('T')[0], // Default to today
            quantity: apiData.quantity
          };
          
          // Find existing livestock with the same attributes
          const existingLivestock = livestockItems.find(item => 
            item.type === 'Chick' && 
            item.parent_breed === apiData.parent_breed
          );
          
          if (existingLivestock) {
            // Update existing livestock record
            apiData.livestock_id = existingLivestock.livestock_id;
            // Deduct quantity from existing record
            await api.put(`/api/chicks/${existingLivestock.chick_record_id}`, {
              ...chickData,
              quantity: existingLivestock.quantity - parseInt(apiData.quantity)
            });
          } else {
            // Create new livestock record for tracking the sale
            const livestockRes = await api.post('/api/livestock', livestockData);
            apiData.livestock_id = livestockRes.data.livestock_id;
            
            // Create chick record
            await api.post('/api/chicks', {
              ...chickData,
              livestock_id: apiData.livestock_id
            });
          }
        } else if (apiData.livestock_type === 'Egg') {
          const eggData = {
            size: apiData.size,
            color: apiData.color,
            laid_date: new Date().toISOString().split('T')[0], // Default to today
            expiration_date: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0], // Default to 30 days from now
            quantity: apiData.quantity
          };
          
          // Find existing livestock with the same attributes
          const existingLivestock = livestockItems.find(item => 
            item.type === 'Egg' && 
            item.size === apiData.size && 
            item.color === apiData.color
          );
          
          if (existingLivestock) {
            // Update existing livestock record
            apiData.livestock_id = existingLivestock.livestock_id;
            // Deduct quantity from existing record
            await api.put(`/api/eggs/${existingLivestock.egg_record_id}`, {
              ...eggData,
              quantity: existingLivestock.quantity - parseInt(apiData.quantity)
            });
          } else {
            // Create new livestock record for tracking the sale
            const livestockRes = await api.post('/api/livestock', livestockData);
            apiData.livestock_id = livestockRes.data.livestock_id;
            
            // Create egg record
            await api.post('/api/eggs', {
              ...eggData,
              livestock_id: apiData.livestock_id
            });
          }
        }
      }
      
      // Remove fields that shouldn't be sent to the transaction API
      const transactionData = {
        transaction_type: apiData.transaction_type,
        category: apiData.category,
        amount: apiData.amount,
        description: apiData.description,
        buyer_id: apiData.buyer_id || null,
        seller_id: apiData.seller_id || null,
        inventory_id: apiData.inventory_id || null,
        livestock_id: apiData.livestock_id || null,
        transaction_date: apiData.transaction_date
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
      } else {
        await api.post('/api/transactions', transactionData);
      }
      
      navigate('/admin/finance/transactions');
    } catch (err) {
      setError(err.response?.data?.msg || 'An error occurred. Please try again.');
      setSubmitting(false);
      console.error('Error saving transaction:', err);
    }
  };
  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center">
        <button
          onClick={() => isEditMode ? navigate(`/admin/finance/transactions/${id}`) : navigate('/admin/finance/transactions')}
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

          <form onSubmit={handleSubmit}>
            <div className="mb-6 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
              {/* Transaction Type */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Transaction Type <span className="text-red-500">*</span>
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="transaction_type"
                      value="Income"
                      checked={formData.transaction_type === 'Income'}
                      onChange={handleChange}
                      className="h-4 w-4 text-amber-500 focus:ring-amber-400"
                    />
                    <span className="ml-2 text-sm text-gray-700">Income</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="transaction_type"
                      value="Expense"
                      checked={formData.transaction_type === 'Expense'}
                      onChange={handleChange}
                      className="h-4 w-4 text-amber-500 focus:ring-amber-400"
                    />
                    <span className="ml-2 text-sm text-gray-700">Expense</span>
                  </label>
                </div>
                {formErrors.transaction_type && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.transaction_type}</p>
                )}
              </div>
              
              {/* Transaction Category */}
              <div>
                <label htmlFor="category" className="mb-1 block text-sm font-medium text-gray-700">
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
                    className={`block w-full rounded-md border ${
                      formErrors.category ? 'border-red-300' : 'border-gray-300'
                    } pl-10 pr-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-amber-500`}
                  >
                    <option value="">Select a Category</option>
                    {transactionCategories.map((category) => (
                      <option 
                        key={category} 
                        value={category}
                        // Disable incompatible categories based on transaction type
                        disabled={(formData.transaction_type === 'Income' && 
                                   (category === 'Livestock Purchase' || category === 'Inventory Purchase')) ||
                                  (formData.transaction_type === 'Expense' && 
                                   category === 'Livestock Sale')}
                      >
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                {formErrors.category && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.category}</p>
                )}
              </div>

              {/* Amount */}
              <div>
                <label htmlFor="amount" className="mb-1 block text-sm font-medium text-gray-700">
                  Amount <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-lg font-normal text-gray-500">Rs.</span>
                  </div>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    min="0.01"
                    step="0.01"
                    value={formData.amount}
                    onChange={handleChange}
                    className={`block w-full rounded-md border ${
                      formErrors.amount ? 'border-red-300' : 'border-gray-300'
                    } pl-10 pr-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-amber-500`}
                    placeholder="0.00"
                  />
                </div>
                {formErrors.amount && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.amount}</p>
                )}
              </div>

              {/* Transaction Date */}
              <div>
                <label htmlFor="transaction_date" className="mb-1 block text-sm font-medium text-gray-700">
                  Transaction Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <CalendarBlank size={20} className="text-gray-500" />
                  </div>
                  <input
                    type="date"
                    id="transaction_date"
                    name="transaction_date"
                    value={formData.transaction_date}
                    onChange={handleChange}
                    className="block w-full rounded-md border border-gray-300 pl-10 pr-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Buyer - only show for income transactions */}
              {formData.transaction_type === 'Income' && (
                <div>
                  <label htmlFor="buyer_id" className="mb-1 block text-sm font-medium text-gray-700">
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
                      className={`block w-full rounded-md border ${
                        formErrors.buyer_id ? 'border-red-300' : 'border-gray-300'
                      } pl-10 pr-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-amber-500`}
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
                  {formData.buyer_id === 'new' && (
                    <button
                      type="button"
                      onClick={() => setShowNewBuyerForm(true)}
                      className="mt-2 flex items-center gap-1 text-sm text-amber-600 hover:text-amber-700"
                    >
                      <Plus size={16} />
                      Add New Buyer
                    </button>
                  )}
                  {formErrors.buyer_id && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.buyer_id}</p>
                  )}
                </div>
              )}

              {/* Seller - only show for expense transactions */}
              {formData.transaction_type === 'Expense' && (
                <div>
                  <label htmlFor="seller_id" className="mb-1 block text-sm font-medium text-gray-700">
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
                      className={`block w-full rounded-md border ${
                        formErrors.seller_id ? 'border-red-300' : 'border-gray-300'
                      } pl-10 pr-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-amber-500`}
                    >
                      <option value="">Select a Seller</option>
                      {sellers.map((seller) => (
                        <option key={seller.seller_id} value={seller.seller_id}>
                          {seller.first_name} {seller.last_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {formErrors.seller_id && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.seller_id}</p>
                  )}
                </div>
              )}

              {/* Inventory Item - optional for expense transactions */}
              {formData.transaction_type === 'Expense' && formData.category === 'Inventory Purchase' && (
                <div>
                  <label htmlFor="inventory_id" className="mb-1 block text-sm font-medium text-gray-700">
                    Inventory Item
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
                      className="block w-full rounded-md border border-gray-300 pl-10 pr-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                    >
                      <option value="">None</option>
                      {inventoryItems.map((item) => (
                        <option key={item.inventory_id} value={item.inventory_id}>
                          {item.item_name} - {item.category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Livestock Sale Section - only for income transactions with livestock sale category */}
              {formData.transaction_type === 'Income' && formData.category === 'Livestock Sale' && (
                <>
                  {/* Divider */}
                  <div className="col-span-full mt-2 mb-4">
                    <h3 className="text-lg font-medium text-gray-700">Livestock Information</h3>
                    <div className="mt-2 border-t border-gray-200"></div>
                  </div>
                  
                  {/* Livestock Type */}
                  <div>
                    <label htmlFor="livestock_type" className="mb-1 block text-sm font-medium text-gray-700">
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
                        onChange={handleChange}
                        className={`block w-full rounded-md border ${
                          formErrors.livestock_type ? 'border-red-300' : 'border-gray-300'
                        } pl-10 pr-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-amber-500`}
                      >
                        <option value="">Select Livestock Type</option>
                        <option value="Chicken">Chicken</option>
                        <option value="Chick">Chick</option>
                        <option value="Egg">Egg</option>
                      </select>
                    </div>
                    {formErrors.livestock_type && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.livestock_type}</p>
                    )}
                  </div>
                  
                  {/* Chicken-specific fields */}
                  {formData.livestock_type === 'Chicken' && (
                    <>
                      <div>
                        <label htmlFor="chicken_type" className="mb-1 block text-sm font-medium text-gray-700">
                          Chicken Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="chicken_type"
                          name="chicken_type"
                          value={formData.chicken_type}
                          onChange={handleChange}
                          className={`block w-full rounded-md border ${
                            formErrors.chicken_type ? 'border-red-300' : 'border-gray-300'
                          } px-3 py-2 focus:border-amber-500 focus:outline-none focus:ring-amber-500`}
                        >
                          <option value="">Select Type</option>
                          {chickenTypes.map((type) => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                        {formErrors.chicken_type && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.chicken_type}</p>
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor="breed" className="mb-1 block text-sm font-medium text-gray-700">
                          Breed <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="breed"
                          name="breed"
                          value={formData.breed}
                          onChange={handleChange}
                          className={`block w-full rounded-md border ${
                            formErrors.breed ? 'border-red-300' : 'border-gray-300'
                          } px-3 py-2 focus:border-amber-500 focus:outline-none focus:ring-amber-500`}
                        >
                          <option value="">Select Breed</option>
                          {chickenBreeds.map((breed) => (
                            <option key={breed} value={breed}>{breed}</option>
                          ))}
                        </select>
                        {formErrors.breed && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.breed}</p>
                        )}
                      </div>
                    </>
                  )}
                  
                  {/* Chick-specific fields */}
                  {formData.livestock_type === 'Chick' && (
                    <div>
                      <label htmlFor="parent_breed" className="mb-1 block text-sm font-medium text-gray-700">
                        Parent Breed <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="parent_breed"
                        name="parent_breed"
                        value={formData.parent_breed}
                        onChange={handleChange}
                        className={`block w-full rounded-md border ${
                          formErrors.parent_breed ? 'border-red-300' : 'border-gray-300'
                        } px-3 py-2 focus:border-amber-500 focus:outline-none focus:ring-amber-500`}
                      >
                        <option value="">Select Parent Breed</option>
                        {chickenBreeds.map((breed) => (
                          <option key={breed} value={breed}>{breed}</option>
                        ))}
                      </select>
                      {formErrors.parent_breed && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.parent_breed}</p>
                      )}
                    </div>
                  )}
                  
                  {/* Egg-specific fields */}
                  {formData.livestock_type === 'Egg' && (
                    <>
                      <div>
                        <label htmlFor="size" className="mb-1 block text-sm font-medium text-gray-700">
                          Size <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="size"
                          name="size"
                          value={formData.size}
                          onChange={handleChange}
                          className={`block w-full rounded-md border ${
                            formErrors.size ? 'border-red-300' : 'border-gray-300'
                          } px-3 py-2 focus:border-amber-500 focus:outline-none focus:ring-amber-500`}
                        >
                          <option value="">Select Size</option>
                          {eggSizes.map((size) => (
                            <option key={size} value={size}>{size}</option>
                          ))}
                        </select>
                        {formErrors.size && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.size}</p>
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor="color" className="mb-1 block text-sm font-medium text-gray-700">
                          Color <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="color"
                          name="color"
                          value={formData.color}
                          onChange={handleChange}
                          className={`block w-full rounded-md border ${
                            formErrors.color ? 'border-red-300' : 'border-gray-300'
                          } px-3 py-2 focus:border-amber-500 focus:outline-none focus:ring-amber-500`}
                        >
                          <option value="">Select Color</option>
                          {eggColors.map((color) => (
                            <option key={color} value={color}>{color}</option>
                          ))}
                        </select>
                        {formErrors.color && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.color}</p>
                        )}
                      </div>
                    </>
                  )}
                  
                  {/* Quantity field - common for all livestock types */}
                  {formData.livestock_type && (
                    <div className="col-span-full sm:col-span-1">
                      <label htmlFor="quantity" className="mb-1 block text-sm font-medium text-gray-700">
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
                          className={`block w-full rounded-md border ${
                            formErrors.quantity ? 'border-red-300' : 'border-gray-300'
                          } px-3 py-2 focus:border-amber-500 focus:outline-none focus:ring-amber-500`}
                          placeholder="Enter quantity"
                        />
                      </div>
                      {availableQuantity > 0 && (
                        <p className="mt-1 text-xs text-gray-500">
                          Available: {availableQuantity}
                        </p>
                      )}
                      {formErrors.quantity && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.quantity}</p>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* Description */}
              <div className="sm:col-span-2">
                <label htmlFor="description" className="mb-1 block text-sm font-medium text-gray-700">
                  Description <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <ChatText size={20} className="text-gray-500" />
                  </div>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    className={`block w-full rounded-md border ${
                      formErrors.description ? 'border-red-300' : 'border-gray-300'
                    } pl-10 pr-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-amber-500`}
                    placeholder="Describe the transaction..."
                  ></textarea>
                </div>
                {formErrors.description && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
                )}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => isEditMode ? navigate(`/admin/finance/transactions/${id}`) : navigate('/admin/finance/transactions')}
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
      
      {/* New Buyer Modal */}
      {showNewBuyerForm && (
        <NewBuyerModal 
          onClose={() => {
            setShowNewBuyerForm(false);
            setFormData(prev => ({ ...prev, buyer_id: '' }));
          }} 
          onSave={handleAddNewBuyer} 
        />
      )}
    </DashboardLayout>
  );
};

export default TransactionForm;
