import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useClinicSettings } from '../../hooks/useClinicSettings';
import Sidebar from './Sidebar';
import Header from './Header';

const STORAGE_KEY = 'clinic.sidebar';

function readChoice() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * Menu is full (icons + names) or collapsed (icons only) on large screens. The default comes from
 * Settings → Clinic → Menu style; a user's own toggle is remembered on this device.
 */
function useSidebarMode() {
  const { data: settings } = useClinicSettings();
  const [choice, setChoice] = useState(readChoice);
  const collapsed = (choice || settings?.sidebarMode || 'FULL') === 'ICONS';
  const toggle = () => {
    const next = collapsed ? 'FULL' : 'ICONS';
    setChoice(next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch { /* storage unavailable */ }
  };
  return { collapsed, toggle };
}

export default function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { collapsed, toggle } = useSidebarMode();
  return (
    <div className="min-h-screen">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2">
        Skip to content
      </a>
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} collapsed={collapsed} onToggle={toggle} />
      <div className={`transition-[padding] ${collapsed ? 'lg:pl-16' : 'lg:pl-64'}`}>
        <Header onMenu={() => setMenuOpen(true)} />
        <main id="main" className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
