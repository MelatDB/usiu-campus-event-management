import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Event } from '../types';
import './EventModal.css';

interface EventModalProps {
  event: Event;
  userRole: string;
  isRegistered?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: (eventId: number) => void;
  onRegister: (eventId: number) => void;
  onClose: () => void;
}

const EventModal: React.FC<EventModalProps> = ({
  event,
  userRole,
  isRegistered,
  isFavorite,
  onToggleFavorite,
  onRegister,
  onClose,
}) => {
  const navigate = useNavigate();

  const startDate = new Date(event.startDateTime);
  const endDate = new Date(event.endDateTime);

  const formatDateTime = (date: Date) =>
    date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const isFull = event.currentParticipants >= event.maximumCapacity;
  const isCancelled = event.eventStatus === 'CANCELLED';
  const canRegister =
    userRole === 'STUDENT' &&
    !isFull &&
    !isRegistered &&
    !isCancelled &&
    event.approvalStatus === 'APPROVED' &&
    event.eventStatus === 'PUBLISHED';

  const approvalClass =
    event.approvalStatus === 'APPROVED'
      ? 'badge badge-approved'
      : event.approvalStatus === 'REJECTED'
      ? 'badge badge-rejected'
      : 'badge badge-pending';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box event-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <i className="fas fa-calendar-check"></i> Event Details
          </h2>
          <button className="close-modal" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>

        <div className="modal-body">
          <div className="em-hero">
            <div>
              <h3>{event.title}</h3>
              <p className="em-org">
                <i className="fas fa-user-tie"></i> {event.organizerName}
                {event.clubName ? ` • ${event.clubName}` : ''}
              </p>
            </div>
            <span className={approvalClass}>{event.approvalStatus}</span>
          </div>

          {event.description && (
            <div className="em-section">
              <h4>
                <i className="fas fa-align-left"></i> About this event
              </h4>
              <p>{event.description}</p>
            </div>
          )}

          <div className="em-section">
            <h4>
              <i className="fas fa-clock"></i> Schedule
            </h4>
            <div className="em-grid">
              <div className="em-item">
                <div className="em-item-label">Starts</div>
                <div className="em-item-value">{formatDateTime(startDate)}</div>
              </div>
              <div className="em-item">
                <div className="em-item-label">Ends</div>
                <div className="em-item-value">{formatDateTime(endDate)}</div>
              </div>
              {event.registrationDeadline && (
                <div className="em-item">
                  <div className="em-item-label">Registration deadline</div>
                  <div className="em-item-value">{formatDateTime(new Date(event.registrationDeadline))}</div>
                </div>
              )}
            </div>
          </div>

          <div className="em-section">
            <h4>
              <i className="fas fa-map-marker-alt"></i> Location & Capacity
            </h4>
            <div className="em-grid">
              <div className="em-item">
                <div className="em-item-label">Venue</div>
                <div className="em-item-value">{event.venueName || 'TBA'}</div>
              </div>
              <div className="em-item">
                <div className="em-item-label">Category</div>
                <div className="em-item-value">{event.categoryName || 'N/A'}</div>
              </div>
              <div className="em-item">
                <div className="em-item-label">Capacity</div>
                <div className="em-item-value">
                  {event.currentParticipants} / {event.maximumCapacity} registered
                  {isFull && <span className="em-full"> Full</span>}
                </div>
              </div>
              <div className="em-item">
                <div className="em-item-label">Audience</div>
                <div className="em-item-value">
                  {event.openToAllStudents
                    ? 'Open to all students'
                    : event.targetSchoolName || 'Targeted audience'}
                </div>
              </div>
            </div>
          </div>

          {event.targetProgramNames && event.targetProgramNames.length > 0 && (
            <div className="em-section">
              <h4>
                <i className="fas fa-graduation-cap"></i> Target programs
              </h4>
              <div className="em-tags">
                {event.targetProgramNames.map((name) => (
                  <span key={name} className="em-tag">
                    {name}
                  </span>
                ))}
                {event.targetYearOfStudy && (
                  <span className="em-tag">
                    Year {event.targetYearOfStudy}
                  </span>
                )}
              </div>
            </div>
          )}

          {isCancelled && (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i> This event has been cancelled.
            </div>
          )}
        </div>

        <div className="modal-footer">
          {onToggleFavorite && userRole === 'STUDENT' && (
            <button
              className={`btn ${isFavorite ? 'btn-danger' : 'btn-cream'}`}
              onClick={() => onToggleFavorite(event.id)}
            >
              <i className={`fas ${isFavorite ? 'fa-heart-broken' : 'fa-heart'}`}></i>
              {isFavorite ? 'Remove Favorite' : 'Save Favorite'}
            </button>
          )}
          {canRegister && (
            <button className="btn btn-primary" onClick={() => onRegister(event.id)}>
              <i className="fas fa-user-plus"></i> Register for Event
            </button>
          )}
          {isRegistered && userRole === 'STUDENT' && (
            <button className="btn btn-outline" onClick={() => navigate('/registrations')}>
              <i className="fas fa-clipboard-check"></i> View My Registration
            </button>
          )}
          <button className="btn btn-cream" onClick={onClose}>
            <i className="fas fa-times"></i> Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventModal;
