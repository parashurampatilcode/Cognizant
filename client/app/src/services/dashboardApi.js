import axios from 'axios';

const API_URL = 'http://localhost:5000/dashboard';

export const getDashboardSummary = async (filters = { viewType: 'Practice', location: 'All' }) => {
  try {
    const response = await axios.get(`${API_URL}/summary`, {
      params: filters
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    throw error;
  }
};
