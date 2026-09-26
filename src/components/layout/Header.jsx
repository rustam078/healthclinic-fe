import { useEffect, useRef, useState } from 'react';
import { ChevronDown, LogOut, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { initials } from '../../utils/format';

function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => { if (!ref.current?.contains(event.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-haspopup="menu" className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-slate-100">
        <span className="flex size-8 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-800">{initials(user?.fullName)}</span>
        <span className="hidden text-left sm:block">
          <span className="block text-sm font-medium text-slate-800">{user?.fullName}</span>
          <span className="block text-xs text-slate-500">{user?.role === 'ADMIN' ? 'Administrator' : 'Staff'}</span>
        </span>
        <ChevronDown className="size-4 text-slate-400" aria-hidden />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 z-40 mt-2 w-48 rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
          <p className="truncate px-3 py-2 text-xs text-slate-500">Signed in as {user?.username}</p>
          <button type="button" role="menuitem" onClick={logout} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100">
            <LogOut className="size-4" aria-hidden /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}

export default function Header({ onMenu }) {
  return (
    <header className="no-print sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6">
      <button type="button" onClick={onMenu} aria-label="Open menu" className="rounded-md p-2 text-slate-600 hover:bg-slate-100 lg:hidden">
        <Menu className="size-5" />
      </button>
      <div className="flex-1" />
      <UserMenu />
    </header>
  );
}
