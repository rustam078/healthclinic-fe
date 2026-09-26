import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BedDouble, CheckCircle2, Clock, Wrench } from 'lucide-react';
import { bedsApi, roomsApi } from '../../api/endpoints';
import { useList } from '../../hooks/useResource';
import { useStatusFlow } from '../../hooks/useStatusFlow';
import { useAuth } from '../../context/AuthContext';
import { useClinicSettings } from '../../hooks/useClinicSettings';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { EmptyState, QueryState } from '../../components/ui/States';
import StatusBadge from '../../components/ui/StatusBadge';
import StatCard, { StatGrid } from '../../components/report/StatCard';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { formatMoney, labelize } from '../../utils/format';
import { statusInfo } from '../../utils/status';

const BED_TONE = {
  AVAILABLE: 'border-emerald-200 bg-emerald-50/60',
  OCCUPIED: 'border-sky-200 bg-sky-50/70',
  RESERVED: 'border-amber-200 bg-amber-50/70',
  MAINTENANCE: 'border-slate-200 bg-slate-100',
};

/** Simple room-by-room view of every bed and its state. */
export default function BedBoard() {
  const query = useList(roomsApi, { size: 100, status: 'ACTIVE' });
  const [selected, setSelected] = useState(null);
  return (
    <QueryState
      query={query}
      isEmpty={(page) => page.content.length === 0}
      empty={<Card><EmptyState icon={BedDouble} title="No rooms set up" message="Add rooms and beds in Settings → Rooms & beds." action={<Button variant="secondary" to="/settings/rooms">Open settings</Button>} /></Card>}
    >
      {(page) => (
        <div className="space-y-4">
          <BedSummary rooms={page.content} />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {page.content.map((room) => <RoomCard key={room.id} room={room} onSelect={setSelected} />)}
          </div>
          <BedActions bed={selected} onClose={() => setSelected(null)} />
        </div>
      )}
    </QueryState>
  );
}

function BedSummary({ rooms }) {
  const beds = rooms.flatMap((room) => room.beds);
  const count = (status) => beds.filter((bed) => bed.status === status).length;
  return (
    <StatGrid>
      <StatCard label="Available beds" value={count('AVAILABLE')} icon={CheckCircle2} accent="good" />
      <StatCard label="Occupied beds" value={count('OCCUPIED')} icon={BedDouble} accent="info" hint={`of ${beds.length} beds`} />
      <StatCard label="Reserved" value={count('RESERVED')} icon={Clock} accent="warning" />
      <StatCard label="Under maintenance" value={count('MAINTENANCE')} icon={Wrench} />
    </StatGrid>
  );
}

function RoomCard({ room, onSelect }) {
  const { data: settings } = useClinicSettings();
  return (
    <Card>
      <CardHeader
        title={`Room ${room.roomNumber}`}
        subtitle={`${labelize(room.roomType)}${room.floor ? ` · Floor ${room.floor}` : ''} · ${formatMoney(room.dailyCharge, settings?.currencySymbol)}/day`}
      />
      <CardBody>
        {room.beds.length === 0 ? <p className="text-sm text-slate-500">No beds in this room.</p> : (
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {room.beds.map((bed) => <BedTile key={bed.id} bed={bed} onSelect={onSelect} />)}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}

function BedTile({ bed, onSelect }) {
  const { icon: Icon, label } = statusInfo('bed', bed.status);
  return (
    <li>
      <button type="button" onClick={() => onSelect(bed)} className={`flex h-full w-full flex-col gap-1 rounded-lg border p-3 text-left transition-shadow hover:shadow-md ${BED_TONE[bed.status]}`}>
        <span className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-slate-900">Bed {bed.bedNumber}</span>
          <Icon className="size-4 text-slate-500" aria-hidden />
        </span>
        <span className="text-xs text-slate-600">{label}</span>
        {bed.currentPatientName && <span className="truncate text-xs font-medium text-slate-800">{bed.currentPatientName}</span>}
      </button>
    </li>
  );
}

const MANUAL = {
  AVAILABLE: { status: 'AVAILABLE', label: 'Mark available', message: 'Make this bed available for admission?', success: 'Bed is now available' },
  RESERVED: { status: 'RESERVED', label: 'Reserve bed', message: 'Reserve this bed for an expected admission?', success: 'Bed reserved' },
  MAINTENANCE: { status: 'MAINTENANCE', label: 'Mark under maintenance', message: 'Take this bed out of use for maintenance?', success: 'Bed marked under maintenance' },
};

/** Bed menu: open the current admission, admit a patient, or change the bed's manual status. */
function BedActions({ bed, onClose }) {
  const { can } = useAuth();
  const flow = useStatusFlow(bedsApi, { invalidate: [roomsApi.key], onDone: onClose });
  const canWrite = can('IPD', 'WRITE');
  const occupied = bed?.status === 'OCCUPIED';
  return (
    <>
      <Modal open={Boolean(bed) && !flow.isPending} onClose={onClose} title={bed ? `Bed ${bed.bedNumber} · Room ${bed.roomNumber}` : ''} size="sm">
        {bed && (
          <div className="space-y-3">
            <StatusBadge domain="bed" value={bed.status} />
            {occupied && <p className="text-sm text-slate-700">Occupied by <Link to={`/ipd/${bed.currentIpdId}`} className="font-medium text-brand-700 hover:underline">{bed.currentPatientName} ({bed.currentIpdCode})</Link></p>}
            <div className="flex flex-col gap-2">
              {canWrite && ['AVAILABLE', 'RESERVED'].includes(bed.status) && <Button icon={BedDouble} to={`/ipd/admit?bedId=${bed.id}`}>Admit patient to this bed</Button>}
              {canWrite && !occupied && Object.keys(MANUAL).filter((status) => status !== bed.status).map((status) => (
                <Button key={status} variant="secondary" onClick={() => flow.ask(bed, MANUAL[status])}>{MANUAL[status].label}</Button>
              ))}
              {occupied && <p className="text-xs text-slate-500">The bed becomes available when the patient is discharged or moved.</p>}
            </div>
          </div>
        )}
      </Modal>
      {flow.dialog}
    </>
  );
}
