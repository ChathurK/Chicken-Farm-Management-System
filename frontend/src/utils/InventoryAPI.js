import api from './api';

/**
 * Inventory API helper functions for managing inventory items
 */
const InventoryAPI = {
  /**
   * Get all inventory items
   * @param {Object} filters - Optional filters (category, status, expiringSoon, lowStock)
   * @returns {Promise} - Promise with inventory items
   */
  getAll: async (filters = {}) => {
    const response = await api.get('/api/inventory', { params: filters });
    return response.data;
  },

  /**
   * Get inventory items by category
   * @param {string} category - Category name (Feed, Medication, Supplies, Other)
   * @returns {Promise} - Promise with inventory items
   */
  getByCategory: async (category) => {
    const response = await api.get(`/api/inventory/category/${category}`);
    return response.data;
  },

  /**
   * Get inventory item by ID
   * @param {number} id - Inventory item ID
   * @returns {Promise} - Promise with inventory item
   */
  getById: async (id) => {
    const response = await api.get(`/api/inventory/${id}`);
    return response.data;
  },

  /**
   * Create new inventory item
   * @param {Object} inventoryData - Inventory item data
   * @returns {Promise} - Promise with created inventory item
   */
  create: async (inventoryData) => {
    const response = await api.post('/api/inventory', inventoryData);
    return response.data;
  },

  /**
   * Update inventory item
   * @param {number} id - Inventory item ID
   * @param {Object} inventoryData - Updated inventory item data
   * @returns {Promise} - Promise with updated inventory item
   */
  update: async (id, inventoryData) => {
    const response = await api.put(`/api/inventory/${id}`, inventoryData);
    return response.data;
  },

  /**
   * Update inventory item status
   * @param {number} id - Inventory item ID
   * @param {string} status - New status (Available, Low, Finished, Expired)
   * @returns {Promise} - Promise with updated inventory item
   */
  updateStatus: async (id, status) => {
    const response = await api.patch(`/api/inventory/${id}/status`, { status });
    return response.data;
  },

  /**
   * Update inventory quantity
   * @param {number} id - Inventory item ID
   * @param {number} quantity - New quantity
   * @returns {Promise} - Promise with updated inventory item
   */
  updateQuantity: async (id, quantity) => {
    const response = await api.patch(`/api/inventory/${id}/quantity`, {
      quantity,
    });
    return response.data;
  },

  /**
   * Delete inventory item
   * @param {number} id - Inventory item ID
   * @returns {Promise} - Promise with success message
   */
  delete: async (id) => {
    const response = await api.delete(`/api/inventory/${id}`);
    return response.data;
  },

  /**
   * Get low stock items
   * @returns {Promise} - Promise with low stock items
   */
  getLowStock: async () => {
    const response = await api.get('/api/inventory', {
      params: { lowStock: true },
    });
    return response.data;
  },

  /**
   * Get expiring items
   * @returns {Promise} - Promise with expiring items
   */
  getExpiring: async () => {
    const response = await api.get('/api/inventory', {
      params: { expiringSoon: true },
    });
    return response.data;
  },

  /**
   * Search inventory items
   * @param {string} searchTerm - Search term
   * @returns {Promise} - Promise with matched inventory items
   */
  search: async (searchTerm) => {
    const response = await api.get('/api/inventory', {
      params: { search: searchTerm },
    });
    return response.data;
  },
};

export default InventoryAPI;
