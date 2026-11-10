import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Event } from '../types';
import { eventService, getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Navbar from '../components/Navbar';
import Pagination from '../components/Pagination';
import './MyEvents.css';

const statusBadge = (event: Event) => {
  const map: Record<string, string> = {
    PUBLISHED: 'badge-published',
    DRAFT: 'badge-draft',
    CANCELLED: 'badge-cancelled',
    COMPLETED: 'badge-completed',
  };
  const approvalMap: Record<string, string> = {
    PENDING: 'badge-pending',
    APPROVED: 'badge-approved',
    REJECTED: 'badge-rejected',
    CHANGES_REQUESTED: 'badge-pending',
  };
  return (
    <>
      <span className={`badge ${map[event.eventStatus] || 'badge-draft'}`}>{event.eventStatus}</span>
      <span className={`badge ${approvalMap[event.approvalStatus] || 'badge-pending'}`}>
        {event.approvalStatus.replace('_', ' ')}
      </span>
    </>
  );
};

const MyEvents: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(
    async (targetPage: number) => {
      setLoading(true);
      setError('');
      try {
        const data = await eventService.getOrganizerEvents({ page: targetPage, size: 8 });
        setEvents(data.content);
        setPage(data.page);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
      } catch (error) {
        setError(getErrorMessage(error, 'Failed to load events'));
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    load(0);
  }, [user, navigate, load]);

  const handleCancel = async (event: Event) => {
    try {
      await eventService.cancel(event.id);
      toast.success('Event cancelled.');
      load(page);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to cancel event'));
    }
  };

  const handleDelete = async (event: Event) => {
    try {
      await eventService.delete(event.id);
      toast.success('Event deleted.');
      load(page);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to delete event'));
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });

  return (
    <div className="my-events-page">
      <Navbar />

      <div className="main-container">
        <div className="flex-between wrap mb-16">
          <div className="page-header">
            <h1>
              <i className="fas fa-calendar-check"></i> My Events
            </h1>
            <p>Manage the events you have created</p>
          </div>
          <button className="btn btn-gold" onClick={() => navigate('/events/create')}>
            <i className="fas fa-plus"></i> Create New Event
          </button>
        </div>

        {error && (
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i> {error}
          </div>
        )}

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading your events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-calendar-plus"></i>
            <h3>No events yet</h3>
            <p>Create your first event to start engaging students.</p>
            <button className="btn btn-primary" onClick={() => navigate('/events/create')}>
              <i className="fas fa-plus"></i> Create Event
            </button>
          </div>
        ) : (
          <>
            <div className="mb-8 text-muted">
              {totalElements} event{totalElements === 1 ? '' : 's'} total
            </div>
            <div className="my-events-list">
              {events.map((event) => (
                <div className="my-event-card" key={event.id}>
                  <div className="my-event-main">
                    <div className="my-event-header">
                      <h3 className="clickable" onClick={() => navigate(`/events/${event.id}/registrations`)}>
                        {event.title}
                      </h3>
                      <div className="my-event-badges">{statusBadge(event)}</div>
                    </div>
                    <div className="my-event-meta">
                      <span>
                        <i className="fas fa-calendar"></i> {formatDate(event.startDateTime)}
                      </span>
                      <span>
                        <i className="fas fa-location-dot"></i> {event.venueName || 'No venue'}
                      </span>
                      <span>
                        <i className="fas fa-users"></i> {event.currentParticipants} /{' '}
                        {event.maximumCapacity}
                      </span>
                      {event.categoryName && (
                        <span>
                          <i className="fas fa-tags"></i> {event.categoryName}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="my-event-actions">
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => navigate(`/events/${event.id}/registrations`)}
                    >
                      <i className="fas fa-clipboard-list"></i> Registrations
                    </button>
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => navigate(`/events/${event.id}/announcements`)}
                    >
                      <i className="fas fa-bullhorn"></i> Announcements
                    </button>
                    <button
                      className="btn btn-sm btn-cream"
                      onClick={() => navigate(`/events/${event.id}/edit`)}
                    >
                      <i className="fas fa-edit"></i> Edit
                    </button>
                    {event.eventStatus !== 'CANCELLED' && event.eventStatus !== 'COMPLETED' && (
                      <button className="btn btn-sm btn-outline" onClick={() => handleCancel(event)}>
                        <i className="fas fa-ban"></i> Cancel
                      </button>
                    )}
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(event)}>
                      <i className="fas fa-trash"></i> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <Pagination page={page} totalPages={totalPages} onPageChange={load} />
          </>
        )}
      </div>
    </div>
  );
};

export default MyEvents;
