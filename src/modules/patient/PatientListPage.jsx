import { Link, useNavigate } from 'react-router-dom';
import { Eye, Pencil, UserPlus, Users } from 'lucide-react';
import { patientsApi } from '../../api/endpoints';
import { useList } from '../../hooks/useResource';
import { useFilters } from '../../hooks/useFilters';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/layout/PageHeader';
import ResourceList from '../../components/data/ResourceList';
import SearchBar from '../../components/data/SearchBar';
import { DateRange, FilterBar, FilterSelect } from '../../components/data/Filters';
import { EmptyState } from '../../components/ui/States';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import { formatDate, labelize } from '../../utils/format';
import { statusOptions } from '../../utils/status';

const DEFAULTS = { search: '', status: '', from: '', to: '' };

export default function PatientListPage() {
  const navigate = useNavigate();
  const { can } = useAuth();
  const canWrite = can('PATIENT', 'WRITE');
  const [filters, setFilters] = useFilters(DEFAULTS);
  const query = useList(patientsApi, filters);
  const hasFilters = filters.search || filters.status || filters.from || filters.to;

  const toolbar = (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      <SearchBar value={filters.search} onChange={(search) => setFilters({ search })} placeholder="Search name, mobile or patient ID" />
      <FilterBar>
        <FilterSelect label="Status" value={filters.status} onChange={(status) => setFilters({ status })} options={statusOptions('patient')} />
        <DateRange from={filters.from} to={filters.to} onChange={setFilters} />
      </FilterBar>
    </div>
  );

  const empty = hasFilters
    ? <EmptyState icon={Users} title="No patients match your filters" message="Try a different name, mobile number or date range." action={<Button variant="secondary" onClick={() => setFilters(DEFAULTS)}>Clear filters</Button>} />
    : <EmptyState icon={Users} title="No patients yet" message="Registered patients will appear here." action={canWrite && <Button icon={UserPlus} to="/patients/new">Register patient</Button>} />;

  return (
    <>
      <PageHeader
        title="Patients"
        subtitle="Every patient's profile, visits and admissions in one place"
        actions={canWrite && <Button icon={UserPlus} to="/patients/new">Register patient</Button>}
      />
      <ResourceList
        query={query}
        columns={columns(canWrite)}
        toolbar={toolbar}
        empty={empty}
        caption="Patients"
        onRowClick={(row) => navigate(`/patients/${row.id}`)}
        onPageChange={(page) => setFilters({ page })}
      />
    </>
  );
}

function columns(canWrite) {
  return [
    { key: 'patientCode', header: 'Patient ID', className: 'whitespace-nowrap font-mono text-xs', hideOnMobile: true },
    {
      key: 'fullName', header: 'Name', primary: true,
      render: (row) => <Link to={`/patients/${row.id}`} onClick={(e) => e.stopPropagation()} className="font-medium text-slate-900 hover:text-brand-700 hover:underline">{row.fullName}</Link>,
    },
    { key: 'phone', header: 'Mobile', className: 'whitespace-nowrap' },
    { key: 'age', header: 'Age', className: 'whitespace-nowrap', render: (row) => row.ageText || '—' },
    { key: 'gender', header: 'Gender', render: (row) => labelize(row.gender) },
    { key: 'createdAt', header: 'Registered', className: 'whitespace-nowrap', render: (row) => formatDate(row.createdAt) },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge domain="patient" value={row.status} /> },
    {
      key: 'actions', header: <span className="sr-only">Actions</span>, className: 'text-right whitespace-nowrap',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" icon={Eye} to={`/patients/${row.id}`} aria-label={`View ${row.fullName}`}>View</Button>
          {canWrite && <Button variant="ghost" size="sm" icon={Pencil} to={`/patients/${row.id}/edit`} aria-label={`Edit ${row.fullName}`}>Edit</Button>}
        </div>
      ),
    },
  ];
}
