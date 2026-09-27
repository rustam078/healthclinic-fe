import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, CalendarDays, CalendarPlus, Inbox } from 'lucide-react';
import { deleteRequestsApi } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/layout/PageHeader';
import Tabs, { useTab } from '../../components/ui/Tabs';
import Button from '../../components/ui/Button';
import AppointmentList from './AppointmentList';
import DeleteRequestList from './DeleteRequestList';
import AppointmentReport from './AppointmentReport';

const TABS = [
  { id: 'appointments', label: 'Queue', icon: CalendarDays },
  { id: 'requests', label: 'Requests', icon: Inbox },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
];

/** Appointment module: today's queue, delete requests and reports as tabs of one page. */
export default function AppointmentPage() {
  const { can } = useAuth();
  const [tab, setTab] = useTab(TABS);
  const [queueCount, setQueueCount] = useState();
  const pending = useQuery({
    queryKey: [deleteRequestsApi.key, 'pending-count'],
    queryFn: () => deleteRequestsApi.list({ status: 'PENDING', size: 1 }),
  });
  const counts = {
    appointments: { count: queueCount, tone: 'info' },
    requests: { count: pending.data?.totalElements },
  };
  const tabs = TABS.map((item) => ({ ...item, ...counts[item.id] }));

  return (
    <>
      <PageHeader
        title="Appointments"
        subtitle="First come, first served — patients are seen in token order"
        actions={can('APPOINTMENT', 'WRITE') && <Button icon={CalendarPlus} to="/appointments/new" className="w-full sm:w-auto">Book appointment</Button>}
      />
      <div className="space-y-4">
        <Tabs tabs={tabs} active={tab} onChange={setTab} label="Appointment sections" />
        {tab === 'appointments' && <AppointmentList onCount={setQueueCount} />}
        {tab === 'requests' && <DeleteRequestList />}
        {tab === 'reports' && <AppointmentReport />}
      </div>
    </>
  );
}
