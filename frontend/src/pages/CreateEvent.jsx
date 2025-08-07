import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import eventService from '../services/eventService';
import venueService from '../services/venueService';
import toast from 'react-hot-toast';

export default function CreateEvent() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    venue_id: '',
    status: 'published'
  });

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
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dateTime = `${formData.date}T${formData.time}:00`;

      const eventData = {
        title: formData.title,
        description: formData.description,
        date_time: dateTime,
        venue_id: parseInt(formData.venue_id),
        status: formData.status
      };

      await eventService.createEvent(eventData);
      toast.success('Event created successfully!');
      navigate('/events');
    } catch (error) {
      const errorMessage = error.response?.data?.errors?.[0]?.message ||
        error.response?.data?.message ||
        'Failed to create event';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="container py-5" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="mx-auto shadow p-5 rounded" style={{ backgroundColor: 'white', maxWidth: '650px', borderTop: '5px solid var(--color-primary)' }}>
        <div className="d-flex align-items-center mb-4">
          <i className="bi bi-calendar2-event-fill fs-3 me-2 text-primary"></i>
          <h2 className="fw-bold mb-0">Create New Event</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="title" className="form-label">Event Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              required
              className="form-control"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter event title"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="description" className="form-label">Description *</label>
            <textarea
              id="description"
              name="description"
              rows="4"
              required
              className="form-control"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your event"
            ></textarea>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="date" className="form-label">Date *</label>
              <input
                type="date"
                id="date"
                name="date"
                required
                className="form-control"
                value={formData.date}
                onChange={handleChange}
                min={minDate}
              />
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="time" className="form-label">Time *</label>
              <input
                type="time"
                id="time"
                name="time"
                required
                className="form-control"
                value={formData.time}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="venue_id" className="form-label">Venue *</label>
            <select
              id="venue_id"
              name="venue_id"
              className="form-select"
              required
              value={formData.venue_id}
              onChange={handleChange}
            >
              <option value="">Select a venue</option>
              {venues.map(venue => (
                <option key={venue.id} value={venue.id}>
                  {venue.name} (Capacity: {venue.capacity})
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="status" className="form-label">Status</label>
            <select
              id="status"
              name="status"
              className="form-select"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          <div className="d-flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="btn flex-fill"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'white',
                border: 'none'
              }}
            >
              {loading ? 'Creating...' : 'Create Event'}
            </button>

            <button
              type="button"
              onClick={() => navigate('/events')}
              className="btn flex-fill btn-outline-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
