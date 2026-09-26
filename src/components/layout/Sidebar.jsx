import { NavLink } from 'react-router-dom';
import { ChevronsLeft, ChevronsRight, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useClinicSettings } from '../../hooks/useClinicSettings';
import LogoBox from '../print/LogoBox';
import { NAV_ITEMS } from './navigation';

function Brand() {
  const { data: settings } = useClinicSettings();
  return (
    <div className="flex min-w-0 items-center gap-3">
      <LogoBox src={settings?.logoUrl} width={36} height={36} alt="" />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-900">{settings?.clinicName || 'Clinic'}</p>
        <p className="truncate text-xs text-slate-500">Clinic management</p>
      </div>
    </div>
  );
}

/** In collapsed mode only icons show; the name is available as tooltip and to screen readers. */
function BrandLogo() {
  const { data: settings } = useClinicSettings();
  return <LogoBox src={settings?.logoUrl} width={36} height={36} alt={settings?.clinicName || 'Clinic'} />;
}

function NavItems({ onNavigate, collapsed }) {
  const { can } = useAuth();
  return (
    <nav aria-label="Main" className={`flex-1 space-y-1 py-4 ${collapsed ? 'px-2' : 'px-3'}`}>
      {NAV_ITEMS.filter((item) => can(item.module)).map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          title={collapsed ? label : undefined}
          className={({ isActive }) => `flex items-center gap-3 rounded-lg py-2.5 text-sm font-medium transition-colors ${collapsed ? 'justify-center px-0' : 'px-3'} ${
            isActive ? 'bg-brand-50 text-brand-800' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Icon className="size-5 shrink-0" aria-hidden />
          <span className={collapsed ? 'sr-only' : ''}>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

/** Fixed sidebar on large screens, slide-in drawer on tablets and phones. */
export default function Sidebar({ open, onClose, collapsed, onToggle }) {
  return (
    <>
      <aside className={`no-print fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-slate-200 bg-white transition-[width] lg:flex ${collapsed ? 'w-16' : 'w-64'}`}>
        <div className={`flex h-16 items-center border-b border-slate-100 ${collapsed ? 'justify-center px-2' : 'px-4'}`}>{collapsed ? <BrandLogo /> : <Brand />}</div>
        <NavItems collapsed={collapsed} />
        <button type="button" onClick={onToggle} aria-label={collapsed ? 'Expand menu' : 'Collapse menu'} title={collapsed ? 'Expand menu' : 'Collapse menu'}
          className={`m-2 flex items-center gap-2 rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 ${collapsed ? 'justify-center' : 'px-3'}`}>
          {collapsed ? <ChevronsRight className="size-5" aria-hidden /> : <><ChevronsLeft className="size-5" aria-hidden /><span>Collapse menu</span></>}
        </button>
      </aside>
      {open && (
        <div className="no-print fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} aria-hidden />
          <aside className="relative flex h-full w-72 max-w-[85vw] flex-col bg-white shadow-xl" aria-label="Menu">
            <div className="flex h-16 items-center justify-between gap-2 border-b border-slate-100 px-4">
              <Brand />
              <button type="button" onClick={onClose} aria-label="Close menu" className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100">
                <X className="size-5" />
              </button>
            </div>
            <NavItems onNavigate={onClose} />
          </aside>
        </div>
      )}
    </>
  );
}
