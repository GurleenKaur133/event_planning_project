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
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  return (
    <div className="container py-5" style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Venues</h2>
        {isAuthenticated && canCreateVenue && (
          <Link
            to="/create-venue"
            className="btn"
            style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
          >
            Add New Venue
          </Link>
        )}
      </div>

      {venues.length === 0 ? (
        <div className="bg-white p-4 rounded shadow text-center">
          <p className="text-muted mb-3">No venues found.</p>
          {canCreateVenue && (
            <Link to="/create-venue" className="btn btn-link text-decoration-none">
              Add the first venue!
            </Link>
          )}
        </div>
      ) : (
        <div className="row g-4">
          {venues.map((venue) => (
            <div className="col-md-6 col-lg-4" key={venue.id}>
              <div className="card h-100 shadow-sm">
                <div className="card-body d-flex flex-column justify-content-between">
                  <div>
                    <h5 className="card-title fw-semibold">{venue.name}</h5>
                    <p className="card-text text-muted mb-2">
                      📍 {venue.location}
                    </p>
                    <p className="card-text text-muted mb-2">
                      👥 Capacity: {venue.capacity}
                    </p>
                    {venue.active_events > 0 && (
                      <p className="card-text text-success">
                        🗓️ {venue.active_events} active event{venue.active_events > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>

                  {isAdmin && (
                    <div className="d-flex gap-2 mt-4">
                      <Link
                        to={`/edit-venue/${venue.id}`}
                        className="btn btn-sm btn-primary w-100"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(venue.id, venue.name)}
                        className="btn btn-sm btn-danger w-100"
                        disabled={venue.active_events > 0}
                        title={venue.active_events > 0 ? 'Cannot delete venue with active events' : ''}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isAuthenticated && (
        <div className="mt-5 p-4 bg-light rounded text-center">
          <p className="text-muted mb-3">
            Sign in as an admin or organizer to manage venues
          </p>
          <Link
            to="/login"
            className="btn"
            style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
          >
            Login
          </Link>
        </div>
      )}
    </div>
  );
}
