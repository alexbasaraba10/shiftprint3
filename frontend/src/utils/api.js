import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Materials API
export const materialsAPI = {
  getAll: async () => {
    try {
      const response = await axios.get(`${API}/materials`);
      return response.data;
    } catch (error) {
      console.error('Error fetching materials:', error);
      // Fallback to localStorage
      const saved = localStorage.getItem('materials');
      return saved ? JSON.parse(saved) : [];
    }
  },
  
  create: async (material) => {
    try {
      const response = await axios.post(`${API}/materials`, material);
      return response.data;
    } catch (error) {
      console.error('Error creating material:', error);
      throw error;
    }
  },
  
  update: async (id, material) => {
    try {
      const response = await axios.put(`${API}/materials/${id}`, material);
      return response.data;
    } catch (error) {
      console.error('Error updating material:', error);
      throw error;
    }
  },
  
  delete: async (id) => {
    try {
      await axios.delete(`${API}/materials/${id}`);
    } catch (error) {
      console.error('Error deleting material:', error);
      throw error;
    }
  }
};

// Gallery API
export const galleryAPI = {
  getAll: async () => {
    try {
      const response = await axios.get(`${API}/gallery`);
      return response.data;
    } catch (error) {
      console.error('Error fetching gallery:', error);
      const saved = localStorage.getItem('gallery');
      return saved ? JSON.parse(saved) : [];
    }
  },
  
  create: async (item) => {
    try {
      const response = await axios.post(`${API}/gallery`, item);
      return response.data;
    } catch (error) {
      console.error('Error creating gallery item:', error);
      throw error;
    }
  },
  
  update: async (id, item) => {
    try {
      const response = await axios.put(`${API}/gallery/${id}`, item);
      return response.data;
    } catch (error) {
      console.error('Error updating gallery item:', error);
      throw error;
    }
  },
  
  delete: async (id) => {
    try {
      await axios.delete(`${API}/gallery/${id}`);
    } catch (error) {
      console.error('Error deleting gallery item:', error);
      throw error;
    }
  }
};

// Shop API
export const shopAPI = {
  getAll: async () => {
    try {
      const response = await axios.get(`${API}/shop`);
      return response.data;
    } catch (error) {
      console.error('Error fetching shop items:', error);
      const saved = localStorage.getItem('shopItems');
      return saved ? JSON.parse(saved) : [];
    }
  },
  
  create: async (item) => {
    try {
      const response = await axios.post(`${API}/shop`, item);
      return response.data;
    } catch (error) {
      console.error('Error creating shop item:', error);
      throw error;
    }
  },
  
  update: async (id, item) => {
    try {
      const response = await axios.put(`${API}/shop/${id}`, item);
      return response.data;
    } catch (error) {
      console.error('Error updating shop item:', error);
      throw error;
    }
  },
  
  delete: async (id) => {
    try {
      await axios.delete(`${API}/shop/${id}`);
    } catch (error) {
      console.error('Error deleting shop item:', error);
      throw error;
    }
  }
};

// Print Settings API
export const printSettingsAPI = {
  get: async () => {
    try {
      const response = await axios.get(`${API}/print-settings`);
      return response.data;
    } catch (error) {
      console.error('Error fetching print settings:', error);
      throw error;
    }
  },
  
  update: async (settings) => {
    try {
      const response = await axios.put(`${API}/print-settings`, settings);
      return response.data;
    } catch (error) {
      console.error('Error updating print settings:', error);
      throw error;
    }
  }
};

// Calculator API
export const calculatorAPI = {
  calculateCost: async (data) => {
    try {
      const response = await axios.post(`${API}/calculate-cost`, data);
      return response.data;
    } catch (error) {
      console.error('Error calculating cost:', error);
      throw error;
    }
  }
};
