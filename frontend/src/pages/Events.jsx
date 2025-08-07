import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import eventService from '../services/eventService';
import attendeeService from '../services/attendeeService';
import toast from 'react-hot-toast';

export default function Events() {
  const { isAuthenticated } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await eventService.getAllEvents();
      setEvents(response.data);
    } catch (error) {
      toast.error('Failed to load events');
      console.error('Fetch events error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRsvp = async (eventId) => {
    try {
      await attendeeService.rsvpToEvent(eventId, 'yes');
      toast.success('RSVP successful!');
      fetchEvents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to RSVP');
    }
  };

  const formatDate = (dateTime) => {
    return new Date(dateTime).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateTime) => {
    return new Date(dateTime).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', paddingTop: '2rem' }}>
      <div className="container py-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="fw-bold">Upcoming Events</h1>
          {isAuthenticated && (
            <Link
              to="/create-event"
              className="btn"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'white',
                border: 'none'
              }}
            >
              Create Event
            </Link>

          )}
        </div>

        {events.length === 0 ? (
          <div className="text-center py-5">
            <p className="text-muted mb-3">No events found.</p>
            {isAuthenticated && (
              <Link
                to="/create-event"
                className="btn"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'white',
                  border: 'none'
                }}
              >
                Create the first event!
              </Link>
            )}
          </div>
        ) : (
          <div className="row g-4">
            {events.map(event => (
              <div key={event.id} className="col-sm-6 col-lg-4">
                <div className="card h-100 shadow-sm border-0">
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title fw-semibold">{event.title}</h5>
                    <ul className="list-unstyled text-muted mb-3">
                      <li><strong>Date:</strong> {formatDate(event.date_time)}</li>
                      <li><strong>Time:</strong> {formatTime(event.date_time)}</li>
                      <li><strong>Venue:</strong> {event.venue_name}</li>
                      <li><strong>Attendees:</strong> {event.confirmed_attendees}</li>
                      {event.status !== 'published' && (
                        <li className="text-warning"><strong>Status:</strong> {event.status}</li>
                      )}
                    </ul>
                    <div className="mt-auto">
                      <Link to={`/events/${event.id}`} className="btn btn-outline-secondary w-100 mb-2">
                        View Details
                      </Link>
                      {isAuthenticated && event.status === 'published' && (
                        <button
                          onClick={() => handleRsvp(event.id)}
                          className="btn w-100"
                          style={{
                            backgroundColor: 'var(--color-primary)',
                            color: 'white',
                            border: 'none'
                          }}
                        >
                          RSVP
                        </button>

                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isAuthenticated && events.length > 0 && (
          <div className="alert alert-info text-center mt-5">
            <p className="mb-3">Sign in to create events and RSVP to upcoming ones!</p>
            <Link to="/login" className="btn btn-primary">
              Login to Continue
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
