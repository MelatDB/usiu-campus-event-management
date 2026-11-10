import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationService, getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import './CampusAnnouncements.css';

const CampusAnnouncements: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!user || user.role !== 'ADMINISTRATOR') {
    navigate('/dashboard');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError('');
    setSuccess('');
    try {
      await notificationService.sendCampusAnnouncement({ title, message });
      setSuccess('Campus announcement sent to all active students and organizers.');
      setTitle('');
      setMessage('');
    } catch (error) {
      setError(getErrorMessage(error, 'Failed to send announcement'));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="campus-announcements-page">
      <Navbar />

      <div className="main-container">
        <div className="page-header">
          <h1>
            <i className="fas fa-bullhorn"></i> Campus Announcements
          </h1>
          <p>Send a notification to every active user on the platform</p>
        </div>

        <div className="campus-layout">
          <form onSubmit={handleSubmit} className="campus-form card">
            <h3>
              <i className="fas fa-paper-plane"></i> New Announcement
            </h3>

            {error && (
              <div className="error-message mb-16">
                <i className="fas fa-exclamation-circle"></i> {error}
              </div>
            )}
            {success && (
              <div className="success-message mb-16">
                <i className="fas fa-check-circle"></i> {success}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="ca-title">Title *</label>
              <input
                id="ca-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Library extended hours"
                maxLength={200}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="ca-message">Message *</label>
              <textarea
                id="ca-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Full details of the campus announcement..."
                rows={6}
                required
              />
            </div>

            <div className="campus-preview">
              <strong>
                <i className="fas fa-eye"></i> Preview
              </strong>
              {title || message ? (
                <div className="preview-box">
                  <div className="preview-title">{title || 'Untitled announcement'}</div>
                  <div className="preview-body">{message || 'No message body yet.'}</div>
                </div>
              ) : (
                <p className="preview-empty">Start typing to see a live preview.</p>
              )}
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={sending}>
              {sending ? (
                <i className="fas fa-spinner fa-spin"></i>
              ) : (
                <i className="fas fa-paper-plane"></i>
              )}
              {sending ? ' Sending...' : ' Send to Everyone'}
            </button>
          </form>

          <div className="campus-info card">
            <h3>
              <i className="fas fa-info-circle"></i> About Campus Announcements
            </h3>
            <ul>
              <li>
                <i className="fas fa-check"></i> Delivered as a push notification to every active
                user.
              </li>
              <li>
                <i className="fas fa-check"></i> Best used for university-wide updates: closures,
                deadlines, or emergencies.
              </li>
              <li>
                <i className="fas fa-check"></i> For event-specific updates, use the Announcements
                page on each event instead.
              </li>
            </ul>
            <div className="campus-note">
              <i className="fas fa-lightbulb"></i> Keep messages clear and concise — recipients
              receive this immediately.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampusAnnouncements;
