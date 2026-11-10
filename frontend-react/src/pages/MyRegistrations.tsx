import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Event, Registration } from '../types';
import { registrationService, eventService, feedbackService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Navbar from '../components/Navbar';
import EventModal from '../components/EventModal';
import Pagination from '../components/Pagination';
import './MyRegistrations.css';

const PAGE_SIZE = 8;

const COMMON_RESPONSES = [
  'Great event',
  'Great speakers',
  'Good venue',
  'Registration was easy',
  'Would attend again',
  'Too long',
  'Too crowded',
  'Not well organized',
];

const MyRegistrations: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filter, setFilter] = useState<'ALL' | 'UPCOMING' | 'PAST' | 'CANCELLED'>('ALL');
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [pendingFeedback, setPendingFeedback] = useState<Event[]>([]);
  const [feedbackOpen, setFeedbackOpen] = useState<number | null>(null);

  const loadRegistrations = useCallback(async (pageNum: number) => {
    setLoading(true);
    try {
      const data = await registrationService.getMyRegistrations({ page: pageNum, size: PAGE_SIZE });
      setRegistrations(data.content);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error loading registrations:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPendingFeedback = useCallback(async () => {
    try {
      setPendingFeedback(await feedbackService.getPending());
    } catch (error) {
      console.error('Error loading pending feedback:', error);
    }
  }, []);

  useEffect(() => {
    loadRegistrations(page);
    loadPendingFeedback();
  }, [loadRegistrations, loadPendingFeedback, page]);

  const handleCancel = async (id: number) => {
    try {
      await registrationService.cancel(id);
      toast.success('Registration cancelled.');
      loadRegistrations(page);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to cancel registration');
    }
  };

  const handleDownloadTicket = async (id: number) => {
    try {
      const blob = await registrationService.downloadTicket(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `event-ticket-${id}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Ticket downloaded.');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to download ticket');
    }
  };

  const openEvent = async (eventId: number) => {
    setSelectedEventId(eventId);
  };

  const getStatusClass = (status: string) => {
    switch (status.toUpperCase()) {
      case 'REGISTERED':
        return 'badge badge-registered';
      case 'CANCELLED':
        return 'badge badge-cancelled';
      case 'WAITLISTED':
        return 'badge badge-pending';
      default:
        return 'badge';
    }
  };

  const getAttendanceClass = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PRESENT':
      case 'CHECKED_IN':
        return 'badge badge-present';
      case 'ABSENT':
        return 'badge badge-absent';
      default:
        return 'badge badge-not-marked';
    }
  };

  const filtered = registrations.filter((r) => {
    if (filter === 'CANCELLED') return r.registrationStatus.toUpperCase() === 'CANCELLED';
    if (filter === 'PAST') return new Date(r.eventStartDateTime) < new Date();
    if (filter === 'UPCOMING') {
      return new Date(r.eventStartDateTime) >= new Date() && r.registrationStatus.toUpperCase() !== 'CANCELLED';
    }
    return true;
  });

  const handleFeedbackSubmitted = (eventId: number) => {
    setPendingFeedback((prev) => prev.filter((e) => e.id !== eventId));
    setFeedbackOpen((prev) => (prev === eventId ? null : prev));
  };

  return (
    <div className="registrations-page">
      <Navbar />

      <div className="main-container">
        <div className="page-header">
          <h1>
            <i className="fas fa-clipboard-list"></i> My Registrations
          </h1>
          <p>Track the events you've registered for</p>
        </div>

        {pendingFeedback.length > 0 && (
          <div className="feedback-prompt-section">
            <div className="feedback-prompt-heading">
              <i className="fas fa-star"></i>
              <h2>How were your recent events?</h2>
              <p>You attended {pendingFeedback.length} completed event{pendingFeedback.length === 1 ? '' : 's'} that could use your feedback.</p>
            </div>
            <div className="feedback-prompt-list">
              {pendingFeedback.map((event) => (
                <FeedbackCard
                  key={event.id}
                  event={event}
                  open={feedbackOpen === event.id}
                  onToggle={() => setFeedbackOpen((prev) => (prev === event.id ? null : event.id))}
                  onSubmitted={() => handleFeedbackSubmitted(event.id)}
                />
              ))}
            </div>
          </div>
        )}

        <div className="reg-tabs">
          {(['ALL', 'UPCOMING', 'PAST', 'CANCELLED'] as const).map((tab) => (
            <button
              key={tab}
              className={`reg-tab ${filter === tab ? 'active' : ''}`}
              onClick={() => setFilter(tab)}
            >
              {tab === 'ALL' && <i className="fas fa-layer-group"></i>}
              {tab === 'UPCOMING' && <i className="fas fa-calendar-week"></i>}
              {tab === 'PAST' && <i className="fas fa-history"></i>}
              {tab === 'CANCELLED' && <i className="fas fa-times-circle"></i>}
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading registrations...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="card empty-state">
            <i className="fas fa-clipboard"></i>
            <h3>No Registrations</h3>
            <p>You haven't registered for any events in this view</p>
            <button className="btn btn-primary" onClick={() => navigate('/browse')}>
              <i className="fas fa-compass"></i> Browse Events
            </button>
          </div>
        ) : (
          <div className="reg-list">
            {filtered.map((registration) => {
              const startDate = new Date(registration.eventStartDateTime);
              const isUpcoming = startDate >= new Date() && registration.registrationStatus.toUpperCase() !== 'CANCELLED';
              return (
                <div key={registration.id} className="reg-card">
                  <div className="reg-date-block">
                    <span className="reg-day">{startDate.getDate()}</span>
                    <span className="reg-month">
                      {startDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                    </span>
                    <span className="reg-year">{startDate.getFullYear()}</span>
                  </div>

                  <div className="reg-card-main">
                    <div className="reg-card-header">
                      <h3 onClick={() => openEvent(registration.eventId)}>{registration.eventTitle}</h3>
                      <div className="reg-badges">
                        <span className={getStatusClass(registration.registrationStatus)}>
                          {registration.registrationStatus}
                        </span>
                        <span className={getAttendanceClass(registration.attendanceStatus)}>
                          Attendance: {registration.attendanceStatus.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <div className="reg-meta">
                      <span>
                        <i className="fas fa-clock"></i>
                        {startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span>
                        <i className="fas fa-check-circle"></i>
                        Registered{' '}
                        {new Date(registration.registrationDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      <span>
                        <i className="fas fa-hashtag"></i>
                        Ticket #USIU-EVT-{registration.id}
                      </span>
                    </div>
                  </div>

                  <div className="reg-actions">
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => openEvent(registration.eventId)}
                    >
                      <i className="fas fa-eye"></i> Event
                    </button>
                    {isUpcoming && (
                      <button
                        className="btn btn-gold btn-sm"
                        onClick={() => handleDownloadTicket(registration.id)}
                      >
                        <i className="fas fa-ticket-alt"></i> Ticket
                      </button>
                    )}
                    {isUpcoming && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleCancel(registration.id)}
                      >
                        <i className="fas fa-times"></i> Cancel
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {selectedEventId !== null && (
        <EventDetailsModal eventId={selectedEventId} onClose={() => setSelectedEventId(null)} />
      )}
    </div>
  );
};

const FeedbackCard: React.FC<{
  event: Event;
  open: boolean;
  onToggle: () => void;
  onSubmitted: () => void;
}> = ({ event, open, onToggle, onSubmitted }) => {
  const toast = useToast();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const toggleTag = (tag: string) => {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please pick a star rating before submitting.');
      return;
    }
    setSubmitting(true);
    try {
      await feedbackService.submit(event.id, { rating, comment: comment.trim() || undefined, tags });
      toast.success('Feedback submitted. Thanks for your input!');
      onSubmitted();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const endedDate = new Date(event.endDateTime);

  return (
    <div className={`feedback-card ${open ? 'open' : ''}`}>
      <div className="feedback-card-summary">
        <div className="feedback-card-date">
          <span className="reg-day">{endedDate.getDate()}</span>
          <span className="reg-month">
            {endedDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
          </span>
        </div>
        <div className="feedback-card-info">
          <h4>{event.title}</h4>
          <span>
            <i className="fas fa-calendar-check"></i>
            Ended {endedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
        <button className="btn btn-outline btn-sm" onClick={onToggle}>
          <i className={open ? 'fas fa-chevron-up' : 'fas fa-star'}></i>
          {open ? 'Close' : 'Give Feedback'}
        </button>
      </div>

      {open && (
        <form className="feedback-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>How was it? <span className="required-star">*</span></label>
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`star-btn ${star <= (hoverRating || rating) ? 'active' : ''}`}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  aria-label={`${star} star${star === 1 ? '' : 's'}`}
                >
                  <i className="fas fa-star"></i>
                </button>
              ))}
              <span className="star-label">
                {rating > 0
                  ? ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'][rating]
                  : 'Tap to rate'}
              </span>
            </div>
          </div>

          <div className="form-group">
            <label>What did you think? (tap all that apply)</label>
            <div className="common-responses">
              {COMMON_RESPONSES.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className={`response-chip ${tags.includes(tag) ? 'selected' : ''}`}
                  onClick={() => toggleTag(tag)}
                >
                  {tags.includes(tag) && <i className="fas fa-check"></i>} {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Any other comments?</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell the organizers what you loved or what could be better..."
              rows={3}
            />
          </div>

          <div className="feedback-form-actions">
            <button type="button" className="btn btn-cream btn-sm" onClick={onToggle}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
              {submitting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-paper-plane"></i>}
              {submitting ? ' Submitting...' : ' Submit Feedback'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

const EventDetailsModal: React.FC<{ eventId: number; onClose: () => void }> = ({ eventId, onClose }) => {
  const [event, setEvent] = React.useState<any>(null);
  const { user } = useAuth();

  useEffect(() => {
    eventService.getById(eventId).then(setEvent).catch(console.error);
  }, [eventId]);

  if (!event) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-box">
          <div className="modal-body">
            <div className="loading">
              <div className="spinner"></div>
              <p>Loading event...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <EventModal
      event={event}
      userRole={user?.role || ''}
      isRegistered
      onRegister={() => {}}
      onClose={onClose}
    />
  );
};

export default MyRegistrations;
