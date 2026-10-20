import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import { mockUser } from '../lib/mockData';

// Mock-mode changes only live in memory within React component state.
// A page refresh resets everything back to initial mockData; no localStorage or sessionStorage is used.
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

/**
 * Normalizes item payload before sending or storing:
 * - Strips out any user field (the backend sets owner from HTTP-only cookie).
 * - Normalizes tags to unique, lowercase, trimmed strings.
 */
function sanitizeData(data = {}) {
  const payload = { ...data };
  delete payload.user;

  if (payload.tags !== undefined) {
    let tagList = [];
    if (Array.isArray(payload.tags)) {
      tagList = payload.tags;
    } else if (typeof payload.tags === 'string') {
      tagList = payload.tags.split(',');
    }
    payload.tags = Array.from(
      new Set(
        tagList
          .map((t) => (typeof t === 'string' ? t.trim().toLowerCase() : ''))
          .filter(Boolean)
      )
    );
  }

  return payload;
}

export default function useItems(endpoint, mockItems = []) {
  const [items, setItems] = useState(() => (USE_MOCK ? [...mockItems] : []));
  const [loading, setLoading] = useState(!USE_MOCK);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    // In mock mode, data is initialized from props/mockItems in memory. Skip network calls.
    if (USE_MOCK) {
      return;
    }

    let ignore = false;

    api
      .get(endpoint)
      .then((res) => {
        if (!ignore) {
          const data = res.data?.items ?? res.data;
          setItems(Array.isArray(data) ? data : []);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err.response?.data?.message || 'Could not load items.');
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [endpoint, reloadKey]);

  const reload = useCallback(() => {
    setLoading(true);
    setError('');
    setReloadKey((prev) => prev + 1);
  }, []);

  const createItem = useCallback(
    async (data) => {
      const payload = sanitizeData(data);

      if (USE_MOCK) {
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        const now = new Date().toISOString();
        const newItem = {
          ...data,
          ...payload,
          _id: `mock_${Date.now()}_${randomSuffix}`,
          user: mockUser.id,
          isPublic: data.isPublic ?? false,
          tags: payload.tags ?? [],
          createdAt: now,
          updatedAt: now,
        };

        setItems((prev) => [newItem, ...prev]);
        return newItem;
      }

      const res = await api.post(endpoint, payload);
      const createdItem = res.data?.item ?? res.data;
      setItems((prev) => [createdItem, ...prev]);
      return createdItem;
    },
    [endpoint]
  );

  const updateItem = useCallback(
    async (id, data) => {
      const payload = sanitizeData(data);

      if (USE_MOCK) {
        let updatedItem = null;
        setItems((prev) =>
          prev.map((item) => {
            if (item._id === id) {
              updatedItem = {
                ...item,
                ...data,
                ...payload,
                updatedAt: new Date().toISOString(),
              };
              return updatedItem;
            }
            return item;
          })
        );
        return updatedItem;
      }

      const res = await api.patch(`${endpoint}/${id}`, payload);
      const savedItem = res.data?.item ?? res.data;
      setItems((prev) =>
        prev.map((item) => (item._id === id ? savedItem : item))
      );
      return savedItem;
    },
    [endpoint]
  );

  const deleteItem = useCallback(
    async (id) => {
      if (USE_MOCK) {
        setItems((prev) => prev.filter((item) => item._id !== id));
        return;
      }

      await api.delete(`${endpoint}/${id}`);
      setItems((prev) => prev.filter((item) => item._id !== id));
    },
    [endpoint]
  );

  const togglePublic = useCallback(
    async (item) => {
      return updateItem(item._id, { isPublic: !item.isPublic });
    },
    [updateItem]
  );

  return {
    items,
    loading,
    error,
    reload,
    createItem,
    updateItem,
    deleteItem,
    togglePublic,
  };
}
