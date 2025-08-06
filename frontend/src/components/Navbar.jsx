import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold hover:text-gray-300">
          EventPlanner
        </Link>
        
        <div className="flex items-center space-x-6">
          <Link to="/" className="hover:text-gray-300">
            Home
          </Link>
          <Link to="/events" className="hover:text-gray-300">
            Events
          </Link>
          
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="hover:text-gray-300">
                Dashboard
              </Link>
              <Link to="/my-events" className="hover:text-gray-300">
                My Events
              </Link>
              <Link to="/my-rsvps" className="hover:text-gray-300">
                My RSVPs
              </Link>
              <Link to="/profile" className="hover:text-gray-300">
                Profile
              </Link>
              <span className="text-gray-300">
                Hi, {user.username}!
              </span>
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className="hover:text-gray-300"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}