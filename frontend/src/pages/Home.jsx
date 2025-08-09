import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home-wrapper" style={{ backgroundColor: '#EFE7DA', minHeight: '100vh' }}>
      <div className="home-container">
        {/* Hero Section */}
        <div className="hero-section text-center py-5">
          <h1 className="home-title">Welcome to EventPlanner</h1>
          <p className="hero-subtitle">
            Discover, Create, and Manage Amazing Events
          </p>

          {isAuthenticated ? (
            <div className="hero-actions">
              <a
                href="/dashboard"
                className="btn text-white mt-3"
                style={{ backgroundColor: '#B29079', borderColor: '#B29079' }}
              >
                Go to Dashboard
              </a>
            </div>
          ) : (
            <div className="hero-actions d-flex justify-content-center gap-3 mt-4">
              <Link
                to="/register"
                className="btn text-white px-4 py-2"
                style={{
                  backgroundColor: '#B29079',
                  border: 'none',
                  fontWeight: '500',
                }}
              >
                Get Started
              </Link>
              <Link
                to="/events"
                className="btn btn-outline-secondary px-4 py-2"
                style={{
                  borderColor: '#B29079',
                  color: '#B29079',
                  fontWeight: '500',
                }}
              >
                Browse Events
              </Link>
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="features-section d-flex justify-content-center gap-4 my-5 flex-wrap">
          <div className="feature-card bg-white p-4 rounded shadow-sm text-center" style={{ width: '250px' }}>
            <div className="icon fs-2 mb-3">📅</div>
            <h3>Create Events</h3>
            <p>Easily create and manage your events with our intuitive platform.</p>
          </div>

          <div className="feature-card bg-white p-4 rounded shadow-sm text-center" style={{ width: '250px' }}>
            <div className="icon fs-2 mb-3">🎟️</div>
            <h3>RSVP System</h3>
            <p>Track attendees and manage RSVPs with our built-in system.</p>
          </div>

          <div className="feature-card bg-white p-4 rounded shadow-sm text-center" style={{ width: '250px' }}>
            <div className="icon fs-2 mb-3">📍</div>
            <h3>Venue Management</h3>
            <p>Choose from various venues or add your own custom locations.</p>
          </div>
        </div>

        {/* CTA Section */}
        {!isAuthenticated && (
          <div
            className="cta-section text-center py-5 mt-5"
            style={{
              backgroundColor: '#F6F5EC',
              borderTopLeftRadius: '0',
              borderTopRightRadius: '0',
              borderBottomLeftRadius: '0',
              borderBottomRightRadius: '0',
            }}
          >
            <h2>Ready to Start Planning?</h2>
            <p>Join thousands of event organizers who trust EventPlanner</p>
            <Link
              to="/register"
              className="btn text-white px-4 py-2 mt-3"
              style={{
                backgroundColor: '#B29079',
                border: 'none',
                fontWeight: '500',
              }}
            >
              Sign Up Free
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
