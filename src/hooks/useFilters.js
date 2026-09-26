import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

const BASE = { page: 0, size: 20 };

/**
 * Keeps list filters (search, status, page ...) in the URL so they survive refresh and back navigation.
 * A value equal to its default is left out of the URL. Changing any filter other than `page` resets to page 1.
 */
export function useFilters(defaults = {}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const initial = useMemo(() => ({ ...BASE, ...defaults }), []); // eslint-disable-line react-hooks/exhaustive-deps

  const filters = useMemo(() => {
    const values = { ...initial };
    Object.keys(values).forEach((key) => {
      const raw = searchParams.get(key);
      if (raw !== null) values[key] = typeof initial[key] === 'number' ? Number(raw) : raw;
    });
    return values;
  }, [searchParams, initial]);

  const setFilters = useCallback((changes) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      Object.entries(changes).forEach(([key, value]) => writeParam(next, key, value, initial[key]));
      if (!('page' in changes)) next.delete('page');
      return next;
    }, { replace: true });
  }, [setSearchParams, initial]);

  return [filters, setFilters];
}

function writeParam(params, key, value, fallback) {
  const normalised = value ?? '';
  if (String(normalised) === String(fallback ?? '')) params.delete(key);
  else params.set(key, normalised);
}
