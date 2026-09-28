import { useQuery } from '@tanstack/react-query';
import { doctorsApi } from '../../../api/endpoints';
import DocumentTemplate, { headerAlignClass } from '../../../components/print/DocumentTemplate';
import LogoBox from '../../../components/print/LogoBox';
import { formatDate, shortAge } from '../../../utils/format';
import { inkToDataUrl, parseStrokes } from './ink';

/** Heights of the fixed parts of the sheet (CSS px) so the writing area fills the rest of the page. */
const BLOCKS = { band: 72, closing: 80, footer: 64, borders: 48 };
export const WEIGHT_BOX = { width: 100, height: 30 };
export const SIGNATURE_RATIO = 0.3;

/** Size of the handwriting area; identical on the pad, in print and in the Settings preview. */
export function rxArea(template) {
  const width = template.pageWidth - template.padding * 2;
  const verticalPadding = (template.paddingTop ?? template.padding) + (template.paddingBottom ?? template.padding);
  const fixed = verticalPadding + template.headerHeight + template.margin
    + BLOCKS.band + BLOCKS.closing + (template.showFooter ? BLOCKS.footer : 0) + BLOCKS.borders;
  const height = Math.max(200, Math.floor(template.pageHeight - fixed));
  return { width, height, ratio: height / width };
}

export function useClinicDoctor() {
  return useQuery({ queryKey: [doctorsApi.key, 'clinic'], queryFn: doctorsApi.clinic }).data;
}

/** Prescription page: the template with the prescription header (hospital · logo · doctor) and no title row. */
export function PrescriptionDocument({ template, settings, date, validUntil, children }) {
  const doctor = useClinicDoctor();
  return (
    <DocumentTemplate template={template} settings={settings} date={date} showTitle={false}
      header={<PrescriptionHeader template={template} settings={settings} doctor={doctor} />}
      footer={<PrescriptionFooter template={template} settings={settings} validUntil={validUntil} />}>
      {children}
    </DocumentTemplate>
  );
}

/** Left: hospital details and availability; centre: logo; right: doctor, specialisation, facilities. */
function PrescriptionHeader({ template, settings, doctor }) {
  const accent = template.accentColor || '#0f766e';
  const contact = [settings?.phone, settings?.email].filter(Boolean).join(' · ');
  return (
    <header className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 border-b-2"
      style={{ minHeight: template.headerHeight, paddingTop: template.headerPaddingTop || 0, borderColor: accent }}>
      <div className={`min-w-0 ${headerAlignClass(template, 'text-left')}`}>
        <p className="text-base leading-tight font-bold" style={{ color: accent }}>{settings?.clinicName}</p>
        {settings?.address && <p className="text-xs text-slate-600">{settings.address}</p>}
        {contact && <p className="text-xs text-slate-600">{contact}</p>}
        {settings?.availabilityText && <p className="mt-1 inline-block rounded px-1.5 py-0.5 text-xs font-bold text-white" style={{ backgroundColor: accent }}>{settings.availabilityText}</p>}
      </div>
      {template.showLogo ? <LogoBox src={settings?.logoUrl} width={template.logoAreaWidth} height={template.logoAreaHeight} stretch /> : <span />}
      <div className="min-w-0 text-right">
        <p className="text-base leading-tight font-bold text-slate-900">{doctor?.fullName || 'Doctor'}</p>
        {doctor?.specialization && <p className="text-xs text-slate-700">{doctor.specialization}</p>}
        {doctor?.facilities && <p className="text-xs text-slate-600"><span className="font-semibold">Facility:</span> {doctor.facilities}</p>}
      </div>
    </header>
  );
}

/**
 * Body of the prescription: patient box (with the handwritten weight), the plain writing area (`rx`),
 * follow-up and free-follow-up validity with the fee reminder, and the doctor's saved signature.
 */
export default function PrescriptionContent({ template, appointment, followUpDate, rx, weight }) {
  const doctor = useClinicDoctor();
  const area = rxArea(template);
  return (
    <div className="flex flex-1 flex-col">
      <PatientBox appointment={appointment} weight={weight} />
      <div className="relative" style={{ width: area.width, height: area.height }}>{rx}</div>
      <div className="mt-auto flex items-end justify-between gap-4 pb-1" style={{ minHeight: BLOCKS.closing }}>
        <p className="text-sm text-slate-700"><span className="font-semibold">Follow-up:</span> {followUpDate ? formatDate(followUpDate) : 'As needed'}</p>
        <DoctorSignature doctor={doctor} />
      </div>
    </div>
  );
}

const SEX = { MALE: 'M', FEMALE: 'F', OTHER: 'O' };

/** Full-width patient strip: 5 columns, closed by a bold bottom rule. */
function PatientBox({ appointment, weight }) {
  return (
    <div className="mb-2 grid grid-cols-[1.4fr_1.3fr_0.9fr_auto_1.9fr] items-start gap-x-4 border-b-2 border-slate-800 pb-2" style={{ height: BLOCKS.band - 8 }}>
      <Field label="Patient" value={appointment.patientName} sub={appointment.patientCode} />
      <Field label="Age / sex" value={[shortAge(appointment.patientDateOfBirth) || appointment.patientAgeText, SEX[appointment.patientGender]].filter(Boolean).join(' / ') || '—'} sub={appointment.patientPhone} />
      <Field label="Date" value={formatDate(appointment.appointmentDate)} />
      <div>
        <p className="text-[10px] tracking-wide text-slate-500 uppercase">Wt (kg)</p>
        <div className="relative" style={WEIGHT_BOX}>{weight}</div>
      </div>
      <div className="min-w-0">
        <p className="text-[10px] tracking-wide text-slate-500 uppercase">Address</p>
        <p className="line-clamp-2 text-xs leading-snug font-medium text-slate-900">{appointment.patientAddress || '—'}</p>
      </div>
    </div>
  );
}

/** Footer: advice and thank-you on the left, free follow-up validity on the right. */
function PrescriptionFooter({ template, settings, validUntil }) {
  return (
    <footer className="flex items-end justify-between gap-4 border-t border-slate-300 pt-2 text-xs text-slate-600" style={{ minHeight: BLOCKS.footer - 8 }}>
      <div className="min-w-0">
        {settings?.footerText && <p>{settings.footerText}</p>}
        <p>{[template.footerText, validUntil && 'Free follow-up till the valid-up-to date. After it, the full consultation fee applies.'].filter(Boolean).join(' ')}</p>
      </div>
      {validUntil && <p className="shrink-0 text-sm whitespace-nowrap text-slate-900"><span className="font-semibold">Valid up to:</span> {formatDate(validUntil)}</p>}
    </footer>
  );
}

function Field({ label, value, sub }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] tracking-wide text-slate-500 uppercase">{label}</p>
      <p className="truncate text-sm font-semibold text-slate-900">{value}</p>
      {sub && <p className="truncate text-slate-500">{sub}</p>}
    </div>
  );
}

/** Saved signature (Settings → Doctor & fees) above the doctor's name. */
export function DoctorSignature({ doctor }) {
  const strokes = parseStrokes(doctor?.signature);
  return (
    <div className="w-56 text-center">
      <div className="h-14">{strokes.length > 0 && <img src={inkToDataUrl(strokes, SIGNATURE_RATIO, 600)} alt="Doctor's signature" className="mx-auto h-full object-contain" />}</div>
      <p className="border-t border-slate-500 pt-1 text-xs text-slate-700">{doctor?.fullName || "Doctor's signature"}</p>
    </div>
  );
}
