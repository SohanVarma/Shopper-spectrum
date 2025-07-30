import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  // File upload
  uploadData: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/upload-data', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Analytics endpoints
  getAnalyticsSummary: async () => {
    const response = await api.get('/analytics-summary');
    return response.data;
  },

  getRFMAnalysis: async () => {
    const response = await api.get('/rfm-analysis');
    return response.data;
  },

  getCustomerSegments: async () => {
    const response = await api.get('/customer-segments');
    return response.data;
  },

  // Product recommendations
  getProductRecommendations: async (productName, topN = 5) => {
    const response = await api.post('/product-recommendations', {
      product_name: productName,
      top_n: topN,
    });
    return response.data;
  },

  getProducts: async () => {
    const response = await api.get('/products');
    return response.data;
  },
};

export default apiService;