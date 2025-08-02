import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="text-center py-16">
        <h1 className="text-5xl font-bold text-gray-800 mb-4">
          Welcome to EventPlanner
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Discover, Create, and Manage Amazing Events
        </p>
        
        {!isAuthenticated ? (
          <div className="space-x-4">
            <Link
              to="/register"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Get Started
            </Link>
            <Link
              to="/events"
              className="inline-block bg-gray-200 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Browse Events
            </Link>
          </div>
        ) : (
          <div className="space-x-4">
            <Link
              to="/create-event"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Event
            </Link>
            <Link
              to="/dashboard"
              className="inline-block bg-gray-200 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-300 transition-colors"
            >
              My Dashboard
            </Link>
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-16">
        <div className="text-center">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📅</span>
          </div>
          <h3 className="text-xl font-semibold mb-2">Create Events</h3>
          <p className="text-gray-600">
            Easily create and manage your events with our intuitive platform
          </p>
        </div>
        
        <div className="text-center">
          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🎟️</span>
          </div>
          <h3 className="text-xl font-semibold mb-2">RSVP System</h3>
          <p className="text-gray-600">
            Track attendees and manage RSVPs with our built-in system
          </p>
        </div>
        
        <div className="text-center">
          <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📍</span>
          </div>
          <h3 className="text-xl font-semibold mb-2">Venue Management</h3>
          <p className="text-gray-600">
            Choose from various venues or add your own custom locations
          </p>
        </div>
      </div>

      {/* CTA Section */}
      {!isAuthenticated && (
        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-semibold mb-4">
            Ready to Start Planning?
          </h2>
          <p className="text-gray-600 mb-6">
            Join thousands of event organizers who trust EventPlanner
          </p>
          <Link
            to="/register"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign Up Free
          </Link>
        </div>
      )}
    </div>
  );
}