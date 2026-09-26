import { useNavigate } from 'react-router-dom';
import { BedDouble } from 'lucide-react';
import { ipdApi } from '../../api/endpoints';
import { useList } from '../../hooks/useResource';
import { useFilters } from '../../hooks/useFilters';
import { useAuth } from '../../context/AuthContext';
import ResourceList from '../../components/data/ResourceList';
import SearchBar from '../../components/data/SearchBar';
import { DateRange, FilterBar, FilterSelect } from '../../components/data/Filters';
import { EmptyState } from '../../components/ui/States';
import Button from '../../components/ui/Button';
import { statusOptions } from '../../utils/status';
import { ROOM_TYPE_OPTIONS } from '../../utils/options';
import { ipdColumns } from './ipdColumns';

const DEFAULTS = { search: '', status: 'ADMITTED', type: '', from: '', to: '' };

export default function IpdList() {
  const navigate = useNavigate();
  const { can } = useAuth();
  const [filters, setFilters] = useFilters(DEFAULTS);
  const query = useList(ipdApi, filters);
  const actions = (row) => <Button size="sm" variant="ghost" to={`/ipd/${row.id}`}>View</Button>;

  const toolbar = (
    <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
      <SearchBar value={filters.search} onChange={(search) => setFilters({ search })} placeholder="Search patient, mobile or IPD no." />
      <FilterBar>
        <FilterSelect label="Status" value={filters.status} onChange={(status) => setFilters({ status })} options={statusOptions('ipd')} />
        <FilterSelect label="Room type" value={filters.type} onChange={(type) => setFilters({ type })} options={ROOM_TYPE_OPTIONS} />
        <DateRange from={filters.from} to={filters.to} onChange={setFilters} />
      </FilterBar>
    </div>
  );

  const empty = filters.status === 'ADMITTED' && !filters.search
    ? <EmptyState icon={BedDouble} title="No patients are admitted" message="Current admissions will appear here." action={can('IPD', 'WRITE') && <Button icon={BedDouble} to="/ipd/admit">Admit patient</Button>} />
    : <EmptyState icon={BedDouble} title="No admissions found" message="No admissions match these filters." action={<Button variant="secondary" onClick={() => setFilters(DEFAULTS)}>Reset filters</Button>} />;

  return (
    <ResourceList
      query={query}
      columns={ipdColumns({ actions })}
      toolbar={toolbar}
      empty={empty}
      caption="IPD admissions"
      onRowClick={(row) => navigate(`/ipd/${row.id}`)}
      onPageChange={(page) => setFilters({ page })}
    />
  );
}
