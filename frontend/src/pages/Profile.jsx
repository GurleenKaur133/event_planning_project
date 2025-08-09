import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import userService from '../services/userService';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, setUser } = useAuth();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Profile form data (no 'name' now)
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
  });

  // Password form data
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await userService.updateProfile(profileData);
      const updatedUser = response.data.user;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      toast.success('Profile updated successfully!');
      setIsEditingProfile(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await userService.updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success('Password updated successfully!');
      setIsChangingPassword(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const cancelProfileEdit = () => {
    setIsEditingProfile(false);
    setProfileData({
      username: user?.username || '',
      email: user?.email || '',
    });
  };

  // Helper: avatar initials
  const initials =
    (user?.username?.slice(0, 2).toUpperCase()) || 'U';

  return (
    <div className="py-5" style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh' }}>
      <div className="container" style={{ maxWidth: 920 }}>
        {/* Header */}
        <div className="rounded shadow-sm mb-4">
          <div
            className="p-4 rounded-top text-white d-flex align-items-center justify-content-between"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            <div className="d-flex align-items-center gap-3">
              <div
                className="d-flex align-items-center justify-content-center rounded-circle"
                style={{
                  width: 56,
                  height: 56,
                  background: 'rgba(255,255,255,0.2)',
                  fontWeight: 700,
                  fontSize: 20,
                }}
              >
                {initials}
              </div>
              <div>
                <h2 className="m-0 fw-bold">My Profile</h2>
                <small className="opacity-75">{user?.email}</small>
              </div>
            </div>
            {!isEditingProfile && (
              <button
                className="btn btn-light btn-sm"
                onClick={() => setIsEditingProfile(true)}
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        <div className="row g-4">
          {/* Left: Profile info / form */}
          <div className="col-lg-7">
            <div className="card shadow-sm h-100">
              <div className="card-header bg-white">
                <h5 className="card-title m-0">Profile Information</h5>
              </div>

              <div className="card-body">
                {isEditingProfile ? (
                  <form onSubmit={handleProfileSubmit}>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Username</label>
                        <input
                          type="text"
                          name="username"
                          value={profileData.username}
                          onChange={handleProfileChange}
                          className="form-control"
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Email</label>
                        <input
                          type="email"
                          name="email"
                          value={profileData.email}
                          onChange={handleProfileChange}
                          className="form-control"
                          required
                        />
                      </div>
                    </div>

                    <div className="d-flex gap-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="btn"
                        style={{
                          backgroundColor: 'var(--color-primary)',
                          color: 'white',
                          borderColor: 'var(--color-primary)',
                        }}
                      >
                        {loading ? 'Saving…' : 'Save Changes'}
                      </button>
                      <button
                        type="button"
                        onClick={cancelProfileEdit}
                        className="btn btn-outline-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="row gy-3">
                    <div className="col-md-6">
                      <small className="text-muted d-block">Username</small>
                      <div className="fw-semibold">{user?.username || '—'}</div>
                    </div>
                    <div className="col-md-6">
                      <small className="text-muted d-block">Role</small>
                      <span className="badge bg-light text-dark text-capitalize">
                        {user?.role || 'user'}
                      </span>
                    </div>
                    <div className="col-md-6">
                      <small className="text-muted d-block">Email</small>
                      <div className="fw-semibold">{user?.email || '—'}</div>
                    </div>
                    <div className="col-md-6">
                      <small className="text-muted d-block">Member Since</small>
                      <div className="fw-semibold">
                        {user?.created_at
                          ? new Date(user.created_at).toLocaleDateString()
                          : 'N/A'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Account quick summary + password */}
          <div className="col-lg-5">
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <h6 className="text-muted mb-3">Account Summary</h6>
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center"
                    style={{
                      width: 44,
                      height: 44,
                      backgroundColor: 'rgba(0,0,0,0.05)',
                      fontWeight: 700,
                    }}
                  >
                    {initials}
                  </div>
                  <div>
                    <div className="fw-semibold">{user?.username}</div>
                    <small className="text-muted">{user?.email}</small>
                  </div>
                </div>
              </div>
              <div className="card-footer bg-white">
                {!isEditingProfile ? (
                  <button
                    className="btn btn-sm"
                    style={{
                      backgroundColor: 'var(--color-primary)',
                      color: 'white',
                      borderColor: 'var(--color-primary)',
                    }}
                    onClick={() => setIsEditingProfile(true)}
                  >
                    Edit Profile
                  </button>
                ) : (
                  <small className="text-muted">Editing in progress…</small>
                )}
              </div>
            </div>

            <div className="card shadow-sm">
              <div className="card-header bg-white">
                <h5 className="m-0">Security</h5>
              </div>
              <div className="card-body">
                {isChangingPassword ? (
                  <form onSubmit={handlePasswordSubmit}>
                    <div className="mb-3">
                      <label className="form-label">Current Password</label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className="form-control"
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">New Password</label>
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="form-control"
                        placeholder="At least 6 characters with letters and numbers"
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Confirm New Password</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="form-control"
                        required
                      />
                    </div>

                    <div className="d-flex gap-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="btn"
                        style={{
                          backgroundColor: 'var(--color-primary)',
                          color: 'white',
                          borderColor: 'var(--color-primary)',
                        }}
                      >
                        {loading ? 'Updating…' : 'Update Password'}
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => {
                          setIsChangingPassword(false);
                          setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    className="btn"
                    style={{
                      backgroundColor: 'var(--color-primary)',
                      color: 'white',
                      borderColor: 'var(--color-primary)',
                    }}
                    onClick={() => setIsChangingPassword(true)}
                  >
                    Change Password
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
