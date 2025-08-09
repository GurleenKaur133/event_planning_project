import api from './api';

const userService = {
  // Get user profile
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await api.put('/users/update-profile', profileData);
    return response.data;
  },

  // Update password
  updatePassword: async (passwordData) => {
    const response = await api.put('/users/update-password', passwordData);
    return response.data;
  }
};

export default userService;