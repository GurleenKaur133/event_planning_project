import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import eventService from '../services/eventService';
import attendeeService from '../services/attendeeService';
import toast from 'react-hot-toast';

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [event, setEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [stats, setStats] = useState(null);
  const [userRsvp, setUserRsvp] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      const eventResponse = await eventService.getEventById(id);
      setEvent(eventResponse.data);

      const attendeesResponse = await attendeeService.getEventAttendees(id);
      setAttendees(attendeesResponse.data.attendees);
      setStats(attendeesResponse.data.stats);

      if (isAuthenticated) {
        const rsvpResponse = await attendeeService.getRsvpStatus(id);
        setUserRsvp(rsvpResponse.data);
      }
    } catch (error) {
      toast.error('Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const handleRsvp = async (status) => {
    try {
      await attendeeService.rsvpToEvent(id, status);
      toast.success(`RSVP ${status === 'yes' ? 'confirmed' : 'updated'}!`);
      fetchEventDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to RSVP');
    }
  };

  const handleCancelRsvp = async () => {
    if (window.confirm('Are you sure you want to cancel your RSVP?')) {
      try {
        await attendeeService.cancelRsvp(id);
        toast.success('RSVP cancelled');
        fetchEventDetails();
      } catch (error) {
        toast.error('Failed to cancel RSVP');
      }
    }
  };

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container text-center py-5">
        <p className="text-muted mb-3">Event not found</p>
        <Link to="/events" className="btn btn-outline-primary">
          Back to events
        </Link>
      </div>
    );
  }

  const isCreator = user?.id === event.created_by;
  const isPastEvent = new Date(event.date_time) < new Date();

  return (
    <div className="container my-5">
      <div className="card shadow">
        <div className="card-header text-white" style={{ background: 'var(--color-primary)' }}>
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h2 className="mb-1">{event.title}</h2>
              <small>Hosted by {event.creator_username}</small>
            </div>
            {event.status !== 'published' && (
              <span className="badge bg-light text-dark">{event.status.toUpperCase()}</span>
            )}
          </div>
        </div>

        <div className="card-body" style={{ backgroundColor: 'var(--color-bg)' }}>
          <div className="row mb-4">
            <div className="col-md-8">
              <h5 className="mb-3 text-dark">Event Details</h5>
              <p><strong>Date & Time:</strong> {formatDateTime(event.date_time)}</p>
              <p><strong>Venue:</strong> {event.venue_name}</p>
              <p><strong>Location:</strong> {event.venue_location}</p>
              <p><strong>Capacity:</strong> {event.venue_capacity} people</p>

              <div className="mt-4">
                <h5 className="mb-2 text-dark">Description</h5>
                <p className="text-muted">{event.description}</p>
              </div>
            </div>

            <div className="col-md-4">
              <h5 className="mb-3 text-dark">Attendance</h5>
              {stats && (
                <ul className="list-group small shadow-sm">
                  <li className="list-group-item d-flex justify-content-between align-items-center">
                    Confirmed <span className="text-success fw-bold">{stats.confirmed}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center">
                    Maybe <span className="text-warning fw-bold">{stats.maybe}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center">
                    Can't Go <span className="text-danger fw-bold">{stats.declined}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center">
                    Waitlisted <span className="text-secondary fw-bold">{stats.waitlisted}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center fw-bold">
                    Total Responses <span>{stats.total_responses}</span>
                  </li>
                </ul>
              )}
            </div>
          </div>

          <div className="border-top pt-4">
            {!isAuthenticated ? (
              <div className="text-center">
                <p className="text-muted mb-3">Sign in to RSVP</p>
                <Link to="/login" className="btn btn-primary">Login to RSVP</Link>
              </div>
            ) : isPastEvent ? (
              <p className="text-center text-muted">This event has already ended</p>
            ) : event.status !== 'published' ? (
              <p className="text-center text-muted">This event is {event.status}</p>
            ) : isCreator ? (
              <div className="text-center">
                <Link to={`/edit-event/${event.id}`} className="btn btn-primary me-2">Edit Event</Link>
                <Link to="/my-events" className="btn btn-outline-secondary">Manage Events</Link>
              </div>
            ) : (
              <div className="text-center">
                {userRsvp?.hasRsvpd ? (
                  <>
                    <p className="text-muted">Your RSVP: <strong>{userRsvp.rsvpStatus?.toUpperCase()}</strong></p>
                    <div className="d-flex justify-content-center flex-wrap gap-2">
                      {userRsvp.rsvpStatus !== 'yes' && (
                        <button onClick={() => handleRsvp('yes')} className="btn btn-success">Change to Yes</button>
                      )}
                      {userRsvp.rsvpStatus !== 'maybe' && (
                        <button onClick={() => handleRsvp('maybe')} className="btn btn-warning text-white">Change to Maybe</button>
                      )}
                      {userRsvp.rsvpStatus !== 'no' && (
                        <button onClick={() => handleRsvp('no')} className="btn btn-danger">Change to No</button>
                      )}
                      <button onClick={handleCancelRsvp} className="btn btn-secondary">Cancel RSVP</button>
                    </div>
                  </>
                ) : (
                  <div className="d-flex justify-content-center flex-wrap gap-2">
                    <button onClick={() => handleRsvp('yes')} className="btn btn-success">Yes, I'll attend</button>
                    <button onClick={() => handleRsvp('maybe')} className="btn btn-warning text-white">Maybe</button>
                    <button onClick={() => handleRsvp('no')} className="btn btn-danger">Can't go</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="text-center mt-4">
        <Link to="/events" className="btn btn-link">← Back to all events</Link>
      </div>
    </div>
  );
}
