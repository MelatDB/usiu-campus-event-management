import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Event } from '../types';
import { eventService, registrationService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useFavorites } from '../hooks/useFavorites';
import Navbar from '../components/Navbar';
import EventCard from '../components/EventCard';
import EventModal from '../components/EventModal';
import SearchFilters, { EventFilters } from '../components/SearchFilters';
import Pagination from '../components/Pagination';
import './Browse.css';

const PAGE_SIZE = 12;

const Browse: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '0', 10));
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [registeredEventIds, setRegisteredEventIds] = useState<Set<number>>(new Set());
  const [filters, setFilters] = useState<EventFilters>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const favorites = useFavorites(true);
  const toast = useToast();

  const loadRegistrations = useCallback(async () => {
    try {
      const data = await registrationService.getMyRegistrations({ size: 200 });
      setRegisteredEventIds(
        new Set(data.content.filter((r) => r.registrationStatus === 'REGISTERED').map((r) => r.eventId))
      );
    } catch {
      setRegisteredEventIds(new Set());
    }
  }, []);

  useEffect(() => {
    loadRegistrations();
  }, [loadRegistrations]);

  const loadEvents = useCallback(
    async (pageNum: number, currentFilters: EventFilters) => {
      setLoading(true);
      try {
        const data = await eventService.getAll({
          ...currentFilters,
          page: pageNum,
          size: PAGE_SIZE,
          sort: 'startDateTime,asc',
        });
        setEvents(data.content);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
      } catch (error) {
        console.error('Error loading events:', error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    loadEvents(page, filters);
  }, [page, filters, loadEvents]);

  const handleSearch = (newFilters: EventFilters) => {
    setFilters(newFilters);
    setPage(0);
    setSearchParams({});
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRegister = async (eventId: number) => {
    try {
      await registrationService.register(eventId);
      toast.success('You have registered for this event!');
      await loadRegistrations();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Registration failed');
    }
  };

  const handleToggleFavorite = async (eventId: number) => {
    await favorites.toggleFavorite(eventId);
  };

  return (
    <div className="browse-page">
      <Navbar />

      <div className="main-container">
        <div className="page-header">
          <h1>
            <i className="fas fa-compass"></i> Browse Events
          </h1>
          <p>Search, filter and discover campus events that interest you</p>
        </div>

        <SearchFilters onSearch={handleSearch} />

        <div className="browse-toolbar">
          <span className="browse-count">
            <i className="fas fa-calendar-alt"></i> {totalElements} event{totalElements !== 1 ? 's' : ''} found
          </span>
          <div className="view-toggle">
            <button
              className={viewMode === 'grid' ? 'active' : ''}
              onClick={() => setViewMode('grid')}
              title="Grid view"
            >
              <i className="fas fa-th-large"></i>
            </button>
            <button
              className={viewMode === 'list' ? 'active' : ''}
              onClick={() => setViewMode('list')}
              title="List view"
            >
              <i className="fas fa-list"></i>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="card empty-state">
            <i className="fas fa-search"></i>
            <h3>No Events Found</h3>
            <p>Try adjusting your search filters</p>
          </div>
        ) : (
          <>
            <div className={viewMode === 'grid' ? 'events-grid' : 'events-list'}>
              {events.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  userRole={user?.role || ''}
                  isFavorite={favorites.isFavorite(event.id)}
                  onToggleFavorite={handleToggleFavorite}
                  onView={(e) => setSelectedEvent(e)}
                  onRegister={handleRegister}
                />
              ))}
            </div>

            <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
          </>
        )}
      </div>

      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          userRole={user?.role || ''}
          isRegistered={registeredEventIds.has(selectedEvent.id)}
          isFavorite={favorites.isFavorite(selectedEvent.id)}
          onToggleFavorite={handleToggleFavorite}
          onRegister={handleRegister}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
};

export default Browse;
