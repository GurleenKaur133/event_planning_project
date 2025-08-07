import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home-wrapper">
      <div className="home-container">
        {/* Hero Section */}
        <div className="hero-section">
          <h1 className="home-title">Welcome to EventPlanner</h1>

          <p className="hero-subtitle">
            Discover, Create, and Manage Amazing Events
          </p>

          {isAuthenticated ? (
            <div className="hero-actions">
              <a href="/dashboard" className="btn btn-primary mt-3" style={{ backgroundColor: '#B29079', borderColor: '#B29079' }}>
                Go to Dashboard
              </a>
            </div>
          ) : (
            <div className="hero-actions">
              <Link to="/register" className="btn btn-theme">
                Get Started
              </Link>
              <Link to="/events" className="btn btn-secondary">
                Browse Events
              </Link>
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="features-section">
          <div className="feature-card">
            <div className="icon">📅</div>
            <h3>Create Events</h3>
            <p>
              Easily create and manage your events with our intuitive platform.
            </p>
          </div>

          <div className="feature-card">
            <div className="icon">🎟️</div>
            <h3>RSVP System</h3>
            <p>
              Track attendees and manage RSVPs with our built-in system.
            </p>
          </div>

          <div className="feature-card">
            <div className="icon">📍</div>
            <h3>Venue Management</h3>
            <p>
              Choose from various venues or add your own custom locations.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        {!isAuthenticated && (
          <div className="cta-section">
            <h2>Ready to Start Planning?</h2>
            <p>Join thousands of event organizers who trust EventPlanner</p>
            <Link to="/register" className="btn btn-theme">
              Sign Up Free
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
