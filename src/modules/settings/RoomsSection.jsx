import { useState } from 'react';
import { z } from 'zod';
import { BedDouble, Pencil, Plus, Save, Trash2 } from 'lucide-react';
import { bedsApi, roomsApi } from '../../api/endpoints';
import { useList, useSave } from '../../hooks/useResource';
import { useEntityForm } from '../../hooks/useEntityForm';
import { useAuth } from '../../context/AuthContext';
import { useClinicSettings } from '../../hooks/useClinicSettings';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { EmptyState, QueryState } from '../../components/ui/States';
import StatusBadge from '../../components/ui/StatusBadge';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import {
  CheckboxField, FormGrid, SelectField, TextField,
} from '../../components/form/Fields';
import {
  intRange, money, optionalText, requiredChoice, requiredText,
} from '../../utils/validation';
import { ROOM_TYPE_OPTIONS } from '../../utils/options';
import { formatMoney, labelize } from '../../utils/format';
import { useMasterCrud } from './useMasterCrud';

const roomSchema = z.object({
  roomNumber: requiredText('Room number', 20),
  roomType: requiredChoice('Room type'),
  floor: optionalText('Floor', 20),
  dailyCharge: money('Daily charge'),
  active: z.boolean(),
  initialBeds: z.union([z.literal(''), intRange('Number of beds', 0, 50)]).optional(),
});
const bedSchema = z.object({ bedNumber: requiredText('Bed number', 20) });

/** Rooms and their beds (used by IPD admissions). */
export default function RoomsSection() {
  const { can } = useAuth();
  const canWrite = can('SETTINGS', 'WRITE');
  const query = useList(roomsApi, { size: 100 });
  const rooms = useMasterCrud(roomsApi, { noun: 'Room', invalidate: [bedsApi.key] });
  const beds = useMasterCrud(bedsApi, { noun: 'Bed', invalidate: [roomsApi.key] });

  return (
    <div className="space-y-4">
      {canWrite && <div className="flex justify-end"><Button icon={Plus} onClick={rooms.openNew}>Add room</Button></div>}
      <QueryState
        query={query}
        isEmpty={(page) => page.content.length === 0}
        empty={<Card><EmptyState icon={BedDouble} title="No rooms yet" message="Add rooms and beds to start admitting patients." /></Card>}
      >
        {(page) => (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {page.content.map((room) => <RoomCard key={room.id} room={room} canWrite={canWrite} rooms={rooms} beds={beds} />)}
          </div>
        )}
      </QueryState>
      <Modal open={Boolean(rooms.editing)} onClose={rooms.close} title={rooms.editing?.id ? `Edit room ${rooms.editing.roomNumber}` : 'Add room'}>
        {rooms.editing && <RoomForm room={rooms.editing.id ? rooms.editing : null} onDone={rooms.close} />}
      </Modal>
      <Modal open={Boolean(beds.editing)} onClose={beds.close} title={beds.editing?.id ? 'Rename bed' : 'Add bed'} size="sm">
        {beds.editing && <BedForm bed={beds.editing} onDone={beds.close} />}
      </Modal>
      {rooms.deleteDialog}
      {beds.deleteDialog}
    </div>
  );
}

