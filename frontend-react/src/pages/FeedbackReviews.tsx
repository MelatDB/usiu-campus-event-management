import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EventFeedbackSummary, Feedback, FeedbackEventSummary } from '../types';
import { feedbackService, getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import './FeedbackReviews.css';

const STAR_LABELS = ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'];

const FeedbackReviews: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<FeedbackEventSummary[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [summary, setSummary] = useState<EventFeedbackSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || (user.role !== 'CLUB_ORGANIZER' && user.role !== 'ADMINISTRATOR')) {
      navigate('/dashboard');
      return;
    }
    feedbackService
      .getEvents()
      .then((list) => {
        setEvents(list);
        if (list.length > 0) setSelectedId(list[0].eventId);
      })
      .catch((e) => setError(getErrorMessage(e, 'Failed to load feedback events')))
      .finally(() => setLoading(false));
  }, [user, navigate]);

  const loadSummary = useCallback(async (eventId: number) => {
    setLoading(true);
    setError('');
    try {
      setSummary(await feedbackService.getEventSummary(eventId));
    } catch (e) {
      setError(getErrorMessage(e, 'Failed to load feedback'));
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedId !== null) loadSummary(selectedId);
  }, [selectedId, loadSummary]);

  const total = summary?.feedbackCount ?? 0;
  const positiveCount = summary
    ? (summary.ratingDistribution[5] ?? 0) + (summary.ratingDistribution[4] ?? 0)
    : 0;
  const positivePct = total > 0 ? Math.round((positiveCount / total) * 100) : 0;

  return (
    <div className="feedback-reviews-page">
      <Navbar />

      <div className="main-container">
        <div className="page-header">
          <h1>
            <i className="fas fa-star-half-stroke"></i> Feedback & Reviews
          </h1>
          <p>
            {user?.role === 'ADMINISTRATOR'
              ? 'Review ratings and comments for any event on campus'
              : 'See what students thought about the events you organized'}
          </p>
        </div>

        {error && (
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i> {error}
          </div>
        )}

        <div className="feedback-event-picker">
          <label htmlFor="feedback-event-select">Event</label>
          <select
            id="feedback-event-select"
            value={selectedId ?? ''}
            onChange={(e) => setSelectedId(Number(e.target.value))}
            disabled={loading && events.length === 0}
          >
            {events.length === 0 && <option value="">No feedback available</option>}
            {events.map((ev) => (
              <option key={ev.eventId} value={ev.eventId}>
                {ev.eventTitle} — {ev.organizerName} ({ev.feedbackCount} review
                {ev.feedbackCount === 1 ? '' : 's'})
              </option>
            ))}
          </select>
        </div>

        {events.length === 0 && !loading && !error && (
          <div className="card empty-state">
            <i className="fas fa-star"></i>
            <h3>No Feedback Yet</h3>
            <p>There are no student reviews to show yet.</p>
          </div>
        )}

        {summary && (
          <>
            <div className="fb-metrics-grid">
              <div className="fb-metric-card">
                <div className="fb-metric-label">Average Rating</div>
                <div className="fb-metric-value">
                  {summary.averageRating.toFixed(1)}
                  <span className="fb-metric-suffix">/ 5</span>
                </div>
                <div className="fb-stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <i
                      key={star}
                      className={`fas fa-star ${star <= Math.round(summary.averageRating) ? 'on' : ''}`}
                    ></i>
                  ))}
                </div>
              </div>

              <div className="fb-metric-card">
                <div className="fb-metric-label">Total Reviews</div>
                <div className="fb-metric-value">{total}</div>
                <div className="fb-metric-sub">student submission{total === 1 ? '' : 's'}</div>
              </div>

              <div className="fb-metric-card">
                <div className="fb-metric-label">Positive Reviews</div>
                <div className="fb-metric-value">
                  {positivePct}
                  <span className="fb-metric-suffix">%</span>
                </div>
                <div className="fb-metric-sub">rated 4 or 5 stars</div>
              </div>
            </div>

            <div className="fb-lower-grid">
              <div className="fb-panel">
                <h2>
                  <i className="fas fa-chart-simple"></i> Rating Distribution
                </h2>
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = summary.ratingDistribution[star] ?? 0;
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                  return (
                    <div className="fb-dist-row" key={star}>
                      <span className="fb-dist-label">{star} star</span>
                      <div className="fb-dist-bar">
                        <div className="fb-dist-fill" style={{ width: `${pct}%` }}></div>
                      </div>
                      <span className="fb-dist-count">
                        {count} ({pct}%)
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="fb-panel">
                <h2>
                  <i className="fas fa-comment-dots"></i> Student Reviews
                </h2>
                {summary.feedback.length === 0 ? (
                  <div className="fb-no-reviews">No reviews for this event yet.</div>
                ) : (
                  <div className="fb-review-list">
                    {summary.feedback.map((fb) => (
                      <ReviewItem key={fb.id} fb={fb} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const ReviewItem: React.FC<{ fb: Feedback }> = ({ fb }) => (
  <div className="fb-review">
    <div className="fb-review-head">
      <div className="fb-review-avatar">
        {fb.studentName
          .split(' ')
          .map((n) => n.charAt(0))
          .slice(0, 2)
          .join('')}
      </div>
      <div className="fb-review-author">
        <div className="fb-review-name">{fb.studentName}</div>
        <div className="fb-review-date">
          {fb.createdAt ? new Date(fb.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
        </div>
      </div>
      <div className="fb-review-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <i key={star} className={`fas fa-star ${star <= fb.rating ? 'on' : ''}`}></i>
        ))}
        <span>{STAR_LABELS[fb.rating]}</span>
      </div>
    </div>
    {fb.tags.length > 0 && (
      <div className="fb-review-tags">
        {fb.tags.map((tag) => (
          <span className="fb-review-tag" key={tag}>
            {tag}
          </span>
        ))}
      </div>
    )}
    {fb.comment && <p className="fb-review-comment">{fb.comment}</p>}
  </div>
);

export default FeedbackReviews;
