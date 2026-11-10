import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Event, Favorite } from '../types';
import { favoriteService, eventService, registrationService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useFavorites } from '../hooks/useFavorites';
import Navbar from '../components/Navbar';
import EventCard from '../components/EventCard';
import EventModal from '../components/EventModal';
import Pagination from '../components/Pagination';
import './Favorites.css';

const PAGE_SIZE = 12;

const Favorites: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [registeredEventIds, setRegisteredEventIds] = useState<Set<number>>(new Set());

  const favoritesHook = useFavorites(true);

  const loadFavorites = useCallback(async (pageNum: number) => {
    setLoading(true);
    try {
      const data = await favoriteService.getAll({ page: pageNum, size: PAGE_SIZE });
      setFavorites(data.content);
      setTotalPages(data.totalPages);

      const eventsData = await Promise.all(
        data.content.map((fav) => eventService.getById(fav.eventId).catch(() => null))
      );
      setEvents(eventsData.filter((e): e is Event => e !== null));

      const regs = await registrationService.getMyRegistrations({ size: 200 });
      setRegisteredEventIds(
        new Set(regs.content.filter((r) => r.registrationStatus === 'REGISTERED').map((r) => r.eventId))
      );
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFavorites(page);
  }, [loadFavorites, page]);

  const handleRemove = async (eventId: number) => {
    try {
      await favoriteService.remove(eventId);
      toast.success('Removed from favorites.');
      await favoritesHook.toggleFavorite(eventId);
      await loadFavorites(page);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to remove favorite');
    }
  };

  const handleRegister = async (eventId: number) => {
    try {
      await registrationService.register(eventId);
      toast.success('You have registered for this event!');
      await loadFavorites(page);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Registration failed');
    }
  };

  const handleToggleFavorite = async (eventId: number) => {
    await favoritesHook.toggleFavorite(eventId);
  };

  return (
    <div className="favorites-page">
      <Navbar />

      <div className="main-container">
        <div className="page-header">
          <h1>
            <i className="fas fa-heart"></i> My Favorite Events
          </h1>
          <p>Events you've saved to register for later</p>
        </div>

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading favorites...</p>
          </div>
        ) : favorites.length === 0 ? (
          <div className="card empty-state">
            <i className="fas fa-heart-broken"></i>
            <h3>No Favorite Events</h3>
            <p>Tap the heart icon on any event to save it here</p>
            <button className="btn btn-primary" onClick={() => navigate('/browse')}>
              <i className="fas fa-compass"></i> Browse Events
            </button>
          </div>
        ) : (
          <>
            <div className="events-grid">
              {events.map((event) => (
                <div key={event.id} className="favorite-card-wrap">
                  <EventCard
                    event={event}
                    userRole={user?.role || ''}
                    isFavorite
                    onToggleFavorite={handleToggleFavorite}
                    onView={(e) => setSelectedEvent(e)}
                    onRegister={handleRegister}
                  />
                  <button
                    className="remove-fav-btn"
                    onClick={() => handleRemove(event.id)}
                    title="Remove from favorites"
                  >
                    <i className="fas fa-heart-broken"></i>
                  </button>
                </div>
              ))}
            </div>

            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </div>

      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          userRole={user?.role || ''}
          isRegistered={registeredEventIds.has(selectedEvent.id)}
          isFavorite
          onToggleFavorite={handleToggleFavorite}
          onRegister={handleRegister}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
};

export default Favorites;
