import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FloppyDisk } from '@phosphor-icons/react';
import DashboardLayout from '../DashboardLayout';
import api from '../../../utils/api';

const OrderItemForm = () => {
  const navigate = useNavigate();
  const { id, itemId } = useParams();
  const isEditMode = !!itemId;

  // Form state
  const [formData, setFormData] = useState({
    product_type: '',
    quantity: '',
    unit_price: '',
    total_price: '',
    chicken_type: '',
    chicken_breed: '',
    chicken_record_id: '',
    chick_parent_breed: '',
    chick_record_id: '',
    egg_size: '',
    egg_color: '',
    egg_record_id: '',
  });

  // Status states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  
  // Data states
  const [chickens, setChickens] = useState([]);
  const [chicks, setChicks] = useState([]);
  const [eggs, setEggs] = useState([]);
  const [chickenTypes, setChickenTypes] = useState([]);
  const [chickenBreeds, setChickenBreeds] = useState([]);
  const [chickParentBreeds, setChickParentBreeds] = useState([]);
  const [filteredChickens, setFilteredChickens] = useState([]);
  const [filteredChicks, setFilteredChicks] = useState([]);
  const [filteredEggs, setFilteredEggs] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all necessary data in parallel
        const [chickensRes, chicksRes, eggsRes] = await Promise.all([
          api.get('/api/chickens'),
          api.get('/api/chicks'),
          api.get('/api/eggs')
        ]);
        
        setChickens(chickensRes.data);
        setChicks(chicksRes.data);
        setEggs(eggsRes.data);
        
        // Extract unique chicken types
        const types = [...new Set(chickensRes.data.map(chicken => chicken.type))];
        setChickenTypes(types);
        
        // Extract unique chicken breeds
        const breeds = [...new Set(chickensRes.data.map(chicken => chicken.breed))];
        setChickenBreeds(breeds);
        
        // Extract unique parent breeds for chicks
        const parentBreeds = [...new Set(chicksRes.data.map(chick => chick.parent_breed))];
        setChickParentBreeds(parentBreeds);
        
        setFilteredChickens(chickensRes.data);
        setFilteredChicks(chicksRes.data);
        setFilteredEggs(eggsRes.data);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load necessary data. Please refresh and try again.');
        setLoading(false);
      }
    };

    fetchData();

    // If editing, fetch the current item data
    if (isEditMode) {
      const fetchOrderItem = async () => {
        try {
          setLoading(true);
          const response = await api.get(`/api/orders/${id}/items/${itemId}`);
          setFormData({
            ...response.data,
          });
          setLoading(false);
        } catch (err) {
          setError('Error loading item data. Please try again.');
          setLoading(false);
          console.error('Error fetching order item:', err);
        }
      };

      fetchOrderItem();
    }
  }, [id, itemId, isEditMode]);

  // Handle input changes
  const handleChange = (e) => {
    setError(null); // Clear error when user types
    const { name, value } = e.target;
    
    // Special handling for product_type changes
    if (name === 'product_type') {
      // Reset all related fields when product type changes
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        chicken_type: '',
        chicken_breed: '',
        chicken_record_id: '',
        chick_parent_breed: '',
        chick_record_id: '',
        egg_size: '',
        egg_color: '',
        egg_record_id: '',
      }));
    } 
    // Special handling for chicken type changes
    else if (name === 'chicken_type') {
      const filteredByType = chickens.filter(chicken => chicken.type === value);
      setFilteredChickens(filteredByType);
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        chicken_breed: '',
        chicken_record_id: '',
      }));
    } 
    // Special handling for chicken breed changes
    else if (name === 'chicken_breed') {
      const filteredByTypeAndBreed = filteredChickens.filter(chicken => chicken.breed === value);
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        chicken_record_id: filteredByTypeAndBreed.length > 0 ? filteredByTypeAndBreed[0].chicken_record_id : '',
      }));
    }
    // Special handling for chick parent breed changes
    else if (name === 'chick_parent_breed') {
      const filteredByParentBreed = chicks.filter(
        chick => chick.parent_breed === value
      );
      setFilteredChicks(filteredByParentBreed);
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        chick_record_id: filteredByParentBreed.length > 0 ? filteredByParentBreed[0].chick_record_id : '',
      }));
    }
    // Special handling for egg size and color
    else if (name === 'egg_size' || name === 'egg_color') {
      let newFilteredEggs = eggs;
      
      if (name === 'egg_size') {
        newFilteredEggs = eggs.filter(egg => 
          egg.size === value && (formData.egg_color ? egg.color === formData.egg_color : true)
        );
      } else { // egg_color
        newFilteredEggs = eggs.filter(egg => 
          egg.color === value && (formData.egg_size ? egg.size === formData.egg_size : true)
        );
      }
      
      setFilteredEggs(newFilteredEggs);
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        egg_record_id: newFilteredEggs.length > 0 ? newFilteredEggs[0].egg_record_id : '',
      }));
    }
    // Special handling for quantity or unit_price changes to calculate total_price
    else if (name === 'quantity' || name === 'unit_price') {
      const quantity = name === 'quantity' ? parseFloat(value) || 0 : parseFloat(formData.quantity) || 0;
      const unitPrice = name === 'unit_price' ? parseFloat(value) || 0 : parseFloat(formData.unit_price) || 0;
      const totalPrice = (quantity * unitPrice).toFixed(2);
      
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        total_price: totalPrice,
      }));
    }
    // Default handling for other fields
    else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error for this field when user types
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!formData.product_type) {
      errors.product_type = 'Product type is required';
    }

    // Validation based on product type
    if (formData.product_type === 'Chicken') {
      if (!formData.chicken_type) {
        errors.chicken_type = 'Chicken type is required';
      }
      if (!formData.chicken_breed) {
        errors.chicken_breed = 'Chicken breed is required';
      }
      if (!formData.chicken_record_id) {
        errors.chicken_record_id = 'Invalid selection. No matching chickens found.';
      }
    } else if (formData.product_type === 'Chick') {
      if (!formData.chick_parent_breed) {
        errors.chick_parent_breed = 'Parent breed is required';
      }
      if (!formData.chick_record_id) {
        errors.chick_record_id = 'Invalid selection. No matching chicks found.';
      }
    } else if (formData.product_type === 'Egg') {
      if (!formData.egg_size) {
        errors.egg_size = 'Egg size is required';
      }
      if (!formData.egg_color) {
        errors.egg_color = 'Egg color is required';
      }
      if (!formData.egg_record_id) {
        errors.egg_record_id = 'Invalid selection. No matching eggs found.';
      }
    }

    if (!formData.quantity) {
      errors.quantity = 'Quantity is required';
    } else if (formData.quantity <= 0) {
      errors.quantity = 'Quantity must be greater than 0';
    }

    if (!formData.unit_price) {
      errors.unit_price = 'Unit price is required';
    } else if (formData.unit_price <= 0) {
      errors.unit_price = 'Unit price must be greater than 0';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Generate descriptive notes based on selected items
  const generateNotes = () => {
    if (formData.product_type === 'Chicken') {
      const selectedChicken = chickens.find(
        c => c.chicken_record_id === parseInt(formData.chicken_record_id)
      );
      
      if (selectedChicken) {
        // Calculate age based on acquisition_date and age_weeks
        let age = 0;
        if (selectedChicken.acquisition_date) {
          const acquisitionDate = new Date(selectedChicken.acquisition_date);
          const currentDate = new Date();
          const ageInWeeks = Math.floor((currentDate - acquisitionDate) / (7 * 24 * 60 * 60 * 1000));
          age = (ageInWeeks + (selectedChicken.age_weeks || 0));
        } else if (selectedChicken.age_weeks) {
          age = selectedChicken.age_weeks;
        }
        
        return `Type: ${selectedChicken.type}, Breed: ${selectedChicken.breed}, Age: ${age} weeks`;
      }
    } else if (formData.product_type === 'Chick') {
      const selectedChick = chicks.find(
        c => c.chick_record_id === parseInt(formData.chick_record_id)
      );
      
      if (selectedChick) {
        // Calculate age based on hatched_date
        let age = 0;
        if (selectedChick.hatched_date) {
          const hatchedDate = new Date(selectedChick.hatched_date);
          const currentDate = new Date();
          age = Math.floor((currentDate - hatchedDate) / (7 * 24 * 60 * 60 * 1000));
        }
        
        return `Parent Breed: ${selectedChick.parent_breed}, Age: ${age} weeks`;
      }
    } else if (formData.product_type === 'Egg') {
      const selectedEgg = eggs.find(
        e => e.egg_record_id === parseInt(formData.egg_record_id)
      );
      
      if (selectedEgg) {
        return `Size: ${selectedEgg.size}, Color: ${selectedEgg.color}`;
      }
    }
    
    return '';
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      
      // Generate notes field
      const notes = generateNotes();
      
      // Prepare data for submission
      const submitData = {
        product_type: formData.product_type,
        quantity: formData.quantity,
        unit_price: formData.unit_price,
        total_price: formData.total_price,
        notes
      };

      // Add the appropriate record ID based on product type
      if (formData.product_type === 'Chicken') {
        submitData.chicken_record_id = formData.chicken_record_id;
      } else if (formData.product_type === 'Chick') {
        submitData.chick_record_id = formData.chick_record_id;
      } else if (formData.product_type === 'Egg') {
        submitData.egg_record_id = formData.egg_record_id;
      }

      if (isEditMode) {
        await api.put(`/api/orders/${id}/items/${itemId}`, submitData);
      } else {
        await api.post(`/api/orders/${id}/items`, submitData);
      }

      setLoading(false);
      navigate(`/admin/orders/${id}`);
    } catch (err) {
      setLoading(false);

      // Check if error response exists
      if (err.response?.data) {
        // Handle field validation errors
        if (err.response.data.errors) {
          const backendErrors = {};
          err.response.data.errors.forEach((error) => {
            backendErrors[error.path] = error.msg;
          });
          setFormErrors(backendErrors);
          setError(null); // Clear general error when showing field-specific errors
        }
        // Handle general API error messages
        else if (err.response.data.msg) {
          setError(err.response.data.msg);
          setFormErrors({}); // Clear field-specific errors when showing general error
        }
        // Handle other unexpected error formats
        else {
          setError('An unexpected error occurred. Please try again.');
          setFormErrors({});
        }
      }
      // Handle network errors and other errors
      else if (err.request) {
        setError('Network error. Please check your connection and try again.');
        setFormErrors({});
      } else {
        setError('An error occurred. Please try again.');
        setFormErrors({});
      }
      // Log the error for debugging
      console.error('Error submitting form:', err);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-amber-500"></div>
            <span className="ml-2">Loading...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="mb-6 flex items-center">
          <button
            onClick={() => navigate(`/admin/orders/${id}`)}
            className="mr-4 text-gray-600 hover:text-amber-500"
          >
            <ArrowLeft size={24} weight="duotone" />
          </button>
          <h1 className="text-2xl font-bold">
            {isEditMode ? 'Edit Order Item' : 'Add Order Item'}
          </h1>
        </div>

        {/* Display error message if any */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-100 p-3 text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Product Type Selection */}
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Product Type <span className="text-red-600">*</span>
              </label>
              <select
                name="product_type"
                value={formData.product_type}
                onChange={handleChange}
                className={`cursor-pointer border bg-gray-50 ${
                  formErrors.product_type ? 'border-red-500' : 'border-gray-300'
                } block w-full rounded-lg p-2.5 text-sm text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-amber-500`}
              >
                <option value="">Select product type</option>
                <option value="Chicken">Chicken</option>
                <option value="Chick">Chick</option>
                <option value="Egg">Egg</option>
              </select>
              {formErrors.product_type && (
                <p className="mt-1 text-sm text-red-500">
                  {formErrors.product_type}
                </p>
              )}
            </div>
            
            {/* Product-specific fields */}
            {formData.product_type === 'Chicken' && (
              <>
                {/* Chicken Type */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Chicken Type <span className="text-red-600">*</span>
                  </label>
                  <select
                    name="chicken_type"
                    value={formData.chicken_type}
                    onChange={handleChange}
                    className={`cursor-pointer border bg-gray-50 ${
                      formErrors.chicken_type ? 'border-red-500' : 'border-gray-300'
                    } block w-full rounded-lg p-2.5 text-sm text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-amber-500`}
                  >
                    <option value="">Select chicken type</option>
                    {chickenTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {formErrors.chicken_type && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.chicken_type}
                    </p>
                  )}
                </div>
                
                {/* Chicken Breed */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Chicken Breed <span className="text-red-600">*</span>
                  </label>
                  <select
                    name="chicken_breed"
                    value={formData.chicken_breed}
                    onChange={handleChange}
                    disabled={!formData.chicken_type}
                    className={`cursor-pointer border bg-gray-50 ${
                      formErrors.chicken_breed ? 'border-red-500' : 'border-gray-300'
                    } block w-full rounded-lg p-2.5 text-sm text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-amber-500 disabled:bg-gray-200 disabled:cursor-not-allowed`}
                  >
                    <option value="">Select chicken breed</option>
                    {filteredChickens
                      .filter((chicken, index, self) => 
                        index === self.findIndex(c => c.breed === chicken.breed)
                      )
                      .map((chicken) => (
                        <option key={chicken.breed} value={chicken.breed}>
                          {chicken.breed}
                        </option>
                      ))
                    }
                  </select>
                  {formErrors.chicken_breed && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.chicken_breed}
                    </p>
                  )}
                </div>

                {/* Chicken Age Display (read-only) */}
                {formData.chicken_record_id && (
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Chicken Details
                    </label>
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm">
                      {chickens
                        .filter(chicken => chicken.chicken_record_id === parseInt(formData.chicken_record_id))
                        .map(chicken => {
                          const acquisitionDate = chicken.acquisition_date ? new Date(chicken.acquisition_date) : null;
                          const currentDate = new Date();
                          let ageDisplay = chicken.age_weeks ? `Initial age: ${chicken.age_weeks} weeks` : 'Age unknown';
                          
                          if (acquisitionDate) {
                            const weeksSinceAcquisition = Math.floor((currentDate - acquisitionDate) / (7 * 24 * 60 * 60 * 1000));
                            const totalAge = weeksSinceAcquisition + (chicken.age_weeks || 0);
                            ageDisplay = `Current age: approximately ${totalAge} weeks`;
                          }
                          
                          return (
                            <div key={chicken.chicken_record_id}>
                              <p><strong>Type:</strong> {chicken.type}</p>
                              <p><strong>Breed:</strong> {chicken.breed}</p>
                              <p><strong>{ageDisplay}</strong></p>
                              <p><strong>Available Quantity:</strong> {chicken.quantity}</p>
                            </div>
                          );
                        })[0]
                      }
                    </div>
                  </div>
                )}
              </>
            )}
            
            {formData.product_type === 'Chick' && (
              <>
                {/* Chick Parent Breed */}
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Parent Breed <span className="text-red-600">*</span>
                  </label>
                  <select
                    name="chick_parent_breed"
                    value={formData.chick_parent_breed}
                    onChange={handleChange}
                    className={`border bg-gray-50 ${
                      formErrors.chick_parent_breed ? 'border-red-500' : 'border-gray-300'
                    } block w-full rounded-lg p-2.5 text-sm text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-amber-500`}
                  >
                    <option value="">Select parent breed</option>
                    {chickParentBreeds.map((breed) => (
                      <option key={breed} value={breed}>{breed}</option>
                    ))}
                  </select>
                  {formErrors.chick_parent_breed && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.chick_parent_breed}
                    </p>
                  )}
                </div>

                {/* Chick Details Display (read-only) */}
                {formData.chick_record_id && (
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Chick Details
                    </label>
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm">
                      {chicks
                        .filter(chick => chick.chick_record_id === parseInt(formData.chick_record_id))
                        .map(chick => {
                          const hatchedDate = chick.hatched_date ? new Date(chick.hatched_date) : null;
                          const currentDate = new Date();
                          let ageDisplay = 'Age unknown';
                          
                          if (hatchedDate) {
                            const ageInWeeks = Math.floor((currentDate - hatchedDate) / (7 * 24 * 60 * 60 * 1000));
                            ageDisplay = `Age: approximately ${ageInWeeks} weeks`;
                          }
                          
                          return (
                            <div key={chick.chick_record_id}>
                              <p><strong>Parent Breed:</strong> {chick.parent_breed}</p>
                              <p><strong>Hatched Date:</strong> {new Date(chick.hatched_date).toLocaleDateString()}</p>
                              <p><strong>{ageDisplay}</strong></p>
                              <p><strong>Available Quantity:</strong> {chick.quantity}</p>
                            </div>
                          );
                        })[0]
                      }
                    </div>
                  </div>
                )}
              </>
            )}
            
            {formData.product_type === 'Egg' && (
              <>
                {/* Egg Size */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Size <span className="text-red-600">*</span>
                  </label>
                  <select
                    name="egg_size"
                    value={formData.egg_size}
                    onChange={handleChange}
                    className={`border bg-gray-50 ${
                      formErrors.egg_size ? 'border-red-500' : 'border-gray-300'
                    } block w-full rounded-lg p-2.5 text-sm text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-amber-500`}
                  >
                    <option value="">Select egg size</option>
                    <option value="Small">Small</option>
                    <option value="Medium">Medium</option>
                    <option value="Large">Large</option>
                  </select>
                  {formErrors.egg_size && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.egg_size}
                    </p>
                  )}
                </div>
                
                {/* Egg Color */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Color <span className="text-red-600">*</span>
                  </label>
                  <select
                    name="egg_color"
                    value={formData.egg_color}
                    onChange={handleChange}
                    className={`border bg-gray-50 ${
                      formErrors.egg_color ? 'border-red-500' : 'border-gray-300'
                    } block w-full rounded-lg p-2.5 text-sm text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-amber-500`}
                  >
                    <option value="">Select egg color</option>
                    <option value="White">White</option>
                    <option value="Brown">Brown</option>
                  </select>
                  {formErrors.egg_color && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.egg_color}
                    </p>
                  )}
                </div>

                {/* Egg Details Display (read-only) */}
                {formData.egg_record_id && (
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Egg Details
                    </label>
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm">
                      {eggs
                        .filter(egg => egg.egg_record_id === parseInt(formData.egg_record_id))
                        .map(egg => {
                          return (
                            <div key={egg.egg_record_id}>
                              <p><strong>Size:</strong> {egg.size}</p>
                              <p><strong>Color:</strong> {egg.color}</p>
                              <p><strong>Laid Date:</strong> {new Date(egg.laid_date).toLocaleDateString()}</p>
                              <p><strong>Expiration Date:</strong> {new Date(egg.expiration_date).toLocaleDateString()}</p>
                              <p><strong>Available Quantity:</strong> {egg.quantity}</p>
                            </div>
                          );
                        })[0]
                      }
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Order Quantity */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Quantity <span className="text-red-600">*</span>
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="1"
                className={`border bg-gray-50 ${
                  formErrors.quantity ? 'border-red-500' : 'border-gray-300'
                } block w-full rounded-lg p-2.5 text-sm text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-amber-500`}
                placeholder="Enter quantity"
              />
              {formErrors.quantity && (
                <p className="mt-1 text-sm text-red-500">
                  {formErrors.quantity}
                </p>
              )}
            </div>

            {/* Unit Price */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Unit Price (Rs.) <span className="text-red-600">*</span>
              </label>
              <input
                type="number"
                name="unit_price"
                value={formData.unit_price}
                onChange={handleChange}
                min="1"
                step="1"
                className={`border bg-gray-50 ${
                  formErrors.unit_price ? 'border-red-500' : 'border-gray-300'
                } block w-full rounded-lg p-2.5 text-sm text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-amber-500`}
                placeholder="Enter unit price"
              />
              {formErrors.unit_price && (
                <p className="mt-1 text-sm text-red-500">
                  {formErrors.unit_price}
                </p>
              )}
            </div>
            
            {/* Total Price (calculated automatically) */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Total Price (Rs.)
              </label>
              <input
                type="text"
                name="total_price"
                value={formData.total_price}
                readOnly
                className="cursor-default outline-none block w-full rounded-lg border border-gray-300 bg-gray-100 p-2.5 text-sm text-gray-700"
              />
            </div>
          </div>

          {/* Submit and Cancel Buttons */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => navigate(`/admin/orders/${id}`)}
              className="mr-2 rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-300 disabled:bg-amber-300"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Saving...
                </>
              ) : (
                <>
                  <FloppyDisk size={20} weight="duotone" />
                  Save
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default OrderItemForm;