function RoomCard({ room, canWrite, rooms, beds }) {
  const { data: settings } = useClinicSettings();
  const actions = canWrite && (
    <>
      <Button size="sm" variant="ghost" icon={Pencil} onClick={() => rooms.openEdit(room)}>Edit</Button>
      <Button size="sm" variant="ghost" icon={Trash2} aria-label={`Remove room ${room.roomNumber}`} className="text-rose-700 hover:bg-rose-50" onClick={() => rooms.askDelete(room)} />
    </>
  );
  return (
    <Card>
      <CardHeader
        title={`Room ${room.roomNumber}${room.active ? '' : ' (inactive)'}`}
        subtitle={`${labelize(room.roomType)}${room.floor ? ` · Floor ${room.floor}` : ''} · ${formatMoney(room.dailyCharge, settings?.currencySymbol)} per day`}
        actions={actions}
      />
      <CardBody>
        <ul className="divide-y divide-slate-100">
          {room.beds.map((bed) => <BedRow key={bed.id} bed={bed} canWrite={canWrite} beds={beds} />)}
          {room.beds.length === 0 && <li className="py-2 text-sm text-slate-500">No beds yet.</li>}
        </ul>
        {canWrite && <Button size="sm" variant="link" icon={Plus} className="mt-2" onClick={() => beds.openEdit({ roomId: room.id })}>Add bed</Button>}
      </CardBody>
    </Card>
  );
}

function BedRow({ bed, canWrite, beds }) {
  return (
    <li className="flex items-center justify-between gap-2 py-2">
      <span className="flex items-center gap-2 text-sm text-slate-800">Bed {bed.bedNumber} <StatusBadge domain="bed" value={bed.status} /></span>
      {canWrite && (
        <span className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={() => beds.openEdit(bed)} aria-label={`Rename bed ${bed.bedNumber}`}><Pencil className="size-4" /></Button>
          {bed.status !== 'OCCUPIED' && <Button size="sm" variant="ghost" className="text-rose-700 hover:bg-rose-50" onClick={() => beds.askDelete(bed)} aria-label={`Remove bed ${bed.bedNumber}`}><Trash2 className="size-4" /></Button>}
        </span>
      )}
    </li>
  );
}

function RoomForm({ room, onDone }) {
  const mutation = useSave(roomsApi, room?.id, { invalidate: [bedsApi.key], onSuccess: onDone });
  const form = useEntityForm({
    schema: roomSchema,
    defaultValues: {
      roomNumber: room?.roomNumber || '', roomType: room?.roomType || 'GENERAL', floor: room?.floor || '',
      dailyCharge: room?.dailyCharge ?? '', active: room?.active ?? true, initialBeds: room ? '' : 1,
    },
    mutation,
  });
  const { register, errorOf } = form;
  return (
    <form onSubmit={form.submit} noValidate className="space-y-4">
      <FormGrid>
        <TextField label="Room number" required error={errorOf('roomNumber')} {...register('roomNumber')} />
        <SelectField label="Room type" required options={ROOM_TYPE_OPTIONS} error={errorOf('roomType')} {...register('roomType')} />
        <TextField label="Floor" error={errorOf('floor')} {...register('floor')} />
        <TextField label="Daily charge" required type="number" min="0" step="0.01" hint="Used for stay estimates" error={errorOf('dailyCharge')} {...register('dailyCharge')} />
        {!room && <TextField label="Number of beds" type="number" min="0" max="50" hint="Beds are numbered 1, 2, 3…" error={errorOf('initialBeds')} {...register('initialBeds')} />}
      </FormGrid>
      <CheckboxField label="Active" hint="Beds in inactive rooms cannot be used for new admissions" {...register('active')} />
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onDone}>Cancel</Button>
        <Button type="submit" icon={Save} loading={form.saving}>Save</Button>
      </div>
    </form>
  );
}

function BedForm({ bed, onDone }) {
  const mutation = useSave(bedsApi, bed.id, { invalidate: [roomsApi.key], onSuccess: onDone });
  const form = useEntityForm({
    schema: bedSchema,
    defaultValues: { bedNumber: bed.bedNumber || '' },
    mutation,
    transform: (values) => ({ ...values, roomId: bed.roomId }),
  });
  return (
    <form onSubmit={form.submit} noValidate className="space-y-4">
      <TextField label="Bed number" required error={form.errorOf('bedNumber')} {...form.register('bedNumber')} data-autofocus />
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onDone}>Cancel</Button>
        <Button type="submit" icon={Save} loading={form.saving}>Save</Button>
      </div>
    </form>
  );
}
