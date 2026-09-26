import { BarChart3, BedDouble, BedSingle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/layout/PageHeader';
import Tabs, { useTab } from '../../components/ui/Tabs';
import Button from '../../components/ui/Button';
import IpdList from './IpdList';
import BedBoard from './BedBoard';
import IpdReport from './IpdReport';

const TABS = [
  { id: 'admissions', label: 'Admissions', icon: BedDouble },
  { id: 'beds', label: 'Beds', icon: BedSingle },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
];

/** IPD module: admissions, bed board and IPD reports. */
export default function IpdPage() {
  const { can } = useAuth();
  const [tab, setTab] = useTab(TABS);
  return (
    <>
      <PageHeader
        title="IPD"
        subtitle="In-patient admissions, beds and discharge"
        actions={can('IPD', 'WRITE') && <Button icon={BedDouble} to="/ipd/admit">Admit patient</Button>}
      />
      <div className="space-y-4">
        <Tabs tabs={TABS} active={tab} onChange={setTab} label="IPD sections" />
        {tab === 'admissions' && <IpdList />}
        {tab === 'beds' && <BedBoard />}
        {tab === 'reports' && <IpdReport />}
      </div>
    </>
  );
}
