import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FloppyDisk, CurrencyDollar, CalendarDots, ChatText, UserCircle, ShoppingBag, Bird, Egg, Plus, Warning, Tag, CircleWavyCheck } from '@phosphor-icons/react';
import DashboardLayout from '../DashboardLayout';
import api from '../../../utils/api';

import ContactModal from '../../shared/ContactModal';

const TransactionForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  // Form state
  const [formData, setFormData] = useState({
    // Common transaction fields
    transaction_type: '',
    category: '',
    amount: '',
    notes: '',
    buyer_id: '',
    seller_id: '',
    inventory_id: '',
    transaction_date: new Date().toISOString().split('T')[0],

    // Record identifiers
    chicken_record_id: null,
    chick_record_id: null,
    egg_record_id: null,

    // Sale quantities
    chicken_quantity: '',
    chick_quantity: '',
    egg_quantity: '',

    // Chicken specific fields
    chicken_type: '',
    chicken_breed: '',

    // Chick specific fields
    chick_parent_breed: '',

    // Egg specific fields
    egg_size: '',
    egg_color: '',

    // Inventory specific fields
    inventory_quantity: '',
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
    id: null,
  });
  const [formErrors, setFormErrors] = useState({});
  const [showNewBuyerForm, setShowNewBuyerForm] = useState(false);
  const [showNewSellerForm, setShowNewSellerForm] = useState(false);

  // State for available quantities
  const [availableChickenQuantity, setAvailableChickenQuantity] = useState(0);
  const [availableChickQuantity, setAvailableChickQuantity] = useState(0);
  const [availableEggQuantity, setAvailableEggQuantity] = useState(0);

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
    'Other',
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
          console.log(
            'Fetching transaction data for edit mode with ID:',
            id,
            'is success:',
            responses
          );
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
        const uniqueBreeds = [
          ...new Set(chickenRes.data.map((chicken) => chicken.breed)),
        ];
        setChickenBreeds(uniqueBreeds);

        // Handle transaction data in edit mode
        if (isEditMode && responses.length > 6) {
          const transactionData = responses[6].data;

          // Initial transaction data
          const initialData = {
            transaction_type: transactionData.transaction_type || '',
            category: transactionData.category || '',
            amount: transactionData.amount || '',
            notes: transactionData.notes || '',
            buyer_id: transactionData.buyer_id || '',
            seller_id: transactionData.seller_id || '',
            inventory_id: transactionData.inventory_id || '',
            transaction_date:
              transactionData.transaction_date ||
              new Date().toISOString().split('T')[0],
            chicken_record_id: transactionData.chicken_record_id || null,
            chick_record_id: transactionData.chick_record_id || null,
            egg_record_id: transactionData.egg_record_id || null,
            chicken_quantity: '',
            chick_quantity: '',
            egg_quantity: '',
            inventory_quantity: '',
          };

          // Fetch related data based on record IDs
          if (transactionData.chicken_record_id) {
            try {
              const chickenRecordRes = await api.get(
                `/api/chickens/${transactionData.chicken_record_id}`
              );
              const chickenRecord = chickenRecordRes.data;
              initialData.chicken_type = chickenRecord.type || '';
              initialData.chicken_breed = chickenRecord.breed || '';
            } catch (err) {
              console.error('Error fetching chicken record:', err);
            }
          }

          if (transactionData.chick_record_id) {
            try {
              const chickRecordRes = await api.get(
                `/api/chicks/${transactionData.chick_record_id}`
              );
              const chickRecord = chickRecordRes.data;
              initialData.chick_parent_breed = chickRecord.parent_breed || '';
            } catch (err) {
              console.error('Error fetching chick record:', err);
            }
          }

          if (transactionData.egg_record_id) {
            try {
              const eggRecordRes = await api.get(
                `/api/eggs/${transactionData.egg_record_id}`
              );
              const eggRecord = eggRecordRes.data;
              initialData.egg_size = eggRecord.size || '';
              initialData.egg_color = eggRecord.color || '';
            } catch (err) {
              console.error('Error fetching egg record:', err);
            }
          }

          // Set form data with all collected information
          setFormData(initialData);
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

  // Fetch available chicken quantity when chicken attributes change
  useEffect(() => {
    if (formData.category === 'Chicken Sale') {
      fetchAvailableChickenQuantity();
    }
  }, [formData.chicken_type, formData.chicken_breed]);

  // Fetch available chick quantity when chick attributes change
  useEffect(() => {
    if (formData.category === 'Chick Sale') {
      fetchAvailableChickQuantity();
    }
  }, [formData.chick_parent_breed]);

  // Fetch available egg quantity when egg attributes change
  useEffect(() => {
    if (formData.category === 'Egg Sale') {
      fetchAvailableEggQuantity();
    }
  }, [formData.egg_size, formData.egg_color]);

  // Fetch available chicken quantity when chicken attributes change
  const fetchAvailableChickenQuantity = async () => {
    if (!formData.chicken_type || !formData.chicken_breed) return;

    try {
      const res = await api.get('/api/chickens', {
        params: {
          type: formData.chicken_type,
          breed: formData.chicken_breed,
        },
      });

      if (res.data.length > 0) {
        const total = res.data.reduce((sum, item) => sum + item.quantity, 0);
        setAvailableChickenQuantity(total);
      } else {
        setAvailableChickenQuantity(0);
      }
    } catch (err) {
      console.error('Error fetching available chicken quantity:', err);
      setAvailableChickenQuantity(0);
    }
  };

  // Fetch available chick quantity
  const fetchAvailableChickQuantity = async () => {
    if (!formData.chick_parent_breed) return;

    try {
      const res = await api.get('/api/chicks', {
        params: {
          parent_breed: formData.chick_parent_breed,
        },
      });

      if (res.data.length > 0) {
        const total = res.data.reduce((sum, item) => sum + item.quantity, 0);
        setAvailableChickQuantity(total);
      } else {
        setAvailableChickQuantity(0);
      }
    } catch (err) {
      console.error('Error fetching available chick quantity:', err);
      setAvailableChickQuantity(0);
    }
  };

  // Fetch available egg quantity
  const fetchAvailableEggQuantity = async () => {
    if (!formData.egg_size || !formData.egg_color) return;

    try {
      const res = await api.get('/api/eggs', {
        params: {
          size: formData.egg_size,
          color: formData.egg_color,
        },
      });

      if (res.data.length > 0) {
        const total = res.data.reduce((sum, item) => sum + item.quantity, 0);
        setAvailableEggQuantity(total);
      } else {
        setAvailableEggQuantity(0);
      }
    } catch (err) {
      console.error('Error fetching available egg quantity:', err);
      setAvailableEggQuantity(0);
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    setError(null); // Clear error when user types
    const { name, value } = e.target;

    // Special handling for transaction type
    if (name === 'transaction_type') {
      const resetFields = {
        category: '',
        chicken_record_id: null,
        chick_record_id: null,
        egg_record_id: null,
        chicken_type: '',
        chicken_breed: '',
        chicken_quantity: '',
        chick_parent_breed: '',
        chick_quantity: '',
        egg_size: '',
        egg_color: '',
        egg_quantity: '',
        inventory_id: '',
        inventory_quantity: '',
      };

      // Reset appropriate fields based on transaction type
      if (value === 'Income') {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
          ...resetFields,
          seller_id: '',
        }));
      } else if (value === 'Expense') {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
          ...resetFields,
          buyer_id: '',
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
          ...resetFields,
        }));
      }
    }
    // Special handling for category
    else if (name === 'category') {
      // Reset all product-specific fields
      const resetFields = {
        chicken_record_id: null,
        chick_record_id: null,
        egg_record_id: null,
        chicken_type: '',
        chicken_breed: '',
        chicken_quantity: '',
        chick_parent_breed: '',
        chick_quantity: '',
        egg_size: '',
        egg_color: '',
        egg_quantity: '',
        inventory_quantity: '',
      };

      setFormData((prev) => ({
        ...prev,
        [name]: value,
        ...resetFields,
      }));
    }
    // Special handling for buyer_id and seller_id
    else if (name === 'buyer_id' && value === 'new') {
      setShowNewBuyerForm(true);
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else if (name === 'seller_id' && value === 'new') {
      setShowNewSellerForm(true);
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    // Default handling for other fields
    else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear field-specific error when user types in that field
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Add new buyer handler
  const handleAddNewBuyer = (newBuyer) => {
    setBuyers((prev) => [...prev, newBuyer]);
    setFormData((prev) => ({ ...prev, buyer_id: newBuyer.buyer_id }));
    setShowNewBuyerForm(false);
  };

  // Add new seller handler
  const handleAddNewSeller = (newSeller) => {
    setSellers((prev) => [...prev, newSeller]);
    setFormData((prev) => ({ ...prev, seller_id: newSeller.seller_id }));
    setShowNewSellerForm(false);
  };

  // Form validation
  const validateForm = () => {
    const errors = {};

    // Common validations
    if (!formData.transaction_type) {
      errors.transaction_type = 'Transaction type is required';
    }

    if (!formData.category) {
      errors.category = 'Transaction category is required';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      errors.amount = 'Amount must be greater than zero';
    }

    // For income transactions, require buyer_id
    if (formData.transaction_type === 'Income' && !formData.buyer_id) {
      errors.buyer_id = 'Buyer is required for income transactions';
    }

    // For expense transactions, require seller_id
    if (formData.transaction_type === 'Expense' && !formData.seller_id) {
      errors.seller_id = 'Seller is required for expense transactions';
    }

    // Category-specific validations
    if (formData.category === 'Chicken Sale') {
      if (!formData.chicken_type) {
        errors.chicken_type = 'Chicken type is required';
      }
      if (!formData.chicken_breed) {
        errors.chicken_breed = 'Breed is required';
      }
      if (
        !formData.chicken_quantity ||
        parseInt(formData.chicken_quantity) <= 0
      ) {
        errors.chicken_quantity = 'Quantity must be greater than zero';
      } else if (
        parseInt(formData.chicken_quantity) > availableChickenQuantity
      ) {
        errors.chicken_quantity = `Quantity cannot exceed available quantity (${availableChickenQuantity})`;
      }
    } else if (formData.category === 'Chick Sale') {
      if (!formData.chick_parent_breed) {
        errors.chick_parent_breed = 'Parent breed is required';
      }
      if (!formData.chick_quantity || parseInt(formData.chick_quantity) <= 0) {
        errors.chick_quantity = 'Quantity must be greater than zero';
      } else if (parseInt(formData.chick_quantity) > availableChickQuantity) {
        errors.chick_quantity = `Quantity cannot exceed available quantity (${availableChickQuantity})`;
      }
    } else if (formData.category === 'Egg Sale') {
      if (!formData.egg_size) {
        errors.egg_size = 'Egg size is required';
      }
      if (!formData.egg_color) {
        errors.egg_color = 'Egg color is required';
      }
      if (!formData.egg_quantity || parseInt(formData.egg_quantity) <= 0) {
        errors.egg_quantity = 'Quantity must be greater than zero';
      } else if (parseInt(formData.egg_quantity) > availableEggQuantity) {
        errors.egg_quantity = `Quantity cannot exceed available quantity (${availableEggQuantity})`;
      }
    } else if (formData.category === 'Inventory Purchase') {
      if (!formData.inventory_id) {
        errors.inventory_id = 'Inventory item is required';
      }
      if (
        !formData.inventory_quantity ||
        parseInt(formData.inventory_quantity) <= 0
      ) {
        errors.inventory_quantity = 'Quantity must be greater than zero';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle chicken sale transactions
  const handleChickenSale = async () => {
    if (parseInt(formData.chicken_quantity) > availableChickenQuantity) {
      setError(
        `Cannot sell more than the available quantity (${availableChickenQuantity})`
      );
      setSubmitting(false);
      throw new Error('Insufficient quantity');
    }

    // Format today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    // Find existing chicken records
    const chickenRes = await api.get('/api/chickens', {
      params: {
        type: formData.chicken_type,
        breed: formData.chicken_breed,
      },
    });

    let chickenRecordId = null;

    if (chickenRes.data.length > 0) {
      // Update existing chicken record
      const existingChicken = chickenRes.data[0];
      chickenRecordId = existingChicken.chicken_record_id;

      const newQuantity =
        existingChicken.quantity - parseInt(formData.chicken_quantity);
      if (newQuantity < 0) {
        setError(
          `Cannot sell more than the available quantity (${existingChicken.quantity})`
        );
        setSubmitting(false);
        throw new Error('Insufficient quantity');
      }

      // Format the existing acquisition_date properly if it exists
      let formattedAcquisitionDate = today; // Default to today
      if (existingChicken.acquisition_date) {
        // Convert the date to YYYY-MM-DD format
        const date = new Date(existingChicken.acquisition_date);
        if (!isNaN(date.getTime())) {
          // Check if date is valid
          formattedAcquisitionDate = date.toISOString().split('T')[0];
        }
      }

      // Create update data object
      const updateData = {
        type: formData.chicken_type,
        breed: formData.chicken_breed,
        quantity: newQuantity,
        age_weeks: existingChicken.age_weeks || null,
        // Keep the original acquisition_date if it exists, otherwise use today's date
        acquisition_date:
          existingChicken.acquisition_date || formattedAcquisitionDate,
        notes: existingChicken.notes
          ? `${existingChicken.notes}; Sold ${formData.chicken_quantity} on ${today}`
          : `Sold ${formData.chicken_quantity} on ${today}`,
      };

      try {
        console.log('Sending data to server:', updateData);
        await api.put(
          `/api/chickens/${existingChicken.chicken_record_id}`,
          updateData
        );
      } catch (err) {
        console.error('Error details', err.response?.data);
        throw err;
      }
    } else {
      // Create new chicken record with all required fields
      const newChickenData = {
        type: formData.chicken_type,
        breed: formData.chicken_breed,
        quantity: formData.chicken_quantity,
        age_weeks: null, // Include null instead of undefined
        acquisition_date: today,
        notes: `Sold ${formData.chicken_quantity} on ${today}`,
      };

      console.log('Sending data to server:', newChickenData);
      try {
        const newChickenRes = await api.post('/api/chickens', newChickenData);
        chickenRecordId = newChickenRes.data.chicken_record_id;
      } catch (err) {
        console.error('Error details:', err.response?.data);
        throw err;
      }
    }

    // Update form data with record ID
    setFormData((prev) => ({ ...prev, chicken_record_id: chickenRecordId }));
    return chickenRecordId;
  };

  // Handle chick sale transactions
  const handleChickSale = async () => {
    if (parseInt(formData.chick_quantity) > availableChickQuantity) {
      setError(
        `Cannot sell more than the available quantity (${availableChickQuantity})`
      );
      setSubmitting(false);
      throw new Error('Insufficient quantity');
    }

    const chickData = {
      parent_breed: formData.chick_parent_breed,
      hatched_date: new Date().toISOString().split('T')[0], // Default to today
      quantity: formData.chick_quantity,
    };

    // Find existing chick records
    const chicksRes = await api.get('/api/chicks', {
      params: {
        parent_breed: formData.chick_parent_breed,
      },
    });

    let chickRecordId = null;

    if (chicksRes.data.length > 0) {
      // Update existing chick record
      const existingChick = chicksRes.data[0];
      chickRecordId = existingChick.chick_record_id;

      const newQuantity =
        existingChick.quantity - parseInt(formData.chick_quantity);
      if (newQuantity < 0) {
        setError(
          `Cannot sell more than the available quantity (${existingChick.quantity})`
        );
        setSubmitting(false);
        throw new Error('Insufficient quantity');
      }

      await api.put(`/api/chicks/${existingChick.chick_record_id}`, {
        ...chickData,
        quantity: newQuantity,
        notes: existingChick.notes
          ? `${existingChick.notes}; Sold ${formData.chick_quantity} on ${new Date().toISOString().split('T')[0]}`
          : `Sold ${formData.chick_quantity} on ${new Date().toISOString().split('T')[0]}`,
      });
    } else {
      // Create new chick record
      const newChickRes = await api.post('/api/chicks', {
        ...chickData,
        status: 'Sold',
      });
      chickRecordId = newChickRes.data.chick_record_id;
    }

    // Update form data with record ID
    setFormData((prev) => ({ ...prev, chick_record_id: chickRecordId }));
    return chickRecordId;
  };

  // Handle egg sale transactions
  const handleEggSale = async () => {
    if (parseInt(formData.egg_quantity) > availableEggQuantity) {
      setError(
        `Cannot sell more than the available quantity (${availableEggQuantity})`
      );
      setSubmitting(false);
      throw new Error('Insufficient quantity');
    }

    const eggData = {
      size: formData.egg_size,
      color: formData.egg_color,
      laid_date: new Date().toISOString().split('T')[0], // Default to today
      expiration_date: new Date(new Date().setDate(new Date().getDate() + 30))
        .toISOString()
        .split('T')[0], // Default to 30 days from now
      quantity: formData.egg_quantity,
    };

    // Find existing egg records
    const eggsRes = await api.get('/api/eggs', {
      params: {
        size: formData.egg_size,
        color: formData.egg_color,
      },
    });

    let eggRecordId = null;

    if (eggsRes.data.length > 0) {
      // Update existing egg record
      const existingEgg = eggsRes.data[0];
      eggRecordId = existingEgg.egg_record_id;

      const newQuantity =
        existingEgg.quantity - parseInt(formData.egg_quantity);
      if (newQuantity < 0) {
        setError(
          `Cannot sell more than the available quantity (${existingEgg.quantity})`
        );
        setSubmitting(false);
        throw new Error('Insufficient quantity');
      }

      await api.put(`/api/eggs/${existingEgg.egg_record_id}`, {
        ...eggData,
        laid_date: new Date(existingEgg.laid_date).toISOString().split('T')[0],
        quantity: newQuantity,
        notes: existingEgg.notes
          ? `${existingEgg.notes}; Sold ${formData.egg_quantity} on ${new Date().toISOString().split('T')[0]}`
          : `Sold ${formData.egg_quantity} on ${new Date().toISOString().split('T')[0]}`,
      });
    } else {
      // Create new egg record
      const newEggRes = await api.post('/api/eggs', {
        ...eggData,
        status: 'Sold',
      });
      eggRecordId = newEggRes.data.egg_record_id;
    }

    // Update form data with record ID
    setFormData((prev) => ({ ...prev, egg_record_id: eggRecordId }));
    return eggRecordId;
  };

  // Handle inventory purchase transactions
  const handleInventoryPurchase = async () => {
    if (!formData.inventory_id) {
      setError('Inventory item is required');
      setSubmitting(false);
      throw new Error('Missing inventory item');
    }

    try {
      // Get the current inventory item
      const inventoryRes = await api.get(
        `/api/inventory/${formData.inventory_id}`
      );
      const inventoryItem = inventoryRes.data;

      if (inventoryItem) {
        // Update the inventory quantity - for purchases, we add to the quantity
        const newQuantity = inventoryItem.quantity
          ? parseInt(inventoryItem.quantity) +
          parseInt(formData.inventory_quantity || 1)
          : parseInt(formData.inventory_quantity || 1);

        await api.put(`/api/inventory/${formData.inventory_id}`, {
          ...inventoryItem,
          quantity: newQuantity,
          last_restocked: new Date().toISOString().split('T')[0],
          notes: inventoryItem.notes
            ? `${inventoryItem.notes}; Purchased ${formData.inventory_quantity || 1} on ${new Date().toISOString().split('T')[0]}`
            : `Purchased ${formData.inventory_quantity || 1} on ${new Date().toISOString().split('T')[0]}`,
        });
      }

      return formData.inventory_id;
    } catch (err) {
      console.error('Error updating inventory:', err);
      setError('Error updating inventory. Please try again.');
      setSubmitting(false);
      throw err;
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      // Scroll to first error field
      const firstErrorField = Object.keys(formErrors)[0];
      const element = document.querySelector(`[name="${firstErrorField}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    try {
      setSubmitting(true);

      // Handle each transaction category
      if (formData.category === 'Chicken Sale') {
        await handleChickenSale();
      } else if (formData.category === 'Chick Sale') {
        await handleChickSale();
      } else if (formData.category === 'Egg Sale') {
        await handleEggSale();
      } else if (formData.category === 'Inventory Purchase') {
        await handleInventoryPurchase();
      }

      // Prepare transaction data
      const transactionData = {
        transaction_type: formData.transaction_type,
        category: formData.category,
        amount: formData.amount,
        notes: formData.notes,
        buyer_id: formData.buyer_id || null,
        seller_id: formData.seller_id || null,
        inventory_id: formData.inventory_id || null,
        transaction_date: formData.transaction_date,
        chicken_record_id: formData.chicken_record_id || null,
        chick_record_id: formData.chick_record_id || null,
        egg_record_id: formData.egg_record_id || null,
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
          category: formData.category,
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
          id: response.data.transaction_id,
        });

        // After a delay, navigate back to transaction list
        setTimeout(() => {
          navigate('/admin/finance/transactions');
        }, 2000);
      }
    } catch (err) {
      setError(
        err.response?.data?.msg || 'An error occurred. Please try again.'
      );
      setSubmitting(false);
      console.error('Error saving transaction:', err);
    }
  };

  // Format currency for display
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2,
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
                          <option
                            key={seller.seller_id}
                            value={seller.seller_id}
                          >
                            {seller.first_name} {seller.last_name}
                          </option>
                        ))}
                        <option value="new">+ Add New Seller</option>
                      </select>
                    </div>
                    {formErrors.seller_id && (
                      <p className="mt-1 text-sm text-red-600">
                        {formErrors.seller_id}
                      </p>
                    )}
                  </div>
                )}

                {/* Inventory Purchase Fields */}
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
                          htmlFor="inventory_quantity"
                          className="mb-1 block text-sm font-medium text-gray-700"
                        >
                          Quantity to Purchase{' '}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          id="inventory_quantity"
                          name="inventory_quantity"
                          min="1"
                          step="1"
                          value={formData.inventory_quantity}
                          onChange={handleChange}
                          className={`block w-full rounded-md border ${formErrors.inventory_quantity ? 'border-red-300' : 'border-gray-300'} px-3 py-2 focus:border-amber-500 focus:outline-none focus:ring-amber-500`}
                          placeholder="Enter quantity"
                        />
                        {formErrors.inventory_quantity && (
                          <p className="mt-1 text-sm text-red-600">
                            {formErrors.inventory_quantity}
                          </p>
                        )}
                      </div>
                    </>
                  )}

                {/* Chicken Sale Fields */}
                {formData.transaction_type === 'Income' &&
                  formData.category === 'Chicken Sale' && (
                    <>
                      <div className="col-span-full mb-4 mt-2">
                        <h3 className="text-lg font-medium text-gray-700">
                          Chicken Information
                        </h3>
                        <div className="mt-2 border-t border-gray-200"></div>
                      </div>

                      <div>
                        <label
                          htmlFor="chicken_type"
                          className="mb-1 block text-sm font-medium text-gray-700"
                        >
                          Chicken Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="chicken_type"
                          name="chicken_type"
                          value={formData.chicken_type}
                          onChange={handleChange}
                          className={`block w-full rounded-md border ${formErrors.chicken_type
                              ? 'border-red-300'
                              : 'border-gray-300'
                            } px-3 py-2 focus:border-amber-500 focus:outline-none`}
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
                          htmlFor="chicken_breed"
                          className="mb-1 block text-sm font-medium text-gray-700"
                        >
                          Breed <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="chicken_breed"
                          name="chicken_breed"
                          value={formData.chicken_breed}
                          onChange={handleChange}
                          className={`block w-full rounded-md border ${formErrors.chicken_breed
                              ? 'border-red-300'
                              : 'border-gray-300'
                            } px-3 py-2 focus:border-amber-500 focus:outline-none`}
                        >
                          <option value="">Select Breed</option>
                          {chickenBreeds.map((breed) => (
                            <option key={breed} value={breed}>
                              {breed}
                            </option>
                          ))}
                        </select>
                        {formErrors.chicken_breed && (
                          <p className="mt-1 text-sm text-red-600">
                            {formErrors.chicken_breed}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="chicken_quantity"
                          className="mb-1 block text-sm font-medium text-gray-700"
                        >
                          Quantity <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          id="chicken_quantity"
                          name="chicken_quantity"
                          min="1"
                          step="1"
                          value={formData.chicken_quantity}
                          onChange={handleChange}
                          className={`block w-full rounded-md border ${formErrors.chicken_quantity
                              ? 'border-red-300'
                              : 'border-gray-300'
                            } px-3 py-2 focus:border-amber-500 focus:outline-none`}
                          placeholder="Enter quantity"
                        />
                        {availableChickenQuantity > 0 ? (
                          <p className="mt-1 flex items-center text-xs">
                            <span className="rounded bg-green-100 px-2 py-1 font-medium text-green-800">
                              Available: {availableChickenQuantity}
                            </span>
                          </p>
                        ) : (
                          <p className="mt-1 flex items-center text-xs">
                            <span className="rounded bg-red-100 px-2 py-1 font-medium text-red-800">
                              No stock available
                            </span>
                          </p>
                        )}
                        {formErrors.chicken_quantity && (
                          <p className="mt-1 text-sm text-red-600">
                            {formErrors.chicken_quantity}
                          </p>
                        )}
                      </div>
                    </>
                  )}

                {/* Chick Sale Fields */}
                {formData.transaction_type === 'Income' &&
                  formData.category === 'Chick Sale' && (
                    <>
                      <div className="col-span-full mb-4 mt-2">
                        <h3 className="text-lg font-medium text-gray-700">
                          Chick Information
                        </h3>
                        <div className="mt-2 border-t border-gray-200"></div>
                      </div>

                      <div>
                        <label
                          htmlFor="chick_parent_breed"
                          className="mb-1 block text-sm font-medium text-gray-700"
                        >
                          Parent Breed <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="chick_parent_breed"
                          name="chick_parent_breed"
                          value={formData.chick_parent_breed}
                          onChange={handleChange}
                          className={`block w-full rounded-md border ${formErrors.chick_parent_breed
                              ? 'border-red-300'
                              : 'border-gray-300'
                            } px-3 py-2 focus:border-amber-500 focus:outline-none`}
                        >
                          <option value="">Select Parent Breed</option>
                          {chickenBreeds.map((breed) => (
                            <option key={breed} value={breed}>
                              {breed}
                            </option>
                          ))}
                        </select>
                        {formErrors.chick_parent_breed && (
                          <p className="mt-1 text-sm text-red-600">
                            {formErrors.chick_parent_breed}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="chick_quantity"
                          className="mb-1 block text-sm font-medium text-gray-700"
                        >
                          Quantity <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          id="chick_quantity"
                          name="chick_quantity"
                          min="1"
                          step="1"
                          value={formData.chick_quantity}
                          onChange={handleChange}
                          className={`block w-full rounded-md border ${formErrors.chick_quantity
                              ? 'border-red-300'
                              : 'border-gray-300'
                            } px-3 py-2 focus:border-amber-500 focus:outline-none`}
                          placeholder="Enter quantity"
                        />
                        {availableChickQuantity > 0 ? (
                          <p className="mt-1 flex items-center text-xs">
                            <span className="rounded bg-green-100 px-2 py-1 font-medium text-green-800">
                              Available: {availableChickQuantity}
                            </span>
                          </p>
                        ) : (
                          <p className="mt-1 flex items-center text-xs">
                            <span className="rounded bg-red-100 px-2 py-1 font-medium text-red-800">
                              No stock available
                            </span>
                          </p>
                        )}
                        {formErrors.chick_quantity && (
                          <p className="mt-1 text-sm text-red-600">
                            {formErrors.chick_quantity}
                          </p>
                        )}
                      </div>
                    </>
                  )}

                {/* Egg Sale Fields */}
                {formData.transaction_type === 'Income' &&
                  formData.category === 'Egg Sale' && (
                    <>
                      <div className="col-span-full mb-4 mt-2">
                        <h3 className="text-lg font-medium text-gray-700">
                          Egg Information
                        </h3>
                        <div className="mt-2 border-t border-gray-200"></div>
                      </div>

                      <div>
                        <label
                          htmlFor="egg_size"
                          className="mb-1 block text-sm font-medium text-gray-700"
                        >
                          Size <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="egg_size"
                          name="egg_size"
                          value={formData.egg_size}
                          onChange={handleChange}
                          className={`block w-full rounded-md border ${formErrors.egg_size
                              ? 'border-red-300'
                              : 'border-gray-300'
                            } px-3 py-2 focus:border-amber-500 focus:outline-none`}
                        >
                          <option value="">Select Size</option>
                          {eggSizes.map((size) => (
                            <option key={size} value={size}>
                              {size}
                            </option>
                          ))}
                        </select>
                        {formErrors.egg_size && (
                          <p className="mt-1 text-sm text-red-600">
                            {formErrors.egg_size}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="egg_color"
                          className="mb-1 block text-sm font-medium text-gray-700"
                        >
                          Color <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="egg_color"
                          name="egg_color"
                          value={formData.egg_color}
                          onChange={handleChange}
                          className={`block w-full rounded-md border ${formErrors.egg_color
                              ? 'border-red-300'
                              : 'border-gray-300'
                            } px-3 py-2 focus:border-amber-500 focus:outline-none`}
                        >
                          <option value="">Select Color</option>
                          {eggColors.map((color) => (
                            <option key={color} value={color}>
                              {color}
                            </option>
                          ))}
                        </select>
                        {formErrors.egg_color && (
                          <p className="mt-1 text-sm text-red-600">
                            {formErrors.egg_color}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="egg_quantity"
                          className="mb-1 block text-sm font-medium text-gray-700"
                        >
                          Quantity <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          id="egg_quantity"
                          name="egg_quantity"
                          min="1"
                          step="1"
                          value={formData.egg_quantity}
                          onChange={handleChange}
                          className={`block w-full rounded-md border ${formErrors.egg_quantity
                              ? 'border-red-300'
                              : 'border-gray-300'
                            } px-3 py-2 focus:border-amber-500 focus:outline-none`}
                          placeholder="Enter quantity"
                        />
                        {availableEggQuantity > 0 ? (
                          <p className="mt-1 flex items-center text-xs">
                            <span className="rounded bg-green-100 px-2 py-1 font-medium text-green-800">
                              Available: {availableEggQuantity}
                            </span>
                          </p>
                        ) : (
                          <p className="mt-1 flex items-center text-xs">
                            <span className="rounded bg-red-100 px-2 py-1 font-medium text-red-800">
                              No stock available
                            </span>
                          </p>
                        )}
                        {formErrors.egg_quantity && (
                          <p className="mt-1 text-sm text-red-600">
                            {formErrors.egg_quantity}
                          </p>
                        )}
                      </div>
                    </>
                  )}

                {/* Notes */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="notes"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Notes
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
                      className={`block w-full rounded-md border ${formErrors.notes ? 'border-red-300' : 'border-gray-300'
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

                      {/* Preview based on transaction category */}
                      {formData.category === 'Chicken Sale' && (
                        <div className="col-span-2">
                          <p className="text-sm font-medium text-gray-600">
                            Chicken Details:
                          </p>
                          <p className="text-base font-medium">
                            {formData.chicken_quantity} {formData.chicken_type}{' '}
                            chicken
                            {formData.chicken_breed &&
                              ` (${formData.chicken_breed})`}
                          </p>
                        </div>
                      )}

                      {formData.category === 'Chick Sale' && (
                        <div className="col-span-2">
                          <p className="text-sm font-medium text-gray-600">
                            Chick Details:
                          </p>
                          <p className="text-base font-medium">
                            {formData.chick_quantity} Chicks
                            {formData.chick_parent_breed &&
                              ` (${formData.chick_parent_breed})`}
                          </p>
                        </div>
                      )}

                      {formData.category === 'Egg Sale' && (
                        <div className="col-span-2">
                          <p className="text-sm font-medium text-gray-600">
                            Egg Details:
                          </p>
                          <p className="text-base font-medium">
                            {formData.egg_quantity} Eggs
                            {(formData.egg_size || formData.egg_color) &&
                              ` (${formData.egg_size}${formData.egg_color ? ` - ${formData.egg_color}` : ''})`}
                          </p>
                        </div>
                      )}

                      {formData.category === 'Inventory Purchase' && (
                        <div className="col-span-2">
                          <p className="text-sm font-medium text-gray-600">
                            Inventory Item:
                          </p>
                          <p className="text-base font-medium">
                            {inventoryItems.find(
                              (item) =>
                                item.inventory_id == formData.inventory_id
                            )?.item_name || ''}
                            ({formData.inventory_quantity} units)
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