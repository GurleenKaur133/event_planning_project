import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <nav className="navbar navbar-expand-lg fixed-top" style={{ backgroundColor: '#B29079', zIndex: 1030 }}>
      <div className="container">
        <Link className="navbar-brand text-white fw-bold" to="/">
          EventPlanner
        </Link>

        <button
          className="navbar-toggler text-white"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
          <ul className="navbar-nav align-items-center gap-2">
            <li className="nav-item">
              <Link className="nav-link text-white" to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white" to="/events">Events</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white" to="/venues">Venues</Link>
            </li>

            {isAuthenticated ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link text-white" to="/dashboard">Dashboard</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link text-white" to="/my-events">My Events</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link text-white" to="/my-rsvps">My RSVPs</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link text-white" to="/profile">Profile</Link>
                </li>
                <li className="nav-item">
                  <span className="nav-link text-white small">Hi, {user.username}!</span>
                </li>
                <li className="nav-item">
                  <button
                    className="btn btn-sm btn-outline-light"
                    onClick={logout}
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link text-white" to="/login">Login</Link>
                </li>
                <li className="nav-item">
                  <Link className="btn btn-sm btn-light text-dark" to="/register">Register</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
