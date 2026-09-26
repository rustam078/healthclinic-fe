import { Navigate, useNavigate, useParams } from 'react-router-dom';
import {
  BedDouble, Building2, FileText, Palette, ShieldCheck, Stethoscope, UserCog,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/layout/PageHeader';
import Tabs from '../../components/ui/Tabs';
import ClinicSection from './ClinicSection';
import BrandingSection from './BrandingSection';
import TemplateSection from './TemplateSection';
import DoctorSection from './DoctorSection';
import RoomsSection from './RoomsSection';
import UsersSection from './UsersSection';
import PermissionsSection from './PermissionsSection';

const SECTIONS = [
  { id: 'clinic', label: 'Clinic', icon: Building2, element: <ClinicSection /> },
  { id: 'branding', label: 'Branding', icon: Palette, element: <BrandingSection /> },
  { id: 'templates', label: 'Templates', icon: FileText, element: <TemplateSection /> },
  { id: 'doctor', label: 'Doctor & fees', icon: Stethoscope, element: <DoctorSection /> },
  { id: 'rooms', label: 'Rooms & beds', icon: BedDouble, element: <RoomsSection /> },
  { id: 'users', label: 'Users', icon: UserCog, element: <UsersSection />, adminOnly: true },
  { id: 'permissions', label: 'Permissions', icon: ShieldCheck, element: <PermissionsSection />, adminOnly: true },
];

/** Settings module: clinic details, branding, templates and master data. */
export default function SettingsPage() {
  const { section } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const sections = SECTIONS.filter((item) => isAdmin || !item.adminOnly);
  const active = sections.find((item) => item.id === section);
  if (!active) return <Navigate to={`/settings/${sections[0].id}`} replace />;

  return (
    <>
      <PageHeader title="Settings" subtitle="Clinic information, branding, printable templates and master data" />
      <div className="space-y-4">
        <Tabs tabs={sections} active={active.id} onChange={(id) => navigate(`/settings/${id}`)} label="Settings sections" />
        {active.element}
      </div>
    </>
  );
}
