import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import venueService from '../services/venueService';
import toast from 'react-hot-toast';

export default function Venues() {
  const { user, isAuthenticated } = useAuth();
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === 'admin';
  const canCreateVenue = user?.role === 'admin' || user?.role === 'organizer';

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    try {
      const response = await venueService.getAllVenues();
      setVenues(response.data);
    } catch (error) {
      toast.error('Failed to load venues');
      console.error('Fetch venues error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (venueId, venueName) => {
    if (window.confirm(`Are you sure you want to delete "${venueName}"? This action cannot be undone.`)) {
      try {
        await venueService.deleteVenue(venueId);
        toast.success('Venue deleted successfully');
        fetchVenues(); // Refresh the list
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
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Venues</h1>
        {isAuthenticated && canCreateVenue && (
          <Link
            to="/create-venue"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add New Venue
          </Link>
        )}
      </div>

      {venues.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-600 mb-4">No venues found.</p>
          {canCreateVenue && (
            <Link
              to="/create-venue"
              className="text-blue-600 hover:text-blue-700"
            >
              Add the first venue!
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {venues.map(venue => (
            <div key={venue.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-3">{venue.name}</h3>
                
                <div className="space-y-2 text-gray-600 mb-4">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm">{venue.location}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="text-sm">Capacity: {venue.capacity} people</span>
                  </div>
                  
                  {venue.active_events > 0 && (
                    <div className="flex items-center text-green-600">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm">{venue.active_events} active events</span>
                    </div>
                  )}
                </div>

                {isAdmin && (
                  <div className="flex gap-2 mt-4 pt-4 border-t">
                    <Link
                      to={`/edit-venue/${venue.id}`}
                      className="flex-1 bg-blue-600 text-white text-center py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(venue.id, venue.name)}
                      disabled={venue.active_events > 0}
                      className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                      title={venue.active_events > 0 ? 'Cannot delete venue with active events' : ''}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!isAuthenticated && (
        <div className="mt-8 bg-blue-50 rounded-lg p-6 text-center">
          <p className="text-gray-700 mb-4">
            Sign in as an admin or organizer to manage venues
          </p>
          <Link
            to="/login"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Login
          </Link>
        </div>
      )}
    </div>
  );
}