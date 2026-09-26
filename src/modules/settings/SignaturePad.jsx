import { useState } from 'react';
import { Eraser, Undo2 } from 'lucide-react';
import InkCanvas from '../appointment/prescription/InkCanvas';
import { SIGNATURE_RATIO } from '../appointment/prescription/PrescriptionSheet';
import Button from '../../components/ui/Button';

/** Draw the doctor's signature once (pen, finger or mouse); it is printed on every prescription. */
export default function SignaturePad({ strokes, onChange, readOnly }) {
  const [allowFinger] = useState(true);
  return (
    <div>
      <p className="mb-1 text-sm font-medium text-slate-700">Signature</p>
      <div className="relative w-full max-w-sm rounded-lg border border-dashed border-slate-300 bg-white" style={{ aspectRatio: `1 / ${SIGNATURE_RATIO}` }}>
        <InkCanvas strokes={strokes} onStroke={(stroke) => onChange([...strokes, stroke])} tool="pen" color="#0f172a" size={7}
          ratio={SIGNATURE_RATIO} readOnly={readOnly} allowFinger={allowFinger} />
        {strokes.length === 0 && <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-slate-400">Sign here</p>}
      </div>
      {!readOnly && (
        <div className="mt-2 flex gap-2">
          <Button size="sm" variant="secondary" icon={Undo2} disabled={!strokes.length} onClick={() => onChange(strokes.slice(0, -1))}>Undo</Button>
          <Button size="sm" variant="secondary" icon={Eraser} disabled={!strokes.length} onClick={() => onChange([])}>Clear</Button>
        </div>
      )}
      <p className="mt-1 text-xs text-slate-500">Printed automatically on every prescription. Press "Save doctor" after signing.</p>
    </div>
  );
}
