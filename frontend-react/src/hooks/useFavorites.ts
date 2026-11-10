import { useState, useEffect, useCallback, useRef } from 'react';
import { favoriteService } from '../services/api';
import { useToast } from '../context/ToastContext';

export function useFavorites(enabled: boolean) {
  const toast = useToast();
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [loaded, setLoaded] = useState(false);
  const loadedRef = useRef(false);

  const loadFavorites = useCallback(async () => {
    try {
      const data = await favoriteService.getAll({ size: 200 });
      setFavoriteIds(new Set(data.content.map((f) => f.eventId)));
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoaded(true);
      loadedRef.current = true;
    }
  }, []);

  useEffect(() => {
    if (enabled && !loadedRef.current) {
      loadFavorites();
    }
  }, [enabled, loadFavorites]);

  const isFavorite = useCallback(
    (eventId: number) => favoriteIds.has(eventId),
    [favoriteIds]
  );

  const toggleFavorite = useCallback(
    async (eventId: number) => {
      const isFav = favoriteIds.has(eventId);
      try {
        if (isFav) {
          await favoriteService.remove(eventId);
          setFavoriteIds((prev) => {
            const next = new Set(prev);
            next.delete(eventId);
            return next;
          });
        } else {
          await favoriteService.add(eventId);
          setFavoriteIds((prev) => new Set(prev).add(eventId));
        }
      } catch (error: any) {
        toast.error(error?.response?.data?.message || 'Failed to update favorite');
      }
    },
    [favoriteIds]
  );

  return { favoriteIds, isFavorite, toggleFavorite, reload: loadFavorites, loaded };
}
