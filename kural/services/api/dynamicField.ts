import { API_CONFIG } from './config';

const BASE_URL = API_CONFIG.BASE_URL;

/**
 * Dynamic Field API Service
 * Handles all API calls related to dynamic fields
 */
export const dynamicFieldAPI = {
    /**
     * Get all dynamic fields for mobile app
     * @param {Object} params - Query parameters
     * @returns {Promise} API response
     */
    async getAllForMobile(params: { category?: string; applicableTo?: string } = {}) {
        try {
            const queryParams = new URLSearchParams();
            
            if (params.category) queryParams.append('category', params.category);
            if (params.applicableTo) queryParams.append('applicableTo', params.applicableTo);
            
            const queryString = queryParams.toString();
            const url = `${BASE_URL}/dynamic-fields/mobile/all${queryString ? `?${queryString}` : ''}`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching dynamic fields:', error);
            throw error;
        }
    },

    /**
     * Get fields for a specific form type
     * @param {String} formType - Type of form (voter_registration, survey, etc.)
     * @param {String} formId - Optional specific form ID
     * @returns {Promise} API response
     */
    async getFieldsForForm(formType: string, formId: string | null = null) {
        try {
            const url = formId 
                ? `${BASE_URL}/dynamic-fields/form/${formType}?formId=${formId}`
                : `${BASE_URL}/dynamic-fields/form/${formType}`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching fields for form:', error);
            throw error;
        }
    },

    /**
     * Get a specific field by fieldId
     * @param {String} fieldId - Field identifier
     * @param {String} token - Auth token
     * @returns {Promise} API response
     */
    async getByFieldId(fieldId: string, token: string) {
        try {
            const response = await fetch(`${BASE_URL}/dynamic-fields/field/${fieldId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching field by fieldId:', error);
            throw error;
        }
    },

    /**
     * Create a new dynamic field (Admin only)
     * @param {Object} fieldData - Field configuration
     * @param {String} token - Auth token
     * @returns {Promise} API response
     */
    async create(fieldData: any, token: string) {
        try {
            const response = await fetch(`${BASE_URL}/dynamic-fields`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(fieldData),
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error creating dynamic field:', error);
            throw error;
        }
    },

    /**
     * Update an existing dynamic field (Admin only)
     * @param {String} id - Field ID
     * @param {Object} fieldData - Updated field configuration
     * @param {String} token - Auth token
     * @returns {Promise} API response
     */
    async update(id: string, fieldData: any, token: string) {
        try {
            const response = await fetch(`${BASE_URL}/dynamic-fields/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(fieldData),
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error updating dynamic field:', error);
            throw error;
        }
    },

    /**
     * Delete/Archive a dynamic field (Admin only)
     * @param {String} id - Field ID
     * @param {String} token - Auth token
     * @returns {Promise} API response
     */
    async delete(id: string, token: string) {
        try {
            const response = await fetch(`${BASE_URL}/dynamic-fields/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error deleting dynamic field:', error);
            throw error;
        }
    },

    /**
     * Bulk create dynamic fields (Admin only)
     * @param {Array} fields - Array of field configurations
     * @param {String} token - Auth token
     * @returns {Promise} API response
     */
    async bulkCreate(fields: any[], token: string) {
        try {
            const response = await fetch(`${BASE_URL}/dynamic-fields/bulk`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ fields }),
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error bulk creating dynamic fields:', error);
            throw error;
        }
    },

    /**
     * Reorder fields (Admin only)
     * @param {Array} fieldOrders - Array of { fieldId, order }
     * @param {String} token - Auth token
     * @returns {Promise} API response
     */
    async reorder(fieldOrders: any[], token: string) {
        try {
            const response = await fetch(`${BASE_URL}/dynamic-fields/reorder`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ fieldOrders }),
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error reordering fields:', error);
            throw error;
        }
    },

    /**
     * Get field statistics (Admin only)
     * @param {String} token - Auth token
     * @returns {Promise} API response
     */
    async getStats(token: string) {
        try {
            const response = await fetch(`${BASE_URL}/dynamic-fields/stats`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching field stats:', error);
            throw error;
        }
    },
};
