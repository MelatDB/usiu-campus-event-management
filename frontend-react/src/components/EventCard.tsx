import React from 'react';
import { Event } from '../types';
import './EventCard.css';

interface EventCardProps {
  event: Event;
  userRole: string;
  isFavorite?: boolean;
  onToggleFavorite?: (eventId: number) => void;
  onView: (event: Event) => void;
  onRegister?: (eventId: number) => void;
}

const EventCard: React.FC<EventCardProps> = ({
  event,
  userRole,
  isFavorite,
  onToggleFavorite,
  onView,
  onRegister,
}) => {
  const startDate = new Date(event.startDateTime);
  const endDate = new Date(event.endDateTime);

  const formattedDate = startDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const formattedTime = startDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const durationHours = Math.max(0, (endDate.getTime() - startDate.getTime()) / 3600000);
  const durationText = durationHours < 1 ? `${Math.round(durationHours * 60)} min` : `${Math.round(durationHours)} hrs`;

  const isFull = event.currentParticipants >= event.maximumCapacity;
  const capacityPercent = Math.min(
    100,
    Math.round((event.currentParticipants / event.maximumCapacity) * 100)
  );

  const getApprovalClass = () => {
    switch (event.approvalStatus) {
      case 'APPROVED':
        return 'approved';
      case 'REJECTED':
        return 'rejected';
      case 'CHANGES_REQUESTED':
        return 'changes';
      default:
        return 'pending';
    }
  };

  const canRegister =
    userRole === 'STUDENT' &&
    !isFull &&
    event.approvalStatus === 'APPROVED' &&
    event.eventStatus === 'PUBLISHED';

  return (
    <div className="event-card" onClick={() => onView(event)}>
      <div className={`event-card-top ${getApprovalClass()}`}>
        <div className="event-date-badge">
          <span className="edb-day">{startDate.getDate()}</span>
          <span className="edb-month">
            {startDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
          </span>
        </div>
        <div className="event-card-icons">
          {userRole === 'STUDENT' && onToggleFavorite && (
            <button
              className={`fav-btn ${isFavorite ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(event.id);
              }}
              title={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
            >
              <i className={`fas ${isFavorite ? 'fa-heart' : 'fa-heart-o'}`}></i>
            </button>
          )}
        </div>
      </div>

      <div className="event-card-body">
        <div className="event-card-badges">
          {event.categoryName && (
            <span className="ec-badge category">
              <i className="fas fa-tag"></i> {event.categoryName}
            </span>
          )}
          {event.openToAllStudents && (
            <span className="ec-badge all">
              <i className="fas fa-globe-africa"></i> Open to all
            </span>
          )}
          {event.targetSchoolName && !event.openToAllStudents && (
            <span className="ec-badge school">
              <i className="fas fa-school"></i> {event.targetSchoolName}
            </span>
          )}
        </div>

        <h3 className="event-card-title">{event.title}</h3>
        <p className="event-card-desc">
          {event.description.length > 130
            ? event.description.slice(0, 130) + '...'
            : event.description}
        </p>

        <div className="event-card-meta">
          <div className="ec-meta-row">
            <i className="fas fa-calendar-day"></i>
            <span>{formattedDate}</span>
          </div>
          <div className="ec-meta-row">
            <i className="fas fa-clock"></i>
            <span>
              {formattedTime} ({durationText})
            </span>
          </div>
          <div className="ec-meta-row">
            <i className="fas fa-map-marker-alt"></i>
            <span>{event.venueName || 'TBA'}</span>
          </div>
          <div className="ec-meta-row">
            <i className="fas fa-users"></i>
            <span>
              {event.currentParticipants}/{event.maximumCapacity} participants
            </span>
          </div>
        </div>

        <div className="capacity-bar">
          <div className="capacity-fill" style={{ width: `${capacityPercent}%` }}></div>
        </div>

        <div className="event-card-footer">
          <span className={`ec-status ${getApprovalClass()}`}>
            {event.approvalStatus === 'APPROVED' && event.eventStatus === 'CANCELLED'
              ? 'CANCELLED'
              : event.approvalStatus}
          </span>
          <div className="ec-footer-actions">
            {canRegister && onRegister && (
              <button
                className="btn btn-primary btn-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onRegister(event.id);
                }}
              >
                <i className="fas fa-user-plus"></i> Register
              </button>
            )}
            <button
              className="btn btn-cream btn-sm"
              onClick={(e) => {
                e.stopPropagation();
                onView(event);
              }}
            >
              <i className="fas fa-eye"></i> Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
