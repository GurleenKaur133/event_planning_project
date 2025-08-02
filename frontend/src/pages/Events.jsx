import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';

export default function Events() {
  const { isAuthenticated } = useAuth();

  // Dummy events data for now
  const events = [
    {
      id: 1,
      title: 'Annual Tech Conference 2025',
      date: '2025-03-15',
      time: '09:00 AM',
      venue: 'Tech Innovation Center',
      attendees: 45
    },
    {
      id: 2,
      title: 'Summer Music Festival',
      date: '2025-07-20',
      time: '04:00 PM',
      venue: 'Outdoor Amphitheater',
      attendees: 128
    },
    {
      id: 3,
      title: 'Project Management Workshop',
      date: '2025-02-10',
      time: '02:00 PM',
      venue: 'Small Meeting Room A',
      attendees: 12
    }
  ];

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map(event => (
          <div key={event.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
              <div className="space-y-2 text-gray-600">
                <p className="flex items-center">
                  <span className="font-medium mr-2">Date:</span>
                  {event.date}
                </p>
                <p className="flex items-center">
                  <span className="font-medium mr-2">Time:</span>
                  {event.time}
                </p>
                <p className="flex items-center">
                  <span className="font-medium mr-2">Venue:</span>
                  {event.venue}
                </p>
                <p className="flex items-center">
                  <span className="font-medium mr-2">Attendees:</span>
                  {event.attendees}
                </p>
              </div>
              
              <div className="mt-4 space-y-2">
                <Link
                  to={`/events/${event.id}`}
                  className="block w-full text-center bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  View Details
                </Link>
                {isAuthenticated && (
                  <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    RSVP
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {!isAuthenticated && (
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