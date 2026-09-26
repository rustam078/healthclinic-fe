import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, CloudCheck, CloudOff, Loader2, Printer } from 'lucide-react';
import { appointmentsApi, prescriptionApi, templatesApi } from '../../../api/endpoints';
import { useApiMutation, useItem } from '../../../hooks/useResource';
import { useClinicSettings } from '../../../hooks/useClinicSettings';
import { usePrint } from '../../../context/PrintContext';
import { useAuth } from '../../../context/AuthContext';
import PageHeader from '../../../components/layout/PageHeader';
import { QueryState } from '../../../components/ui/States';
import { RequireAction } from '../../../routes/Guards';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import Button from '../../../components/ui/Button';
import { addDays, formatDate, isoDate } from '../../../utils/format';
import InkCanvas from './InkCanvas';
import PadToolbar from './PadToolbar';
import PrescriptionPrint from './PrescriptionPrint';
import PrescriptionContent, { PrescriptionDocument, WEIGHT_BOX, rxArea } from './PrescriptionSheet';
import { COLORS, SIZES, parseStrokes } from './ink';
import { useInkHistory } from './useInkHistory';
import { useAutosave } from './useAutosave';

/** Prescription pad: the doctor writes on the clinic's Prescription template (Settings -> Templates). */
export default function PrescriptionPage() {
  const { id } = useParams();
  const { canDo } = useAuth();
  const allowed = canDo('PRESCRIPTION_VIEW') || canDo('APPOINTMENT_COMPLETE');
  const appointment = useItem(appointmentsApi, id);
  const template = useQuery({ queryKey: [templatesApi.key, 'PRESCRIPTION'], queryFn: () => templatesApi.get('PRESCRIPTION') });
  const prescription = useQuery({ queryKey: [appointmentsApi.key, 'prescription', id], queryFn: () => prescriptionApi.get(id), staleTime: 0, enabled: allowed });
  return (
    <RequireAction actions={['PRESCRIPTION_VIEW', 'APPOINTMENT_COMPLETE']}>
      <QueryState query={appointment}>
        {(appt) => (
          <QueryState query={template}>
            {(tpl) => <QueryState query={prescription}>{(rx) => <Pad appointment={appt} template={tpl} prescription={rx} />}</QueryState>}
          </QueryState>
        )}
      </QueryState>
    </RequireAction>
  );
}

function Pad({ appointment, template, prescription }) {
  const navigate = useNavigate();
  const print = usePrint();
  const queryClient = useQueryClient();
  const { data: settings } = useClinicSettings();
  const ink = useInkHistory({ rx: parseStrokes(prescription.strokes), wt: parseStrokes(prescription.weightStrokes) });
  const [followUpDate, setFollowUpDate] = useState(prescription.followUpDate || '');
  const pad = usePadTools();
  const [confirmClear, setConfirmClear] = useState(false);
  const editable = prescription.editable;
  const body = { strokes: JSON.stringify(ink.state.rx), weightStrokes: JSON.stringify(ink.state.wt), followUpDate: followUpDate || null };
  const autosave = useAutosave(body, (payload) => prescriptionApi.save(appointment.id, payload), { enabled: editable });

  const inkProps = { tool: pad.tool, color: pad.color, size: pad.size, readOnly: !editable, allowFinger: pad.allowFinger, onPenDetected: pad.penDetected };
  const printNow = () => print({
    type: 'PRESCRIPTION', date: appointment.appointmentDate, document: PrescriptionDocument, documentProps: { validUntil: prescription.validUntil },
    content: <PrescriptionPrint template={template} appointment={appointment} strokes={ink.state.rx} weightStrokes={ink.state.wt} followUpDate={followUpDate} validUntil={prescription.validUntil} />,
  });
  const complete = useApiMutation(() => prescriptionApi.complete(appointment.id, body), {
    success: appointment.status === 'COMPLETED' ? 'Prescription updated' : 'Prescription saved · appointment completed',
    invalidate: [appointmentsApi.key, 'activity', 'dashboard'],
    onSuccess: (saved, withPrint) => {
      autosave.markSaved();
      queryClient.invalidateQueries({ queryKey: [appointmentsApi.key] });
      if (withPrint) printNow(); else navigate('/appointments');
    },
  });

  return (
    <>
      <PageHeader
        title={`Prescription · Token ${appointment.tokenNumber}`}
        breadcrumbs={[{ label: 'Appointments', to: '/appointments' }, { label: appointment.patientName }]}
        actions={<PadActions editable={editable} appointment={appointment} saving={complete.isPending} onComplete={complete.mutate} onPrint={printNow} />}
      />
      {editable ? (
        <div className="no-print sticky top-16 z-10 -mx-4 mb-3 space-y-2 border-b border-slate-200 bg-slate-50/95 px-4 py-2 backdrop-blur sm:mx-0 sm:rounded-xl sm:border">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <PadToolbar pad={pad} ink={ink} onClear={() => setConfirmClear(true)} />
            <SaveStatus status={autosave.status} />
          </div>
          <FollowUpPicker appointment={appointment} value={followUpDate} onChange={setFollowUpDate} />
        </div>
      ) : <ReadOnlyNote appointment={appointment} />}
      <ScaledSheet width={template.pageWidth}>
        <PrescriptionDocument template={template} settings={settings} date={appointment.appointmentDate} validUntil={prescription.validUntil}>
          <PrescriptionContent template={template} appointment={appointment} followUpDate={followUpDate}
            rx={<InkCanvas strokes={ink.state.rx} onStroke={(stroke) => ink.add('rx', stroke)} ratio={rxArea(template).ratio} {...inkProps} />}
            weight={<InkCanvas strokes={ink.state.wt} onStroke={(stroke) => ink.add('wt', stroke)} ratio={WEIGHT_BOX.height / WEIGHT_BOX.width} penScale={rxArea(template).width / WEIGHT_BOX.width} {...inkProps} />} />
        </PrescriptionDocument>
      </ScaledSheet>
      <ConfirmDialog open={confirmClear} onClose={() => setConfirmClear(false)} onConfirm={() => { ink.clear(); setConfirmClear(false); }} danger
        title="Clear the page?" message="Everything written on this prescription will be removed. You can still undo it." confirmLabel="Clear page" />
    </>
  );
}

