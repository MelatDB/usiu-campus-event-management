import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnalyticsData, FeedbackEventSummary } from '../types';
import { analyticsService, feedbackService, getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import './Analytics.css';

const Analytics: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [feedbackEvents, setFeedbackEvents] = useState<FeedbackEventSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'ADMINISTRATOR') {
      navigate('/dashboard');
      return;
    }
    Promise.all([
      analyticsService.getOverview(),
      feedbackService.getEvents().catch(() => [] as FeedbackEventSummary[]),
    ])
      .then(([overview, fbEvents]) => {
        setData(overview);
        setFeedbackEvents(fbEvents);
      })
      .catch((error) => setError(getErrorMessage(error, 'Failed to load analytics')))
      .finally(() => setLoading(false));
  }, [user, navigate]);

  const renderStars = (rating: number) =>
    [1, 2, 3, 4, 5].map((star) => (
      <i key={star} className={`fas fa-star fb-star ${star <= Math.round(rating) ? 'on' : ''}`}></i>
    ));

  const cards = data
    ? [
        { label: 'Total Users', value: data.totalUsers, icon: 'fa-users', cls: 'primary' },
        { label: 'Students', value: data.totalStudents, icon: 'fa-user-graduate', cls: 'success' },
        { label: 'Organizers', value: data.totalOrganizers, icon: 'fa-user-tie', cls: 'info' },
        { label: 'Total Events', value: data.totalEvents, icon: 'fa-calendar-alt', cls: 'secondary' },
        { label: 'Pending Approval', value: data.pendingEvents, icon: 'fa-clock', cls: 'warning' },
        { label: 'Published Events', value: data.publishedEvents, icon: 'fa-check-circle', cls: 'green' },
        { label: 'Active Registrations', value: data.activeRegistrations, icon: 'fa-clipboard-check', cls: 'accent' },
      ]
    : [];

  return (
    <div className="analytics-page">
      <Navbar />

      <div className="main-container">
        <div className="page-header">
          <h1>
            <i className="fas fa-chart-line"></i> Analytics
          </h1>
          <p>Platform overview for USIU-Africa campus events</p>
        </div>

        {error && (
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i> {error}
          </div>
        )}

        {loading || !data ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading analytics...</p>
          </div>
        ) : (
          <>
            <div className="stats-grid">
              {cards.map((card) => (
                <div className={`stat-card ${card.cls}`} key={card.label}>
                  <div className="stat-icon">
                    <i className={`fas ${card.icon}`}></i>
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">{card.value}</div>
                    <div className="stat-label">{card.label}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="analytics-sections">
              <div className="analytics-section">
                <h2>
                  <i className="fas fa-list-check"></i> Overview
                </h2>
                <div className="overview-grid">
                  <div className="overview-item">
                    <div className="overview-label">Users</div>
                    <div className="overview-value">{data.totalUsers}</div>
                  </div>
                  <div className="overview-item">
                    <div className="overview-label">Events</div>
                    <div className="overview-value">{data.totalEvents}</div>
                  </div>
                  <div className="overview-item">
                    <div className="overview-label">Published</div>
                    <div className="overview-value">{data.publishedEvents}</div>
                  </div>
                  <div className="overview-item">
                    <div className="overview-label">Pending</div>
                    <div className="overview-value">{data.pendingEvents}</div>
                  </div>
                  <div className="overview-item">
                    <div className="overview-label">Active Registrations</div>
                    <div className="overview-value">{data.activeRegistrations}</div>
                  </div>
                </div>
              </div>

              <div className="analytics-section">
                <h2>
                  <i className="fas fa-bolt"></i> Attention Needed
                </h2>
                <div className="action-items">
                  {data.pendingEvents > 0 && (
                    <div className="action-item warning">
                      <i className="fas fa-clock"></i>
                      <div>
                        {data.pendingEvents} event{data.pendingEvents === 1 ? '' : 's'} waiting for
                        approval
                      </div>
                      <button className="btn-action" onClick={() => navigate('/approvals')}>
                        Review
                      </button>
                    </div>
                  )}
                  {data.pendingEvents === 0 && (
                    <div className="action-item success">
                      <i className="fas fa-check-double"></i>
                      <div>No pending approvals. Everything is up to date.</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="analytics-section">
                <h2>
                  <i className="fas fa-star-half-stroke"></i> Event Feedback
                </h2>
                {feedbackEvents.length === 0 ? (
                  <div className="action-item success">
                    <i className="fas fa-star"></i>
                    <div>No student feedback collected yet.</div>
                  </div>
                ) : (
                  <div className="feedback-event-list">
                    {feedbackEvents.slice(0, 5).map((ev) => (
                      <div className="feedback-event-row" key={ev.eventId}>
                        <div className="feedback-event-title">
                          <div>{ev.eventTitle}</div>
                          <span>{ev.organizerName}</span>
                        </div>
                        <div className="feedback-event-stars">
                          {renderStars(ev.averageRating)}
                          <span className="feedback-event-avg">{ev.averageRating.toFixed(1)}</span>
                        </div>
                        <span className="feedback-event-count">{ev.feedbackCount} reviews</span>
                      </div>
                    ))}
                    <button
                      className="btn-action"
                      onClick={() => navigate('/feedback-reviews')}
                    >
                      <i className="fas fa-arrow-right"></i> View all feedback
                    </button>
                  </div>
                )}
              </div>

              <div className="analytics-section">
                <h2>
                  <i className="fas fa-compass"></i> Quick Actions
                </h2>
                <div className="quick-actions">
                  <button className="quick-action-btn" onClick={() => navigate('/approvals')}>
                    <i className="fas fa-check-double"></i>
                    Review Approvals
                  </button>
                  <button className="quick-action-btn" onClick={() => navigate('/manage/users')}>
                    <i className="fas fa-users-cog"></i>
                    Manage Users
                  </button>
                  <button className="quick-action-btn" onClick={() => navigate('/manage/venues')}>
                    <i className="fas fa-location-dot"></i>
                    Manage Venues
                  </button>
                  <button className="quick-action-btn" onClick={() => navigate('/announcements')}>
                    <i className="fas fa-bullhorn"></i>
                    Send Announcement
                  </button>
                  <button className="quick-action-btn" onClick={() => navigate('/events/create')}>
                    <i className="fas fa-calendar-plus"></i>
                    Create Event
                  </button>
                  <button
                    className="quick-action-btn"
                    onClick={() => navigate('/feedback-reviews')}
                  >
                    <i className="fas fa-star-half-stroke"></i>
                    Feedback & Reviews
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Analytics;
