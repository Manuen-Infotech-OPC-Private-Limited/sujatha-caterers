import React, { createContext, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import useAuth from '../hooks/useAuth';

const SSEContext = createContext(null);

export const SSEProvider = ({ children }) => {
  const { user } = useAuth();
  const esRef = useRef(null);
  const seenIds = useRef(new Set());

  useEffect(() => {
    if (!user) return;

    // The session lives in an httpOnly cookie, so there is no token to put in
    // the URL — withCredentials sends it. This used to read a `token` that
    // useAuth never returned, so the guard below always tripped and the stream
    // never opened at all.
    const API = process.env.REACT_APP_API_URL;
    const url = user.role === 'admin' ? `${API}/sse/admin` : `${API}/sse/user`;

    const es = new EventSource(url, { withCredentials: true });
    esRef.current = es;

    // ✅ capture ref value once per effect
    const seenIdsSet = seenIds.current;

    es.onopen = () => {
      console.log('[SSE] connected');
    };

    es.onerror = () => {
      console.warn('[SSE] connection lost, retrying…');
    };

    const handle = (event, cb) => {
      es.addEventListener(event, e => {
        const id = e.lastEventId;
        if (id && seenIdsSet.has(id)) return;
        if (id) seenIdsSet.add(id);

        cb(JSON.parse(e.data));
      });
    };

    handle('order_created', () => {
      toast.info('🆕 New order received');
    });

    handle('order_updated', () => {
      toast.info('📦 Order updated');
    });

    handle('order_status_updated', data => {
      toast.info(`🚚 Order ${data.status}`);
    });

    return () => {
      es.close();
      esRef.current = null;
      seenIdsSet.clear(); // ✅ safe cleanup
    };
  }, [user]);

  return (
    <SSEContext.Provider value={null}>
      {children}
    </SSEContext.Provider>
  );
};

export default SSEContext;
