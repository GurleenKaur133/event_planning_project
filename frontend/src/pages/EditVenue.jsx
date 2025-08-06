import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import venueService from '../services/venueService';
import toast from 'react-hot-toast';

export default function EditVenue() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [venue, setVenue] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    capacity: ''
  });
  const [errors, setErrors] = useState({});

  // Check if user is admin
  const isAdmin = user?.role === 'admin';
  
  if (!isAdmin) {
    navigate('/venues');
    return null;
  }

  useEffect(() => {
    fetchVenue();
  }, [id]);

  const fetchVenue = async () => {
    try {
      const response = await venueService.getVenueById(id);
      const venueData = response.data;
      setVenue(venueData);
      setFormData({
        name: venueData.name,
        location: venueData.location,
        capacity: venueData.capacity.toString()
      });
    } catch (error) {
      toast.error('Failed to load venue details');
      navigate('/venues');
    } finally {
      setLoading(false);
    }
  };

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

    setSaving(true);

    try {
      const venueData = {
        name: formData.name.trim(),
        location: formData.location.trim(),
        capacity: parseInt(formData.capacity)
      };

      await venueService.updateVenue(id, venueData);
      toast.success('Venue updated successfully!');
      navigate('/venues');
    } catch (error) {
      const errorMessage = error.response?.data?.errors?.[0]?.message || 
                          error.response?.data?.message || 
                          'Failed to update venue';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (venue?.active_events > 0) {
      toast.error('Cannot delete venue with active events');
      return;
    }

    if (window.confirm(`Are you sure you want to delete "${venue.name}"? This action cannot be undone.`)) {
      try {
        await venueService.deleteVenue(id);
        toast.success('Venue deleted successfully');
        navigate('/venues');
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to delete venue';
        toast.error(errorMessage);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Edit Venue</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        {venue?.active_events > 0 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  This venue has {venue.active_events} active event{venue.active_events > 1 ? 's' : ''}. 
                  Updates will affect all associated events.
                </p>
              </div>
            </div>
          </div>
        )}

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
            {venue?.active_events > 0 && (
              <p className="mt-1 text-sm text-yellow-600">
                Warning: Reducing capacity may affect existing events
              </p>
            )}
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/venues')}
              className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={venue?.active_events > 0}
              className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
              title={venue?.active_events > 0 ? 'Cannot delete venue with active events' : 'Delete this venue'}
            >
              Delete
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}