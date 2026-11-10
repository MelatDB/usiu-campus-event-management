import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Event } from '../types';
import { eventService, registrationService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useFavorites } from '../hooks/useFavorites';
import Navbar from '../components/Navbar';
import EventCard from '../components/EventCard';
import EventModal from '../components/EventModal';
import SearchFilters, { EventFilters } from '../components/SearchFilters';
import './Dashboard.css';

interface Section {
  key: string;
  title: string;
  icon: string;
  events: Event[];
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [registeredEventIds, setRegisteredEventIds] = useState<Set<number>>(new Set());

  const isStudent = user?.role === 'STUDENT';
  const favorites = useFavorites(isStudent);
  const toast = useToast();

  const loadRegistrations = useCallback(async () => {
    try {
      const data = await registrationService.getMyRegistrations({ size: 200 });
      setRegisteredEventIds(
        new Set(
          data.content
            .filter((r) => r.registrationStatus === 'REGISTERED')
            .map((r) => r.eventId)
        )
      );
    } catch {
      setRegisteredEventIds(new Set());
    }
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (isStudent) {
        const dashboard = await eventService.getDashboard();
        const filterActive = (events: Event[]) =>
          events.filter(
            (e) => e.eventStatus !== 'CANCELLED' && e.eventStatus !== 'COMPLETED'
          );
        setSections([
          {
            key: 'recommended',
            title: 'Recommended For You',
            icon: 'fa-star',
            events: filterActive(dashboard.recommendedEvents),
          },
          {
            key: 'upcoming',
            title: 'Upcoming Events',
            icon: 'fa-calendar-check',
            events: filterActive(dashboard.upcomingEvents),
          },
          {
            key: 'trending',
            title: 'Trending Events',
            icon: 'fa-fire',
            events: filterActive(dashboard.trendingEvents),
          },
          {
            key: 'university',
            title: 'University-wide Events',
            icon: 'fa-globe-africa',
            events: filterActive(dashboard.universityWideEvents),
          },
          {
            key: 'recent',
            title: 'Recently Added',
            icon: 'fa-clock',
            events: filterActive(dashboard.recentlyAddedEvents),
          },
        ]);
      } else if (user?.role === 'CLUB_ORGANIZER') {
        const data = await eventService.getOrganizerEvents({ size: 50 });
        setSections([
          { key: 'myevents', title: 'My Events', icon: 'fa-calendar-check', events: data.content },
        ]);
      } else {
        const data = await eventService.getAll({ size: 50 });
        setSections([
          { key: 'allevents', title: 'All Events', icon: 'fa-calendar-check', events: data.content },
        ]);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, [isStudent, user?.role]);

  useEffect(() => {
    loadData();
    if (isStudent) loadRegistrations();
  }, [loadData, loadRegistrations, isStudent]);

  const handleSearch = (filters: EventFilters) => {
    setLoading(true);
    eventService
      .getAll({ ...filters, size: 50 })
      .then((data) => {
        setSections([
          {
            key: 'results',
            title: `Search Results (${data.totalElements})`,
            icon: 'fa-search',
            events: data.content.filter(
              (e) =>
                e.eventStatus !== 'CANCELLED' && e.eventStatus !== 'COMPLETED'
            ),
          },
        ]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleRegister = async (eventId: number) => {
    try {
      await registrationService.register(eventId);
      toast.success('You have registered for this event!');
      await Promise.all([loadData(), loadRegistrations()]);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Registration failed');
    }
  };

  const handleToggleFavorite = async (eventId: number) => {
    await favorites.toggleFavorite(eventId);
  };

  const visibleSections = sections.filter((s) => s.events.length > 0);

  return (
    <div className="dashboard-page">
      <Navbar />

      <div className="main-container">
        <div className="welcome-banner">
          <div className="welcome-text">
            <h1>
              <i className="fas fa-hand-peace"></i> Karibu, {user?.firstName}!
            </h1>
            <p>
              {isStudent
                ? 'Discover events recommended for you based on your school, program and year of study.'
                : 'Manage and keep track of campus events.'}
            </p>
          </div>
          <div className="welcome-actions">
            {isStudent && (
              <button className="btn btn-outline" onClick={() => navigate('/organizer-apply')}>
                <i className="fas fa-user-tie"></i> Become an Organizer
              </button>
            )}
            {user?.role === 'CLUB_ORGANIZER' && (
              <button className="btn btn-gold" onClick={() => navigate('/events/create')}>
                <i className="fas fa-plus-circle"></i> Create Event
              </button>
            )}
            {user?.role === 'ADMINISTRATOR' && (
              <>
                <button className="btn btn-gold" onClick={() => navigate('/analytics')}>
                  <i className="fas fa-chart-bar"></i> Analytics
                </button>
                <button className="btn btn-outline" onClick={() => navigate('/approvals')}>
                  <i className="fas fa-check-double"></i> Approvals
                </button>
              </>
            )}
          </div>
        </div>

        {isStudent && <SearchFilters onSearch={handleSearch} />}

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading events...</p>
          </div>
        ) : visibleSections.length === 0 ? (
          <div className="card empty-state">
            <i className="fas fa-calendar-times"></i>
            <h3>No Events Available</h3>
            <p>Check back later for upcoming campus events</p>
          </div>
        ) : (
          visibleSections.map((section) => (
            <section key={section.key} className="events-section">
              <h2 className="section-title">
                <i className={`fas ${section.icon}`}></i>
                {section.title}
                <span className="section-sub">{section.events.length} events</span>
              </h2>
              <div className="events-grid">
                {section.events.map((event) => (
                  <EventCard
                    key={`${section.key}-${event.id}`}
                    event={event}
                    userRole={user?.role || ''}
                    isFavorite={favorites.isFavorite(event.id)}
                    onToggleFavorite={isStudent ? handleToggleFavorite : undefined}
                    onView={(e) => setSelectedEvent(e)}
                    onRegister={isStudent ? handleRegister : undefined}
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </div>

      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          userRole={user?.role || ''}
          isRegistered={registeredEventIds.has(selectedEvent.id)}
          isFavorite={favorites.isFavorite(selectedEvent.id)}
          onToggleFavorite={isStudent ? handleToggleFavorite : undefined}
          onRegister={handleRegister}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;
