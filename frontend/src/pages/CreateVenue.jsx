import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import venueService from '../services/venueService';
import toast from 'react-hot-toast';

export default function CreateVenue() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    capacity: ''
  });
  const [errors, setErrors] = useState({});

  // Check if user has permission
  const canCreateVenue = user?.role === 'admin' || user?.role === 'organizer';
  
  if (!canCreateVenue) {
    navigate('/venues');
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (formData.location.length < 5) {
      newErrors.location = 'Location must be at least 5 characters';
    }

    const capacity = parseInt(formData.capacity);
    if (isNaN(capacity) || capacity < 1) {
      newErrors.capacity = 'Capacity must be at least 1';
    } else if (capacity > 100000) {
      newErrors.capacity = 'Capacity cannot exceed 100,000';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      const venueData = {
        name: formData.name.trim(),
        location: formData.location.trim(),
        capacity: parseInt(formData.capacity)
      };

      await venueService.createVenue(venueData);
      toast.success('Venue created successfully!');
      navigate('/venues');
    } catch (error) {
      const errorMessage = error.response?.data?.errors?.[0]?.message || 
                          error.response?.data?.message || 
                          'Failed to create venue';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Add New Venue</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Venue Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Grand Conference Hall"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Give your venue a descriptive name
            </p>
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Location *
            </label>
            <textarea
              id="location"
              name="location"
              required
              rows={3}
              value={formData.location}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.location ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., 123 Main Street, Downtown, City, State 12345"
            />
            {errors.location && (
              <p className="mt-1 text-sm text-red-600">{errors.location}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Include the full address or detailed location description
            </p>
          </div>

          <div>
            <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-1">
              Capacity *
            </label>
            <input
              type="number"
              id="capacity"
              name="capacity"
              required
              min="1"
              max="100000"
              value={formData.capacity}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.capacity ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., 500"
            />
            {errors.capacity && (
              <p className="mt-1 text-sm text-red-600">{errors.capacity}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Maximum number of people the venue can accommodate
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Tips for adding venues:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Use clear, recognizable venue names</li>
              <li>• Include complete address for easy navigation</li>
              <li>• Set realistic capacity limits for safety</li>
              <li>• Consider both seated and standing capacity</li>
            </ul>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Venue'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/venues')}
              className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}