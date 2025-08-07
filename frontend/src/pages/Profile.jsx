import { useAuth } from '../hooks/useAuth';
import { useState } from 'react';

export default function Profile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    alert('Profile updated!');
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete your account?')) {
      alert('Account deleted!');
    }
  };

  return (
    <div className="container py-5" style={{ backgroundColor: 'var(--color-bg)' }}>
      <h1 className="mb-4">My Profile</h1>

      <div className="card mb-4 shadow-sm">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Profile Information</h5>
          <button className="btn btn-sm btn-outline-primary" onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
        </div>
        <div className="card-body">
          {isEditing ? (
            <>
              <div className="mb-3">
                <label className="form-label">Username</label>
                <input
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
              <button className="btn btn-success" onClick={handleSave}>
                Save Changes
              </button>
            </>
          ) : (
            <>
              <p><strong>Username:</strong> {user?.username}</p>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Role:</strong> {user?.role}</p>
              <p><strong>Member Since:</strong> {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</p>
            </>
          )}
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-header">
          <h5 className="mb-0">Account Settings</h5>
        </div>
        <div className="card-body d-flex flex-column gap-3">
          <button className="btn btn-outline-secondary" onClick={() => alert('Change Password')}>
            Change Password
          </button>
          <button className="btn btn-outline-secondary" onClick={() => alert('Email Preferences')}>
            Email Preferences
          </button>
          <button className="btn btn-outline-danger" onClick={handleDelete}>
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
