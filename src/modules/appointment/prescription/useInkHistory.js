import { useCallback, useState } from 'react';

const LIMIT = 200;

/** Undo / redo over several ink areas together, e.g. { rx: [...strokes], wt: [...strokes] }. */
export function useInkHistory(initial) {
  const [history, setHistory] = useState({ past: [], present: initial, future: [] });

  const commit = useCallback((next) => setHistory((h) => ({
    past: [...h.past, h.present].slice(-LIMIT), present: next(h.present), future: [],
  })), []);

  const undo = useCallback(() => setHistory((h) => (h.past.length ? {
    past: h.past.slice(0, -1), present: h.past[h.past.length - 1], future: [h.present, ...h.future],
  } : h)), []);

  const redo = useCallback(() => setHistory((h) => (h.future.length ? {
    past: [...h.past, h.present], present: h.future[0], future: h.future.slice(1),
  } : h)), []);

  return {
    state: history.present,
    add: (area, stroke) => commit((present) => ({ ...present, [area]: [...present[area], stroke] })),
    clear: () => commit((present) => Object.fromEntries(Object.keys(present).map((area) => [area, []]))),
    undo,
    redo,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
  };
}
