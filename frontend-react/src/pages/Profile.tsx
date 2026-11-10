import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, userService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Navbar from '../components/Navbar';
import './Profile.css';

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [freshUser, setFreshUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwSaving, setPwSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    setFreshUser(user);
    userService
      .getById(user.id)
      .then((data) => {
        setFreshUser(data);
        updateUser(data);
      })
      .catch(() => setFreshUser(user))
      .finally(() => setLoading(false));
  }, [user, navigate, updateUser]);

  if (!freshUser || loading) {
    return (
      <div className="profile-page">
        <Navbar />
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  const roleLabel = freshUser.role.toLowerCase().replace('_', ' ');
  const roleIcon =
    freshUser.role === 'ADMINISTRATOR'
      ? 'fa-user-shield'
      : freshUser.role === 'CLUB_ORGANIZER'
      ? 'fa-user-tie'
      : 'fa-user-graduate';

  const joinedDate = freshUser.createdAt
    ? new Date(freshUser.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : 'N/A';

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.next.length < 8) {
      toast.error('New password must be at least 8 characters.');
      return;
    }
    if (pwForm.next !== pwForm.confirm) {
      toast.error('New passwords do not match.');
      return;
    }
    setPwSaving(true);
    try {
      await authService.changePassword(pwForm.current, pwForm.next);
      toast.success('Password changed successfully.');
      setPwForm({ current: '', next: '', confirm: '' });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to change password.');
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div className="profile-page">
      <Navbar />

      <div className="main-container">
        <div className="page-header">
          <h1>
            <i className="fas fa-id-badge"></i> My Profile
          </h1>
          <p>Your account and academic information</p>
        </div>

        <div className="profile-card">
          <div className="profile-cover">
            <div className="profile-avatar">
              {freshUser.firstName.charAt(0)}
              {freshUser.lastName.charAt(0)}
            </div>
            <div className="profile-heading">
              <h2>
                {freshUser.firstName} {freshUser.lastName}
              </h2>
              <span className={`badge ${freshUser.role === 'ADMINISTRATOR' ? 'badge-approved' : freshUser.role === 'CLUB_ORGANIZER' ? 'badge-pending' : 'badge-completed'}`}>
                <i className={`fas ${roleIcon}`}></i> {roleLabel}
              </span>
              <span className={`badge ${freshUser.status === 'ACTIVE' ? 'badge-active' : 'badge-cancelled'}`}>
                {freshUser.status}
              </span>
            </div>
          </div>

          <div className="profile-body">
            <div className="profile-section">
              <h3>
                <i className="fas fa-address-card"></i> Personal Information
              </h3>
              <div className="profile-grid">
                <div className="p-item">
                  <div className="p-label">Full Name</div>
                  <div className="p-value">
                    {freshUser.firstName} {freshUser.lastName}
                  </div>
                </div>
                <div className="p-item">
                  <div className="p-label">Email</div>
                  <div className="p-value">{freshUser.email}</div>
                </div>
                <div className="p-item">
                  <div className="p-label">Phone</div>
                  <div className="p-value">{freshUser.phoneNumber || 'Not provided'}</div>
                </div>
                <div className="p-item">
                  <div className="p-label">Member Since</div>
                  <div className="p-value">{joinedDate}</div>
                </div>
              </div>
            </div>

            {(freshUser.registrationNumber || freshUser.employeeNumber) && (
              <div className="profile-section">
                <h3>
                  <i className="fas fa-id-card"></i> Identification
                </h3>
                <div className="profile-grid">
                  {freshUser.registrationNumber && (
                    <div className="p-item">
                      <div className="p-label">Registration Number</div>
                      <div className="p-value">{freshUser.registrationNumber}</div>
                    </div>
                  )}
                  {freshUser.employeeNumber && (
                    <div className="p-item">
                      <div className="p-label">Employee Number</div>
                      <div className="p-value">{freshUser.employeeNumber}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {freshUser.role === 'STUDENT' && (
              <div className="profile-section">
                <h3>
                  <i className="fas fa-graduation-cap"></i> Academic Information
                </h3>
                <div className="profile-grid">
                  <div className="p-item">
                    <div className="p-label">School</div>
                    <div className="p-value">{freshUser.schoolName || 'Not assigned'}</div>
                  </div>
                  <div className="p-item">
                    <div className="p-label">Program</div>
                    <div className="p-value">{freshUser.programName || 'Not assigned'}</div>
                  </div>
                  <div className="p-item">
                    <div className="p-label">Year of Study</div>
                    <div className="p-value">Year {freshUser.yearOfStudy || '—'}</div>
                  </div>
                </div>
              </div>
            )}

            <div className="profile-actions">
              {freshUser.role === 'STUDENT' && (
                <>
                  <button className="btn btn-primary" onClick={() => navigate('/registrations')}>
                    <i className="fas fa-clipboard-list"></i> My Registrations
                  </button>
                  <button className="btn btn-cream" onClick={() => navigate('/favorites')}>
                    <i className="fas fa-heart"></i> My Favorites
                  </button>
                  <button className="btn btn-outline" onClick={() => navigate('/organizer-apply')}>
                    <i className="fas fa-user-tie"></i> Become an Organizer
                  </button>
                </>
              )}
              {freshUser.role === 'CLUB_ORGANIZER' && (
                <button className="btn btn-primary" onClick={() => navigate('/my-events')}>
                  <i className="fas fa-calendar-check"></i> My Events
                </button>
              )}
            </div>

            <div className="profile-section pw-section">
              <h3>
                <i className="fas fa-shield-halved"></i> Change Password
              </h3>
              <form onSubmit={handleChangePassword}>
                <div className="profile-grid">
                  <div className="form-group">
                    <label>Current Password</label>
                    <input
                      type="password"
                      value={pwForm.current}
                      onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })}
                      placeholder="Enter current password"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>New Password</label>
                    <input
                      type="password"
                      value={pwForm.next}
                      onChange={(e) => setPwForm({ ...pwForm, next: e.target.value })}
                      placeholder="Min 8 characters"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      value={pwForm.confirm}
                      onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
                      placeholder="Repeat new password"
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" disabled={pwSaving}>
                  {pwSaving ? (
                    <i className="fas fa-spinner fa-spin"></i>
                  ) : (
                    <i className="fas fa-key"></i>
                  )}{' '}
                  Update Password
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
