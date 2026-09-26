import { useState } from 'react';
import { History } from 'lucide-react';
import { activityApi } from '../../api/endpoints';
import { useList } from '../../hooks/useResource';
import { QueryState, EmptyState } from '../ui/States';
import Button from '../ui/Button';
import { formatDateTime } from '../../utils/format';

const DOT = {
  CREATED: 'bg-brand-600', UPDATED: 'bg-slate-400', STATUS_CHANGED: 'bg-sky-500',
  CONVERTED: 'bg-emerald-500', DISCHARGED: 'bg-violet-500', DELETED: 'bg-rose-500',
};

/** Chronological history for a patient (patientId) or one record (entityType + entityId). */
export default function ActivityTimeline({ params }) {
  const [size, setSize] = useState(10);
  const query = useList(activityApi, { ...params, size });
  return (
    <QueryState
      query={query}
      isEmpty={(page) => page.content.length === 0}
      empty={<EmptyState icon={History} title="No history yet" message="Changes to this record will appear here." />}
    >
      {(page) => (
        <div>
          <ol className="relative ml-2 border-l border-slate-200">
            {page.content.map((entry) => (
              <li key={entry.id} className="mb-4 ml-5 last:mb-0">
                <span className={`absolute -left-[5px] mt-1.5 size-2.5 rounded-full ring-4 ring-white ${DOT[entry.action] || 'bg-slate-400'}`} aria-hidden />
                <p className="text-sm text-slate-800">{entry.description}</p>
                <p className="text-xs text-slate-500">{formatDateTime(entry.performedAt)} · {entry.performedBy}</p>
              </li>
            ))}
          </ol>
          {page.totalElements > page.content.length && (
            <Button variant="link" size="sm" className="mt-2" onClick={() => setSize(size + 20)}>Show older entries</Button>
          )}
        </div>
      )}
    </QueryState>
  );
}
