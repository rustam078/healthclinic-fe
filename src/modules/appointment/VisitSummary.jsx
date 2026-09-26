import { useQuery } from '@tanstack/react-query';
import { Info } from 'lucide-react';
import { appointmentsApi } from '../../api/endpoints';
import { useClinicSettings } from '../../hooks/useClinicSettings';
import StatusBadge from '../../components/ui/StatusBadge';
import { formatDate, formatMoney } from '../../utils/format';

/**
 * What this booking will be: consultation (fee from settings) or free follow-up within the validity days
 * of the patient's last completed consultation. The server makes the final decision when booking.
 */
export default function VisitSummary({ patientId, date }) {
  const { data: settings } = useClinicSettings();
  const preview = useQuery({
    queryKey: [appointmentsApi.key, 'preview', patientId, date],
    queryFn: () => appointmentsApi.preview({ patientId, date }),
    enabled: Boolean(date),
  });
  const visit = preview.data;
  if (!visit) return null;
  const free = visit.type === 'FOLLOW_UP';

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between" aria-live="polite">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge domain="visit" value={visit.type} />
        <span className="text-sm text-slate-700">
          {free ? `Free follow-up · valid till ${formatDate(visit.followUpValidUntil)}`
            : `Free follow-ups until ${formatDate(visit.followUpValidUntil)} after this visit`}
        </span>
      </div>
      <p className="flex items-center gap-1.5 text-sm">
        <Info className="size-4 text-slate-400" aria-hidden />
        <span className="text-slate-500">Fee</span>
        <span className="text-base font-semibold text-slate-900">{free ? 'Free' : formatMoney(visit.fee, settings?.currencySymbol)}</span>
      </p>
    </div>
  );
}
