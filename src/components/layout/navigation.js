import { BedDouble, CalendarDays, LayoutDashboard, Settings, Users } from 'lucide-react';

/** The five modules – the only main navigation items. */
export const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, module: 'DASHBOARD', end: true },
  { to: '/appointments', label: 'Appointment', icon: CalendarDays, module: 'APPOINTMENT' },
  { to: '/ipd', label: 'IPD', icon: BedDouble, module: 'IPD' },
  { to: '/patients', label: 'Patient', icon: Users, module: 'PATIENT' },
  { to: '/settings', label: 'Settings', icon: Settings, module: 'SETTINGS' },
];
