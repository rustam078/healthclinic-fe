import { Eraser, Hand, PenLine, Redo2, Trash2, Undo2 } from 'lucide-react';
import { COLORS, SIZES } from './ink';

const toolButton = (active) => `inline-flex size-10 items-center justify-center rounded-lg border text-slate-700 ${active ? 'border-brand-700 bg-brand-700 text-white' : 'border-slate-200 bg-white hover:bg-slate-50'}`;

/** Pen / eraser, colour, thickness, undo / redo / clear and finger-writing toggle. */
export default function PadToolbar({ pad, ink, onClear }) {
  const { tool, setTool, color, setColor, size, setSize, allowFinger, setAllowFinger } = pad;
  return (
    <div className="flex flex-wrap items-center gap-2" role="toolbar" aria-label="Writing tools">
      <button type="button" className={toolButton(tool === 'pen')} aria-pressed={tool === 'pen'} onClick={() => setTool('pen')} title="Pen"><PenLine className="size-5" /><span className="sr-only">Pen</span></button>
      <button type="button" className={toolButton(tool === 'eraser')} aria-pressed={tool === 'eraser'} onClick={() => setTool('eraser')} title="Eraser"><Eraser className="size-5" /><span className="sr-only">Eraser</span></button>
      <span className="mx-1 h-8 w-px bg-slate-200" aria-hidden />
      {COLORS.map((option) => (
        <button key={option.value} type="button" title={option.label} aria-label={`${option.label} ink`} aria-pressed={color === option.value && tool === 'pen'}
          onClick={() => { setColor(option.value); setTool('pen'); }}
          className={`size-8 rounded-full ring-offset-2 ${color === option.value && tool === 'pen' ? 'ring-2 ring-brand-600' : 'ring-1 ring-slate-200'}`} style={{ backgroundColor: option.value }} />
      ))}
      <span className="mx-1 h-8 w-px bg-slate-200" aria-hidden />
      {SIZES.map((option) => (
        <button key={option.value} type="button" title={option.label} aria-label={`${option.label} line`} aria-pressed={size === option.value}
          onClick={() => { setSize(option.value); setTool('pen'); }} className={toolButton(size === option.value && tool === 'pen')}>
          <span className="rounded-full bg-current" style={{ width: option.value * 2 + 2, height: option.value * 2 + 2 }} />
        </button>
      ))}
      <span className="mx-1 h-8 w-px bg-slate-200" aria-hidden />
      <button type="button" className={toolButton(false)} onClick={ink.undo} disabled={!ink.canUndo} title="Undo"><Undo2 className="size-5" /><span className="sr-only">Undo</span></button>
      <button type="button" className={toolButton(false)} onClick={ink.redo} disabled={!ink.canRedo} title="Redo"><Redo2 className="size-5" /><span className="sr-only">Redo</span></button>
      <button type="button" className={toolButton(false)} onClick={onClear} title="Clear page"><Trash2 className="size-5" /><span className="sr-only">Clear page</span></button>
      <button type="button" className={toolButton(allowFinger)} aria-pressed={allowFinger} onClick={() => setAllowFinger(!allowFinger)} title="Allow writing with finger">
        <Hand className="size-5" /><span className="sr-only">Allow writing with finger</span>
      </button>
    </div>
  );
}
