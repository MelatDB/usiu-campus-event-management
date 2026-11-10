import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Announcement } from '../types';
import { eventService, announcementService, getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Navbar from '../components/Navbar';
import Pagination from '../components/Pagination';
import './EventAnnouncements.css';

const EventAnnouncements: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [eventTitle, setEventTitle] = useState('');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [posting, setPosting] = useState(false);

  const load = useCallback(
    async (targetPage: number) => {
      if (!id) return;
      setLoading(true);
      setError('');
      try {
        const [event, data] = await Promise.all([
          eventService.getById(Number(id)),
          announcementService.getByEvent(Number(id)),
        ]);
        setEventTitle(event.title);
        setAnnouncements(data.content);
        setPage(data.page);
        setTotalPages(data.totalPages);
      } catch (error) {
        setError(getErrorMessage(error, 'Failed to load announcements'));
      } finally {
        setLoading(false);
      }
    },
    [id]
  );

  useEffect(() => {
    if (!user || (user.role !== 'CLUB_ORGANIZER' && user.role !== 'ADMINISTRATOR')) {
      navigate('/dashboard');
      return;
    }
    load(0);
  }, [user, navigate, load]);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setPosting(true);
    setError('');
    try {
      await announcementService.create({ eventId: Number(id), title, message });
      toast.success('Announcement posted.');
      setTitle('');
      setMessage('');
      load(0);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to post announcement'));
      setError(getErrorMessage(error, 'Failed to post announcement'));
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (announcement: Announcement) => {
    try {
      await announcementService.delete(announcement.id);
      toast.success('Announcement deleted.');
      load(page);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to delete announcement'));
    }
  };

  return (
    <div className="event-announcements-page">
      <Navbar />

      <div className="main-container">
        <div className="flex-between wrap mb-16">
          <div className="page-header">
            <h1>
              <i className="fas fa-bullhorn"></i> Announcements
            </h1>
            <p>{eventTitle || 'Loading event...'}</p>
          </div>
          <button className="btn btn-outline" onClick={() => navigate('/my-events')}>
            <i className="fas fa-arrow-left"></i> Back to My Events
          </button>
        </div>

        {error && (
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i> {error}
          </div>
        )}

        <div className="announcement-layout">
          <form onSubmit={handlePost} className="announcement-form card">
            <h3>
              <i className="fas fa-paper-plane"></i> Post an Announcement
            </h3>
            <div className="form-group">
              <label htmlFor="ann-title">Subject *</label>
              <input
                id="ann-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Venue change, schedule update"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="ann-message">Message *</label>
              <textarea
                id="ann-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Details for registered students..."
                rows={4}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={posting}>
              {posting ? (
                <i className="fas fa-spinner fa-spin"></i>
              ) : (
                <i className="fas fa-paper-plane"></i>
              )}
              {posting ? ' Sending...' : ' Send to Registered Students'}
            </button>
          </form>

          <div className="announcement-list">
            {loading ? (
              <div className="loading">
                <div className="spinner"></div>
                <p>Loading announcements...</p>
              </div>
            ) : announcements.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-inbox"></i>
                <h3>No announcements yet</h3>
                <p>Post your first update to keep students informed.</p>
              </div>
            ) : (
              announcements.map((ann) => (
                <div className="announcement-card card" key={ann.id}>
                  <div className="ann-header">
                    <h4>{ann.title}</h4>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(ann)}
                      title="Delete announcement"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                  <p className="ann-message">{ann.message}</p>
                  <div className="ann-footer">
                    <span>
                      <i className="fas fa-clock"></i>{' '}
                      {new Date(ann.postedDate).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}
            <Pagination page={page} totalPages={totalPages} onPageChange={load} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventAnnouncements;
