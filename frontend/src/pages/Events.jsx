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
      fetchEvents(); // Refresh to update attendee count
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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Upcoming Events</h1>
        {isAuthenticated && (
          <Link
            to="/create-event"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Event
          </Link>
        )}
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No events found.</p>
          {isAuthenticated && (
            <Link
              to="/create-event"
              className="text-blue-600 hover:text-blue-700"
            >
              Create the first event!
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(event => (
            <div key={event.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                <div className="space-y-2 text-gray-600">
                  <p className="flex items-center">
                    <span className="font-medium mr-2">Date:</span>
                    {formatDate(event.date_time)}
                  </p>
                  <p className="flex items-center">
                    <span className="font-medium mr-2">Time:</span>
                    {formatTime(event.date_time)}
                  </p>
                  <p className="flex items-center">
                    <span className="font-medium mr-2">Venue:</span>
                    {event.venue_name}
                  </p>
                  <p className="flex items-center">
                    <span className="font-medium mr-2">Attendees:</span>
                    {event.confirmed_attendees}
                  </p>
                  {event.status !== 'published' && (
                    <p className="text-sm text-orange-600 font-medium">
                      Status: {event.status}
                    </p>
                  )}
                </div>
                
                <div className="mt-4 space-y-2">
                  <Link
                    to={`/events/${event.id}`}
                    className="block w-full text-center bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    View Details
                  </Link>
                  {isAuthenticated && event.status === 'published' && (
                    <button 
                      onClick={() => handleRsvp(event.id)}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      RSVP
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isAuthenticated && events.length > 0 && (
        <div className="mt-8 bg-blue-50 rounded-lg p-6 text-center">
          <p className="text-gray-700 mb-4">
            Sign in to create events and RSVP to upcoming events!
          </p>
          <Link
            to="/login"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Login to Continue
          </Link>
        </div>
      )}
    </div>
  );
}