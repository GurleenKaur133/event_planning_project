import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import eventService from '../services/eventService';
import attendeeService from '../services/attendeeService';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ myEvents: 0, upcomingRsvps: 0, totalRsvps: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const eventsResponse = await eventService.getMyEvents();
      const rsvpsResponse = await attendeeService.getMyRsvps();
      setStats({
        myEvents: eventsResponse.data.length,
        upcomingRsvps: rsvpsResponse.data.upcoming.length,
        totalRsvps: rsvpsResponse.data.total
      });
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
        <div className="spinner-border text-secondary" role="status" />
      </div>
    );
  }

  return (
    <div className="py-5" style={{ backgroundColor: '#EFE7DA', minHeight: '100vh' }}>
      <div className="container">
        {/* ONLY THIS LINE CHANGED */}
        <h1 className="text-center fw-bold mb-4 headline-script">
          Welcome back, {user?.username}!
        </h1>

        {/* Stats Cards */}
        <div className="row g-4 mb-5">
          <div className="col-md-4">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <h5 className="card-title text-secondary">My Events</h5>
                <h2 className="text-theme fw-bold">{stats.myEvents}</h2>
                <p className="text-muted">Events created</p>
                <Link to="/my-events" className="btn btn-link p-0 text-theme">View all →</Link>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <h5 className="card-title text-secondary">Attending</h5>
                <h2 className="text-theme fw-bold">{stats.upcomingRsvps}</h2>
                <p className="text-muted">Upcoming events</p>
                <Link to="/my-rsvps" className="btn btn-link p-0 text-theme">View RSVPs →</Link>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <h5 className="card-title text-secondary">Total RSVPs</h5>
                <h2 className="text-theme fw-bold">{stats.totalRsvps}</h2>
                <p className="text-muted">All time</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions & Profile */}
        <div className="row g-4">
          <div className="col-md-6">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <h4 className="card-title mb-4">Quick Actions</h4>
                <div className="d-grid gap-3">
                  <Link to="/create-event" className="btn text-white" style={{ backgroundColor: '#B29079' }}>
                    Create New Event
                  </Link>
                  <Link to="/events" className="btn btn-outline-secondary">Browse Events</Link>
                  <Link to="/my-events" className="btn btn-outline-secondary">Manage My Events</Link>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <h4 className="card-title mb-4">Account Information</h4>
                <p className="mb-1 text-muted">Username</p>
                <p className="fw-semibold">{user?.username}</p>

                <p className="mb-1 text-muted mt-3">Email</p>
                <p className="fw-semibold">{user?.email}</p>

                <p className="mb-1 text-muted mt-3">Role</p>
                <p className="fw-semibold text-capitalize">{user?.role}</p>

                <Link to="/profile" className="btn btn-link p-0 text-theme mt-2">Edit Profile →</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
