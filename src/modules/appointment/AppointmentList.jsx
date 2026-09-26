import { useSearchParams } from 'react-router-dom';
import { CalendarDays, CalendarPlus, Eye, FileText, NotebookPen } from 'lucide-react';
import { appointmentsApi } from '../../api/endpoints';
import { useList } from '../../hooks/useResource';
import { useFilters } from '../../hooks/useFilters';
import { useClinicSettings } from '../../hooks/useClinicSettings';
import { useAuth } from '../../context/AuthContext';
import ResourceList from '../../components/data/ResourceList';
import SearchBar from '../../components/data/SearchBar';
import { DateRange, FilterBar, FilterSelect } from '../../components/data/Filters';
import { EmptyState } from '../../components/ui/States';
import Button from '../../components/ui/Button';
import { statusOptions } from '../../utils/status';
import { APPOINTMENT_TYPE_OPTIONS } from '../../utils/options';
import { addDays, isoDate } from '../../utils/format';
import { appointmentColumns } from './appointmentColumns';
import { useAppointmentActions } from './useAppointmentActions';
import AppointmentDrawer from './AppointmentDrawer';

const today = () => ({ from: isoDate(), to: isoDate() });

const PRESETS = [
  { id: 'today', label: 'Today', range: today },
  { id: 'upcoming', label: 'Upcoming', range: () => ({ from: isoDate(addDays(1)), to: '' }) },
  { id: 'all', label: 'All dates', range: () => ({ from: '', to: '' }) },
];

/** The queue: waiting patients first in token order (first come, first served), completed ones at the end. */
export default function AppointmentList() {
  const { can } = useAuth();
  const [filters, setFilters] = useFilters({ search: '', status: '', type: '', ...today() });
  const [searchParams, setSearchParams] = useSearchParams();
  const query = useList(appointmentsApi, filters);
  const { data: settings } = useClinicSettings();
  const actions = useAppointmentActions();
  const openView = (id) => setSearchParams((params) => {
    const next = new URLSearchParams(params);
    if (id) next.set('view', id); else next.delete('view');
    return next;
  });

  const rows = query.data?.content || [];
  const nextId = filters.from === isoDate() && filters.to === isoDate() ? rows.find((row) => row.status === 'SCHEDULED')?.id : undefined;
  const rowActions = (row) => (
    <div className="flex justify-end gap-1">
      <RxButton row={row} canWrite={actions.canWrite(row)} canView={actions.canViewRx(row)} />
      <Button size="icon" variant="ghost" icon={Eye} onClick={() => openView(row.id)} aria-label={`View ${row.patientName}`} title="View details" />
    </div>
  );

  return (
    <>
      <ResourceList
        query={query}
        columns={appointmentColumns({ actions: rowActions, nextId, currency: settings?.currencySymbol, omit: filters.from === filters.to && filters.from ? ['appointmentDate'] : [] })}
        toolbar={<Toolbar filters={filters} setFilters={setFilters} />}
        empty={<Empty canWrite={can('APPOINTMENT', 'WRITE')} />}
        caption="Appointments"
        onRowClick={(row) => openView(row.id)}
        onPageChange={(page) => setFilters({ page })}
      />
      <AppointmentDrawer id={searchParams.get('view')} onClose={() => openView(null)} />
      {actions.dialogs}
    </>
  );
}

function Toolbar({ filters, setFilters }) {
  const active = PRESETS.find((preset) => {
    const range = preset.range();
    return range.from === filters.from && range.to === filters.to;
  })?.id;
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Date presets">
        {PRESETS.map((preset) => (
          <button key={preset.id} type="button" aria-pressed={active === preset.id} onClick={() => setFilters(preset.range())}
            className={`rounded-full px-3 py-1 text-sm font-medium ring-1 ring-inset ${active === preset.id ? 'bg-brand-700 text-white ring-brand-700' : 'bg-white text-slate-600 ring-slate-300 hover:bg-slate-50'}`}>
            {preset.label}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <SearchBar value={filters.search} onChange={(search) => setFilters({ search })} placeholder="Search name, mobile or patient ID" />
        <FilterBar>
          <FilterSelect label="Status" value={filters.status} onChange={(status) => setFilters({ status })} options={statusOptions('appointment')} />
          <FilterSelect label="Visit" value={filters.type} onChange={(type) => setFilters({ type })} options={APPOINTMENT_TYPE_OPTIONS} />
          <DateRange from={filters.from} to={filters.to} onChange={setFilters} />
        </FilterBar>
      </div>
    </div>
  );
}

function Empty({ canWrite }) {
  return (
    <EmptyState icon={CalendarDays} title="No appointments found" message="Bookings for the selected dates will appear here in token order."
      action={canWrite && <Button icon={CalendarPlus} to="/appointments/new">Book appointment</Button>} />
  );
}

/**
 * Prescription icon in the queue: the doctor writes it when the patient's turn comes;
 * completed prescriptions open for view/print. Both depend on the role's actions in Settings -> Permissions.
 */
function RxButton({ row, canWrite, canView }) {
  const to = `/appointments/${row.id}/prescription`;
  const stop = (event) => event.stopPropagation();
  if (canWrite) {
    return <Button size="icon" icon={NotebookPen} to={to} onClick={stop} aria-label={`Write prescription for ${row.patientName}`} title="Write prescription" />;
  }
  if (canView) {
    return <Button size="icon" variant="secondary" icon={FileText} to={to} onClick={stop} aria-label={`View prescription of ${row.patientName}`} title="View / print prescription" />;
  }
  return null;
}
