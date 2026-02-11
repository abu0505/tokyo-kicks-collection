import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const MAX_ITEMS = 10;
const STORAGE_KEY = 'recently_viewed_storage';

// Helper to read from localStorage synchronously
const getStoredIds = (): string[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Helper to save to localStorage
const saveToStorage = (ids: string[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
};

export const useRecentlyViewed = () => {
  const { user } = useAuth();

  // Initialize from localStorage synchronously to prevent flicker on navigation
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>(getStoredIds);

  // Sync with Supabase for logged-in users (DB is the source of truth)
  useEffect(() => {
    if (!user) return;

    const syncWithDb = async () => {
      try {
        const { data, error } = await supabase
          .from('recently_viewed')
          .select('shoe_id')
          .eq('user_id', user.id)
          .order('viewed_at', { ascending: false })
          .limit(MAX_ITEMS);

        if (error) {
          console.error('Error loading recently viewed from DB:', error);
          return;
        }

        if (data) {
          const ids = data.map(item => item.shoe_id);
          setRecentlyViewed(ids);
          saveToStorage(ids); // Cache DB result in localStorage
        }
      } catch (error) {
        console.error('Error in syncWithDb:', error);
      }
    };

    syncWithDb();
  }, [user]);

  const addToRecentlyViewed = useCallback(async (shoeId: string) => {
    // Optimistic update
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((id) => id !== shoeId);
      const newIds = [shoeId, ...filtered].slice(0, MAX_ITEMS);
      saveToStorage(newIds); // Always cache locally
      return newIds;
    });

    if (!user) return;

    // Save to Supabase
    try {
      const { error } = await supabase
        .from('recently_viewed')
        .upsert({
          user_id: user.id,
          shoe_id: shoeId,
          viewed_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,shoe_id'
        });

      if (error) {
        console.error('Error adding to recently viewed DB:', error);
      }
    } catch (error) {
      console.error('Error in addToRecentlyViewed DB:', error);
    }
  }, [user]);

  const removeFromRecentlyViewed = useCallback(async (shoeId: string) => {
    // Optimistic update
    setRecentlyViewed((prev) => {
      const newIds = prev.filter((id) => id !== shoeId);
      saveToStorage(newIds); // Always cache locally
      return newIds;
    });

    if (!user) return;

    // Remove from Supabase
    try {
      const { error } = await supabase
        .from('recently_viewed')
        .delete()
        .eq('user_id', user.id)
        .eq('shoe_id', shoeId);

      if (error) {
        console.error('Error removing from recently viewed DB:', error);
      }
    } catch (error) {
      console.error('Error in removeFromRecentlyViewed DB:', error);
    }
  }, [user]);

  const clearRecentlyViewed = useCallback(async () => {
    // Optimistic update
    setRecentlyViewed([]);
    localStorage.removeItem(STORAGE_KEY);

    if (!user) return;

    // Clear from Supabase
    try {
      const { error } = await supabase
        .from('recently_viewed')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('Error clearing recently viewed DB:', error);
      }
    } catch (error) {
      console.error('Error in clearRecentlyViewed DB:', error);
    }
  }, [user]);

  return {
    recentlyViewed,
    addToRecentlyViewed,
    removeFromRecentlyViewed,
    clearRecentlyViewed,
  };
};