/** Tool state. Finger writing is on until a stylus is used, then palm touches are ignored. */
function usePadTools() {
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState(COLORS[0].value);
  const [size, setSize] = useState(SIZES[0].value);
  const [allowFinger, setAllowFinger] = useState(true);
  const [stylus, setStylus] = useState(false);
  /** First stylus touch: switch off finger writing (palm rejection). Returns true when it switched. */
  const penDetected = () => {
    if (stylus) return false;
    setStylus(true);
    setAllowFinger(false);
    return true;
  };
  return { tool, setTool, color, setColor, size, setSize, allowFinger, setAllowFinger, penDetected };
}

/** Shows the fixed-size template page scaled down to the screen width (writing coordinates stay exact). */
function ScaledSheet({ width, children }) {
  const outer = useRef(null);
  const inner = useRef(null);
  const [box, setBox] = useState({ scale: 1, height: 0 });
  useEffect(() => {
    const measure = () => {
      const scale = Math.min(1, outer.current.clientWidth / width);
      setBox({ scale, height: inner.current.offsetHeight * scale });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(outer.current);
    observer.observe(inner.current);
    return () => observer.disconnect();
  }, [width]);
  return (
    <div ref={outer} className="w-full overflow-hidden" style={{ height: box.height || undefined }}>
      <div ref={inner} className="shadow-lg ring-1 ring-slate-200" style={{ width, transform: `scale(${box.scale})`, transformOrigin: 'top left', marginLeft: box.scale === 1 ? 'auto' : 0, marginRight: box.scale === 1 ? 'auto' : 0 }}>
        {children}
      </div>
    </div>
  );
}

function PadActions({ editable, appointment, saving, onComplete, onPrint }) {
  if (!editable) return <Button icon={Printer} onClick={onPrint}>Print</Button>;
  const label = appointment.status === 'COMPLETED' ? 'Save changes' : 'Save & complete';
  return (
    <>
      <Button variant="secondary" icon={Printer} loading={saving} onClick={() => onComplete(true)}>Save & print</Button>
      <Button icon={CheckCircle2} loading={saving} onClick={() => onComplete(false)}>{label}</Button>
    </>
  );
}

function SaveStatus({ status }) {
  const states = {
    saved: { icon: CloudCheck, text: 'All changes saved', className: 'text-emerald-700' },
    saving: { icon: Loader2, text: 'Saving…', className: 'text-slate-500', spin: true },
    unsaved: { icon: Loader2, text: 'Unsaved changes', className: 'text-slate-500' },
    error: { icon: CloudOff, text: 'Not saved — check connection', className: 'text-rose-700' },
  };
  const { icon: Icon, text, className, spin } = states[status];
  return <p className={`flex items-center gap-1.5 text-xs font-medium ${className}`} aria-live="polite"><Icon className={`size-4 ${spin ? 'animate-spin' : ''}`} aria-hidden />{text}</p>;
}

function ReadOnlyNote({ appointment }) {
  const text = appointment.status === 'COMPLETED'
    ? 'This prescription is completed. Only an administrator can change it; you can view and print it.'
    : 'Only the doctor can write this prescription.';
  return <p className="mb-3 rounded-lg bg-sky-50 px-3 py-2 text-sm text-sky-900">{text}</p>;
}

const FOLLOW_UP_DAYS = [3, 5, 7, 15, 30];

/** One-tap follow-up date (+3 … +30 days from the visit) or a specific date. Printed on the prescription. */
function FollowUpPicker({ appointment, value, onChange }) {
  const base = new Date(`${appointment.appointmentDate}T00:00:00`);
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-semibold text-slate-800">Follow-up</span>
      {FOLLOW_UP_DAYS.map((days) => {
        const date = isoDate(addDays(days, base));
        return (
          <button key={days} type="button" aria-pressed={value === date} onClick={() => onChange(value === date ? '' : date)}
            className={`rounded-full px-3 py-1 text-sm font-medium ring-1 ring-inset pointer-coarse:min-h-10 ${value === date ? 'bg-brand-700 text-white ring-brand-700' : 'bg-white text-slate-700 ring-slate-300 hover:bg-slate-50'}`}>
            +{days} days
          </button>
        );
      })}
      <input type="date" aria-label="Follow-up date" min={appointment.appointmentDate} value={value} onChange={(e) => onChange(e.target.value)}
        className="h-8 rounded-lg border border-slate-300 px-2 text-sm focus:border-brand-600 focus:ring-2 focus:ring-brand-100 focus:outline-none" />
      {value && <span className="text-sm text-slate-600">{formatDate(value)}</span>}
    </div>
  );
}
