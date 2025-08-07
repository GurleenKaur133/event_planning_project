import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import attendeeService from '../services/attendeeService';
import toast from 'react-hot-toast';

export default function MyRSVPs() {
  const [rsvps, setRsvps] = useState({ upcoming: [], past: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    fetchMyRsvps();
  }, []);

  const fetchMyRsvps = async () => {
    try {
      const response = await attendeeService.getMyRsvps();
      setRsvps(response.data);
    } catch (error) {
      toast.error('Failed to load your RSVPs');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRsvp = async (eventId, eventTitle) => {
    if (window.confirm(`Are you sure you want to cancel your RSVP for "${eventTitle}"?`)) {
      try {
        await attendeeService.cancelRsvp(eventId);
        toast.success('RSVP cancelled successfully');
        fetchMyRsvps();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to cancel RSVP');
      }
    }
  };

  const formatDate = (dateTime) => {
    return new Date(dateTime).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const badgeClass = (status) => {
    const map = {
      yes: 'bg-success-subtle text-success',
      no: 'bg-danger-subtle text-danger',
      maybe: 'bg-warning-subtle text-warning',
      waitlist: 'bg-secondary-subtle text-secondary',
    };
    return `badge rounded-pill px-3 py-2 fw-medium ${map[status] || 'bg-light text-dark'}`;
  };

  const currentRsvps = activeTab === 'upcoming' ? rsvps.upcoming : rsvps.past;

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  return (
    <div className="container py-5" style={{ backgroundColor: 'var(--color-bg)' }}>
      <h2 className="mb-4 fw-bold">My RSVPs</h2>

      {/* Nav Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming Events ({rsvps.upcoming.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'past' ? 'active' : ''}`}
            onClick={() => setActiveTab('past')}
          >
            Past Events ({rsvps.past.length})
          </button>
        </li>
      </ul>

      {/* No RSVPs */}
      {currentRsvps.length === 0 ? (
        <div className="card p-5 text-center">
          <p className="text-muted mb-3">
            {activeTab === 'upcoming'
              ? "You haven't RSVP'd to any upcoming events yet."
              : "You haven't attended any events yet."}
          </p>
          {activeTab === 'upcoming' && (
            <Link
              to="/events"
              className="btn"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'white',
                border: 'none',
              }}
            >
              Browse upcoming events
            </Link>

          )}
        </div>
      ) : (
        <div className="row g-4">
          {currentRsvps.map((rsvp) => (
            <div key={rsvp.event_id} className="col-md-6">
              <div className="card shadow-sm h-100">
                <div className="card-body d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="card-title">{rsvp.title}</h5>
                    <span className={badgeClass(rsvp.rsvp_status)}>
                      {rsvp.rsvp_status.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-muted small mb-3">{rsvp.description}</p>

                  <ul className="list-unstyled mb-3">
                    <li><strong>Date:</strong> {formatDate(rsvp.date_time)}</li>
                    <li><strong>Venue:</strong> {rsvp.venue_name}</li>
                    <li><strong>Location:</strong> {rsvp.venue_location}</li>
                  </ul>

                  <div className="mt-auto d-flex gap-2">
                    <Link to={`/events/${rsvp.event_id}`} className="btn btn-outline-secondary w-50">
                      View Details
                    </Link>
                    {activeTab === 'upcoming' && rsvp.event_status === 'published' && (
                      <button
                        onClick={() => handleCancelRsvp(rsvp.event_id, rsvp.title)}
                        className="btn btn-danger w-50"
                      >
                        Cancel RSVP
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
