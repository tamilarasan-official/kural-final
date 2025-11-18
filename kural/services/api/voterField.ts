import { API_CONFIG } from './config';

const API_BASE_URL = API_CONFIG.BASE_URL;

/**
 * Voter Field API Service
 * Handles all API calls related to voter custom fields
 */
export const voterFieldAPI = {
    /**
     * Get all visible voter fields for mobile app
     * @returns {Promise} API response
     */
    async getAllVisibleFields() {
        try {
            const response = await fetch(`${API_BASE_URL}/voter-fields`, {
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
            console.error('Error fetching voter fields:', error);
            throw error;
        }
    },

    /**
     * Get all voter fields including hidden ones (Admin only)
     * @param {String} token - Auth token
     * @returns {Promise} API response
     */
    async getAllFields(token: string) {
        try {
            const response = await fetch(`${API_BASE_URL}/voter-fields?includeHidden=true`, {
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
            console.error('Error fetching all voter fields:', error);
            throw error;
        }
    },

    /**
     * Get voter field by name
     * @param {String} name - Field name
     * @returns {Promise} API response
     */
    async getByName(name: string) {
        try {
            const response = await fetch(`${API_BASE_URL}/voter-fields/${name}`, {
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
            console.error('Error fetching voter field:', error);
            throw error;
        }
    },

    /**
     * Create a new voter field (Admin only)
     * @param {Object} fieldData - Field configuration
     * @param {String} token - Auth token
     * @returns {Promise} API response
     */
    async create(fieldData: any, token: string) {
        try {
            const response = await fetch(`${API_BASE_URL}/voter-fields`, {
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
            console.error('Error creating voter field:', error);
            throw error;
        }
    },

    /**
     * Update an existing voter field (Admin only)
     * @param {String} name - Field name
     * @param {Object} fieldData - Updated field configuration
     * @param {String} token - Auth token
     * @returns {Promise} API response
     */
    async update(name: string, fieldData: any, token: string) {
        try {
            const response = await fetch(`${API_BASE_URL}/voter-fields/${name}`, {
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
            console.error('Error updating voter field:', error);
            throw error;
        }
    },

    /**
     * Delete a voter field (Admin only)
     * @param {String} name - Field name
     * @param {String} token - Auth token
     * @returns {Promise} API response
     */
    async delete(name: string, token: string) {
        try {
            const response = await fetch(`${API_BASE_URL}/voter-fields/${name}`, {
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
            console.error('Error deleting voter field:', error);
            throw error;
        }
    },

    /**
     * Toggle voter field visibility (Admin only)
     * @param {String} name - Field name
     * @param {String} token - Auth token
     * @returns {Promise} API response
     */
    async toggleVisibility(name: string, token: string) {
        try {
            const response = await fetch(`${API_BASE_URL}/voter-fields/${name}/visibility`, {
                method: 'PUT',
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
            console.error('Error toggling voter field visibility:', error);
            throw error;
        }
    },
};
