import { statusInfo, TONE_CLASSES } from '../../utils/status';

/** Coloured pill with icon + text, e.g. <StatusBadge domain="appointment" value="CONFIRMED" />. */
export default function StatusBadge({ domain, value, className = '' }) {
  const { label, tone, icon: Icon } = statusInfo(domain, value);
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset ${TONE_CLASSES[tone]} ${className}`}>
      <Icon className="size-3.5" aria-hidden />
      {label}
    </span>
  );
}
