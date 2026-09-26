import { AlertTriangle, Inbox, Loader2, RotateCw } from 'lucide-react';
import Button from './Button';

export function Spinner({ label = 'Loading…', className = '' }) {
  return (
    <div role="status" className={`flex items-center justify-center gap-2 py-10 text-sm text-slate-500 ${className}`}>
      <Loader2 className="size-5 animate-spin text-brand-600" aria-hidden />
      {label}
    </div>
  );
}

/** Grey placeholder rows while a list or card loads. */
export function Skeleton({ rows = 5 }) {
  return (
    <div role="status" aria-label="Loading" className="animate-pulse space-y-3 p-4">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex gap-4">
          <div className="h-4 w-1/4 rounded bg-slate-200" />
          <div className="h-4 flex-1 rounded bg-slate-100" />
          <div className="h-4 w-1/6 rounded bg-slate-200" />
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ icon: Icon = Inbox, title, message, action }) {
  return (
    <div className="flex flex-col items-center px-4 py-12 text-center">
      <div className="mb-3 rounded-full bg-slate-100 p-3">
        <Icon className="size-6 text-slate-400" aria-hidden />
      </div>
      <p className="text-sm font-semibold text-slate-800">{title}</p>
      {message && <p className="mt-1 max-w-sm text-sm text-slate-500">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ error, onRetry }) {
  return (
    <div role="alert" className="flex flex-col items-center px-4 py-12 text-center">
      <div className="mb-3 rounded-full bg-rose-50 p-3">
        <AlertTriangle className="size-6 text-rose-500" aria-hidden />
      </div>
      <p className="text-sm font-semibold text-slate-800">Could not load this information</p>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{error?.message || 'Please try again.'}</p>
      {onRetry && <Button variant="secondary" size="sm" icon={RotateCw} className="mt-4" onClick={onRetry}>Try again</Button>}
    </div>
  );
}

/** Renders loading / error / empty / content for a react-query result. */
export function QueryState({ query, isEmpty, empty, skeletonRows, children }) {
  if (query.isPending) return <Skeleton rows={skeletonRows} />;
  if (query.isError) return <ErrorState error={query.error} onRetry={query.refetch} />;
  if (isEmpty?.(query.data)) return empty;
  return children(query.data);
}
