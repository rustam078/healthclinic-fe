import { useEffect, useRef, useState } from 'react';

/**
 * Saves `value` a moment after it stops changing. Returns the status for the "Saved" indicator and
 * `flush()` to save immediately. Pending changes are also saved when leaving the page.
 */
export function useAutosave(value, save, { enabled, delay = 1500 }) {
  const [status, setStatus] = useState('saved');
  const serialized = JSON.stringify(value);
  const lastSaved = useRef(serialized);
  const latest = useRef({ serialized, value });
  latest.current = { serialized, value };

  const run = async () => {
    const { serialized: snapshot, value: payload } = latest.current;
    if (snapshot === lastSaved.current) return;
    setStatus('saving');
    try {
      await save(payload);
      lastSaved.current = snapshot;
      setStatus(latest.current.serialized === snapshot ? 'saved' : 'unsaved');
    } catch {
      setStatus('error');
    }
  };

  useEffect(() => {
    if (!enabled || serialized === lastSaved.current) return undefined;
    setStatus('unsaved');
    const timer = setTimeout(run, delay);
    return () => clearTimeout(timer);
  }, [serialized, enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => { if (enabled) run(); }, [enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  return { status, flush: run, markSaved: () => { lastSaved.current = latest.current.serialized; setStatus('saved'); } };
}
