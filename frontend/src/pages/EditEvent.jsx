import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import eventService from '../services/eventService';
import toast from 'react-hot-toast';

export default function MyEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    try {
      const response = await eventService.getMyEvents();
      setEvents(response.data);
    } catch (error) {
      toast.error('Failed to load your events');
      console.error('Fetch my events error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (eventId, eventTitle) => {
    if (window.confirm(`Are you sure you want to cancel "${eventTitle}"?`)) {
      try {
        await eventService.deleteEvent(eventId);
        toast.success('Event cancelled successfully');
        fetchMyEvents(); // Refresh the list
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to cancel event');
      }
    }
  };

  const formatDate = (dateTime) => {
    return new Date(dateTime).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      published: 'bg-success-subtle text-success fw-semibold px-3 py-1 rounded-pill',
      draft: 'bg-secondary-subtle text-secondary fw-semibold px-3 py-1 rounded-pill',
      cancelled: 'bg-danger-subtle text-danger fw-semibold px-3 py-1 rounded-pill',
      completed: 'bg-info-subtle text-info fw-semibold px-3 py-1 rounded-pill'
    };
    return colors[status] || 'bg-secondary-subtle text-secondary';
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5" style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh' }}>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="fw-bold">My Events</h1>
        <Link to="/create-event" className="btn btn-primary px-4">
          + Create New Event
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="bg-white shadow-sm rounded p-5 text-center">
          <p className="text-muted mb-3">You haven't created any events yet.</p>
          <Link to="/create-event" className="btn btn-outline-primary">
            Create your first event
          </Link>
        </div>
      ) : (
        <div className="table-responsive shadow-sm rounded">
          <table className="table table-bordered bg-white">
            <thead className="table-light">
              <tr>
                <th>Event</th>
                <th>Date & Time</th>
                <th>Venue</th>
                <th>Attendees</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id}>
                  <td>{event.title}</td>
                  <td>{formatDate(event.date_time)}</td>
                  <td>{event.venue_name}</td>
                  <td>{event.confirmed_attendees}</td>
                  <td>
                    <span className={getStatusColor(event.status)}>
                      {event.status}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <Link to={`/events/${event.id}`} className="btn btn-sm btn-outline-secondary">
                        View
                      </Link>
                      <Link to={`/edit-event/${event.id}`} className="btn btn-sm btn-outline-primary">
                        Edit
                      </Link>
                      {event.status !== 'cancelled' && (
                        <button
                          onClick={() => handleDelete(event.id, event.title)}
                          className="btn btn-sm btn-outline-danger"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
