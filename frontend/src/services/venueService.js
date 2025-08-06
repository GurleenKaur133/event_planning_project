import api from './api';

const venueService = {
  // Get all venues
  getAllVenues: async () => {
    const response = await api.get('/venues');
    return response.data;
  },

  // Get single venue
  getVenueById: async (id) => {
    const response = await api.get(`/venues/${id}`);
    return response.data;
  },

  // Create venue (admin only)
  createVenue: async (venueData) => {
    const response = await api.post('/venues', venueData);
    return response.data;
  },

  // Update venue (admin only)
  updateVenue: async (id, venueData) => {
    const response = await api.put(`/venues/${id}`, venueData);
    return response.data;
  },

  // Delete venue (admin only)
  deleteVenue: async (id) => {
    const response = await api.delete(`/venues/${id}`);
    return response.data;
  }
};

export default venueService;