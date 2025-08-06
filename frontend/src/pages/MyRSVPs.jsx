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
      console.error('Fetch RSVPs error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRsvp = async (eventId, eventTitle) => {
    if (window.confirm(`Are you sure you want to cancel your RSVP for "${eventTitle}"?`)) {
      try {
        await attendeeService.cancelRsvp(eventId);
        toast.success('RSVP cancelled successfully');
        fetchMyRsvps(); // Refresh the list
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to cancel RSVP');
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

  const getRsvpStatusColor = (status) => {
    const colors = {
      yes: 'bg-green-100 text-green-800',
      no: 'bg-red-100 text-red-800',
      maybe: 'bg-yellow-100 text-yellow-800',
      waitlist: 'bg-purple-100 text-purple-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const currentRsvps = activeTab === 'upcoming' ? rsvps.upcoming : rsvps.past;

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">My RSVPs</h1>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'upcoming'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Upcoming Events ({rsvps.upcoming.length})
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'past'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Past Events ({rsvps.past.length})
          </button>
        </nav>
      </div>

      {currentRsvps.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-600 mb-4">
            {activeTab === 'upcoming' 
              ? "You haven't RSVP'd to any upcoming events yet."
              : "You haven't attended any events yet."}
          </p>
          {activeTab === 'upcoming' && (
            <Link
              to="/events"
              className="text-blue-600 hover:text-blue-700"
            >
              Browse upcoming events
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {currentRsvps.map((rsvp) => (
            <div key={rsvp.event_id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold">{rsvp.title}</h3>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRsvpStatusColor(rsvp.rsvp_status)}`}>
                    {rsvp.rsvp_status.toUpperCase()}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4 line-clamp-2">{rsvp.description}</p>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <p>
                    <span className="font-medium">Date:</span> {formatDate(rsvp.date_time)}
                  </p>
                  <p>
                    <span className="font-medium">Venue:</span> {rsvp.venue_name}
                  </p>
                  <p>
                    <span className="font-medium">Location:</span> {rsvp.venue_location}
                  </p>
                </div>

                <div className="mt-4 flex gap-2">
                  <Link
                    to={`/events/${rsvp.event_id}`}
                    className="flex-1 text-center bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    View Details
                  </Link>
                  {activeTab === 'upcoming' && rsvp.event_status === 'published' && (
                    <button
                      onClick={() => handleCancelRsvp(rsvp.event_id, rsvp.title)}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Cancel RSVP
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}