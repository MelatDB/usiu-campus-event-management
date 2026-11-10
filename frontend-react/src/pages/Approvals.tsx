import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Event } from '../types';
import { eventService, getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Navbar from '../components/Navbar';
import './Approvals.css';

const Approvals: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [pendingEvents, setPendingEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actingId, setActingId] = useState<number | null>(null);

  const loadPending = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await eventService.getAll({ size: 100, sort: 'startDateTime,asc' });
      setPendingEvents(data.content.filter((e) => e.approvalStatus === 'PENDING'));
    } catch (error) {
      setError(getErrorMessage(error, 'Failed to load pending events'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'ADMINISTRATOR') {
      navigate('/dashboard');
      return;
    }
    loadPending();
  }, [user, navigate]);

  const handleApprove = async (eventId: number) => {
    setActingId(eventId);
    try {
      await eventService.approve(eventId);
      toast.success('Event approved.');
      setPendingEvents((prev) => prev.filter((e) => e.id !== eventId));
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to approve event'));
    } finally {
      setActingId(null);
    }
  };

  const handleReject = async (event: Event) => {
    setActingId(event.id);
    try {
      await eventService.reject(event.id, 'Rejected by administrator.');
      toast.success('Event rejected.');
      setPendingEvents((prev) => prev.filter((e) => e.id !== event.id));
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to reject event'));
    } finally {
      setActingId(null);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });

  return (
    <div className="approvals-page">
      <Navbar />

      <div className="main-container">
        <div className="page-header">
          <h1>
            <i className="fas fa-clipboard-check"></i> Event Approvals
          </h1>
          <p>Review events submitted by organizers before they go live</p>
        </div>

        {error && (
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i> {error}
          </div>
        )}

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading pending events...</p>
          </div>
        ) : pendingEvents.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-check-circle"></i>
            <h3>All caught up!</h3>
            <p>There are no events waiting for approval.</p>
          </div>
        ) : (
          <div className="approvals-list">
            <div className="approvals-count">
              <span className="badge badge-pending">
                {pendingEvents.length} pending event{pendingEvents.length === 1 ? '' : 's'}
              </span>
            </div>
            {pendingEvents.map((event) => (
              <div className="approval-card" key={event.id}>
                <div className="approval-header">
                  <div className="event-info">
                    <h3>{event.title}</h3>
                    <div className="event-meta">
                      <i className="fas fa-user-tie"></i> {event.organizerName}
                      <span className="separator">•</span>
                      <i className="fas fa-users"></i> {event.clubName || 'No club'}
                      <span className="separator">•</span>
                      <i className="fas fa-calendar"></i> {formatDate(event.startDateTime)}
                    </div>
                  </div>
                  <span className="status-badge pending">
                    <i className="fas fa-clock"></i> Pending
                  </span>
                </div>

                <div className="approval-body">
                  <div className="event-description">
                    <h4>
                      <i className="fas fa-align-left"></i> Description
                    </h4>
                    <p>{event.description}</p>
                  </div>

                  <div className="event-details-grid">
                    <div className="detail-item">
                      <i className="fas fa-tags"></i>
                      <div>
                        <div className="detail-label">Category</div>
                        <div className="detail-value">{event.categoryName || '—'}</div>
                      </div>
                    </div>
                    <div className="detail-item">
                      <i className="fas fa-location-dot"></i>
                      <div>
                        <div className="detail-label">Venue</div>
                        <div className="detail-value">{event.venueName || '—'}</div>
                      </div>
                    </div>
                    <div className="detail-item">
                      <i className="fas fa-hourglass-end"></i>
                      <div>
                        <div className="detail-label">Registration Deadline</div>
                        <div className="detail-value">{formatDate(event.registrationDeadline)}</div>
                      </div>
                    </div>
                    <div className="detail-item">
                      <i className="fas fa-users"></i>
                      <div>
                        <div className="detail-label">Capacity</div>
                        <div className="detail-value">
                          {event.currentParticipants} / {event.maximumCapacity}
                        </div>
                      </div>
                    </div>
                    <div className="detail-item">
                      <i className="fas fa-globe-africa"></i>
                      <div>
                        <div className="detail-label">Audience</div>
                        <div className="detail-value">
                          {event.openToAllStudents ? 'All students' : event.targetSchoolName || 'Targeted'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="approval-actions">
                  <button
                    className="btn-approve"
                    disabled={actingId === event.id}
                    onClick={() => handleApprove(event.id)}
                  >
                    {actingId === event.id ? (
                      <i className="fas fa-spinner fa-spin"></i>
                    ) : (
                      <i className="fas fa-check"></i>
                    )}{' '}
                    Approve
                  </button>
                  <button
                    className="btn-reject"
                    disabled={actingId === event.id}
                    onClick={() => handleReject(event)}
                  >
                    <i className="fas fa-xmark"></i> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Approvals;
