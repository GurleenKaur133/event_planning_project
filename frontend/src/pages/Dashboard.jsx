import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import eventService from '../services/eventService';
import attendeeService from '../services/attendeeService';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    myEvents: 0,
    upcomingRsvps: 0,
    totalRsvps: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch my events
      const eventsResponse = await eventService.getMyEvents();
      const myEvents = eventsResponse.data.length;

      // Fetch my RSVPs
      const rsvpsResponse = await attendeeService.getMyRsvps();
      const upcomingRsvps = rsvpsResponse.data.upcoming.length;
      const totalRsvps = rsvpsResponse.data.total;

      setStats({
        myEvents,
        upcomingRsvps,
        totalRsvps
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
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
      <h1 className="text-3xl font-bold mb-8">Welcome back, {user?.username}!</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">My Events</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.myEvents}</p>
          <p className="text-sm text-gray-500">Events created</p>
          <Link to="/my-events" className="text-sm text-blue-600 hover:text-blue-700 mt-2 inline-block">
            View all →
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Attending</h3>
          <p className="text-3xl font-bold text-green-600">{stats.upcomingRsvps}</p>
          <p className="text-sm text-gray-500">Upcoming events</p>
          <Link to="/my-rsvps" className="text-sm text-green-600 hover:text-green-700 mt-2 inline-block">
            View RSVPs →
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Total RSVPs</h3>
          <p className="text-3xl font-bold text-purple-600">{stats.totalRsvps}</p>
          <p className="text-sm text-gray-500">All time</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              to="/create-event"
              className="block w-full bg-blue-600 text-white text-center px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create New Event
            </Link>
            <Link
              to="/events"
              className="block w-full bg-gray-200 text-gray-700 text-center px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Browse Events
            </Link>
            <Link
              to="/my-events"
              className="block w-full bg-gray-200 text-gray-700 text-center px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Manage My Events
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Account Information</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Username</p>
              <p className="font-medium">{user?.username}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Role</p>
              <p className="font-medium capitalize">{user?.role}</p>
            </div>
            <Link
              to="/profile"
              className="text-sm text-blue-600 hover:text-blue-700 inline-block mt-2"
            >
              Edit Profile →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}