import { useCallback, useEffect, useRef } from 'react';
import { ERASER_SIZE, PAD, drawStroke, renderStrokes } from './ink';

const round = (value) => Math.round(value * 10) / 10;

/**
 * Writing surface for stylus, finger or mouse, shaped like the template's Rx area (`ratio` = height / width).
 * Once a stylus is used, finger/palm touches are ignored (palm rejection) unless `allowFinger` is on.
 */
export default function InkCanvas({ strokes, onStroke, tool, color, size, readOnly, allowFinger, onPenDetected, ratio, penScale = 1 }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const strokesRef = useRef(strokes);
  const ratioRef = useRef(ratio);
  const current = useRef(null);
  const fingerBlocked = useRef(!allowFinger);
  strokesRef.current = strokes;
  ratioRef.current = ratio;

  const fit = useCallback(() => {
    const canvas = canvasRef.current;
    const width = wrapRef.current.clientWidth;
    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(width * ratioRef.current * pixelRatio);
    renderStrokes(canvas, strokesRef.current);
  }, []);

  useEffect(() => {
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(wrapRef.current);
    return () => observer.disconnect();
  }, [fit]);
  useEffect(() => { if (canvasRef.current.width) renderStrokes(canvasRef.current, strokes); }, [strokes]);
  useEffect(() => { fingerBlocked.current = !allowFinger; }, [allowFinger]);

  /** Both axes in thousandths of the width, so strokes keep their shape at any size or zoom. */
  const toPoint = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return [round(((event.clientX - rect.left) / rect.width) * PAD.width), round(((event.clientY - rect.top) / rect.width) * PAD.width)];
  };
  const accepts = (event) => !readOnly && (event.pointerType !== 'touch' || !fingerBlocked.current);
  const scale = () => canvasRef.current.width / PAD.width;

  const start = (event) => {
    if (event.pointerType === 'pen' && !current.current && onPenDetected?.()) fingerBlocked.current = true;
    if (!accepts(event)) return;
    event.preventDefault();
    try { canvasRef.current.setPointerCapture(event.pointerId); } catch { /* pointer already gone */ }
    current.current = { tool, color, size: (tool === 'eraser' ? ERASER_SIZE : size) * penScale, points: [toPoint(event)] };
    drawStroke(canvasRef.current.getContext('2d'), current.current, scale());
  };

  const move = (event) => {
    const stroke = current.current;
    if (!stroke) return;
    const coalesced = event.nativeEvent.getCoalescedEvents?.();
    const events = coalesced?.length ? coalesced : [event.nativeEvent];
    events.forEach((e) => stroke.points.push(toPoint(e)));
    drawStroke(canvasRef.current.getContext('2d'), { ...stroke, points: stroke.points.slice(-events.length - 1) }, scale());
  };

  const end = () => {
    if (current.current) onStroke(current.current);
    current.current = null;
  };

  return (
    <div ref={wrapRef} className="absolute inset-0">
      <canvas
        ref={canvasRef}
        aria-label={readOnly ? 'Prescription' : 'Prescription writing area'}
        role="img"
        className={`h-full w-full ${readOnly ? '' : tool === 'eraser' ? 'cursor-cell' : 'cursor-crosshair'}`}
        style={{ touchAction: readOnly ? 'auto' : 'none' }}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerCancel={end}
        onPointerLeave={end}
      />
    </div>
  );
}
