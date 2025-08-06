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
      // Fetch event details
      const eventResponse = await eventService.getEventById(id);
      setEvent(eventResponse.data);

      // Fetch attendees and stats
      const attendeesResponse = await attendeeService.getEventAttendees(id);
      setAttendees(attendeesResponse.data.attendees);
      setStats(attendeesResponse.data.stats);

      // Check user's RSVP status if authenticated
      if (isAuthenticated) {
        const rsvpResponse = await attendeeService.getRsvpStatus(id);
        setUserRsvp(rsvpResponse.data);
      }
    } catch (error) {
      toast.error('Failed to load event details');
      console.error('Fetch event details error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRsvp = async (status) => {
    try {
      await attendeeService.rsvpToEvent(id, status);
      toast.success(`RSVP ${status === 'yes' ? 'confirmed' : 'updated'}!`);
      fetchEventDetails(); // Refresh data
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to RSVP');
    }
  };

  const handleCancelRsvp = async () => {
    if (window.confirm('Are you sure you want to cancel your RSVP?')) {
      try {
        await attendeeService.cancelRsvp(id);
        toast.success('RSVP cancelled');
        fetchEventDetails(); // Refresh data
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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <p className="text-gray-600 mb-4">Event not found</p>
        <Link to="/events" className="text-blue-600 hover:text-blue-700">
          Back to events
        </Link>
      </div>
    );
  }

  const isCreator = user?.id === event.created_by;
  const isPastEvent = new Date(event.date_time) < new Date();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Event Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
              <p className="text-blue-100">Hosted by {event.creator_username}</p>
            </div>
            {event.status !== 'published' && (
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                {event.status.toUpperCase()}
              </span>
            )}
          </div>
        </div>

        {/* Event Info */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Event Details</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-gray-600 text-sm">Date & Time</p>
                  <p className="font-medium">{formatDateTime(event.date_time)}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Venue</p>
                  <p className="font-medium">{event.venue_name}</p>
                  <p className="text-gray-600">{event.venue_location}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Capacity</p>
                  <p className="font-medium">{event.venue_capacity} people</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Attendance</h3>
              {stats && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Confirmed:</span>
                    <span className="font-medium text-green-600">{stats.confirmed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Maybe:</span>
                    <span className="font-medium text-yellow-600">{stats.maybe}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Can't Go:</span>
                    <span className="font-medium text-red-600">{stats.declined}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Waitlisted:</span>
                    <span className="font-medium text-purple-600">{stats.waitlisted}</span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between font-semibold">
                    <span>Total Responses:</span>
                    <span>{stats.total_responses}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Description</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
          </div>

          {/* Action Buttons */}
          <div className="border-t pt-6">
            {!isAuthenticated ? (
              <div className="text-center">
                <p className="text-gray-600 mb-4">Sign in to RSVP to this event</p>
                <Link
                  to="/login"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Login to RSVP
                </Link>
              </div>
            ) : isPastEvent ? (
              <p className="text-center text-gray-600">This event has already ended</p>
            ) : event.status !== 'published' ? (
              <p className="text-center text-gray-600">This event is {event.status}</p>
            ) : isCreator ? (
              <div className="flex gap-4 justify-center">
                <Link
                  to={`/edit-event/${event.id}`}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Edit Event
                </Link>
                <Link
                  to="/my-events"
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Manage Events
                </Link>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                {userRsvp?.hasRsvpd ? (
                  <>
                    <p className="text-gray-600">
                      Your RSVP: <span className="font-medium">{userRsvp.rsvpStatus?.toUpperCase()}</span>
                    </p>
                    <div className="flex gap-2">
                      {userRsvp.rsvpStatus !== 'yes' && (
                        <button
                          onClick={() => handleRsvp('yes')}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Change to Yes
                        </button>
                      )}
                      {userRsvp.rsvpStatus !== 'maybe' && (
                        <button
                          onClick={() => handleRsvp('maybe')}
                          className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
                        >
                          Change to Maybe
                        </button>
                      )}
                      {userRsvp.rsvpStatus !== 'no' && (
                        <button
                          onClick={() => handleRsvp('no')}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Change to No
                        </button>
                      )}
                      <button
                        onClick={handleCancelRsvp}
                        className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        Cancel RSVP
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleRsvp('yes')}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Yes, I'll attend
                    </button>
                    <button
                      onClick={() => handleRsvp('maybe')}
                      className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
                    >
                      Maybe
                    </button>
                    <button
                      onClick={() => handleRsvp('no')}
                      className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Can't go
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Back to Events Link */}
      <div className="mt-6 text-center">
        <Link to="/events" className="text-blue-600 hover:text-blue-700">
          ← Back to all events
        </Link>
      </div>
    </div>
  );
}