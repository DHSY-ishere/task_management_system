import { useCallback, useEffect, useRef, useState } from 'react';
import { taskApi } from '../services/api';

/**
 * Fetches the task list for the given query params and exposes a `reload`
 * function to refresh after create / update / delete.
 */
export default function useTasks(params) {
  const [tasks, setTasks] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const controllerRef = useRef(null);

  const paramsKey = JSON.stringify(params);

  useEffect(() => {
    // Cancel any in-flight request so stale responses never overwrite newer ones
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setLoading(true);
    setError(null);

    taskApi
      .list(JSON.parse(paramsKey), controller.signal)
      .then(({ data, meta: m }) => {
        setTasks(data);
        setMeta(m);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setError(err.message);
        setLoading(false);
      });

    return () => controller.abort();
  }, [paramsKey, reloadKey]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  return { tasks, meta, loading, error, reload };
}
