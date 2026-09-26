import { useEffect, useRef } from 'react';

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/** Shared behaviour for modal and drawer: Esc closes, page scroll locks, focus moves inside and stays there. */
export function useOverlay(open, onClose, panelRef) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.activeElement;
    const onKey = (event) => handleKey(event, () => closeRef.current(), panelRef.current);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => focusFirst(panelRef.current));
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      previous?.focus?.();
    };
  }, [open, panelRef]);
}

function focusFirst(panel) {
  const target = panel?.querySelector('[data-autofocus]') || panel?.querySelector(FOCUSABLE);
  target?.focus();
}

function handleKey(event, close, panel) {
  if (event.key === 'Escape') close();
  if (event.key !== 'Tab' || !panel) return;
  const items = [...panel.querySelectorAll(FOCUSABLE)].filter((el) => !el.disabled);
  if (items.length === 0) return;
  const [first, last] = [items[0], items[items.length - 1]];
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
}
