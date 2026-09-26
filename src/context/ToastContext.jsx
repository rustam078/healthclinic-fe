import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);
let nextId = 1;

function ToastItem({ toast, onClose }) {
  const isError = toast.type === 'error';
  const Icon = isError ? AlertTriangle : CheckCircle2;
  return (
    <div
      role={isError ? 'alert' : 'status'}
      className={`pointer-events-auto flex w-full items-start gap-3 rounded-lg border bg-white p-3 shadow-lg sm:w-96 ${
        isError ? 'border-rose-200' : 'border-emerald-200'
      }`}
    >
      <Icon className={`mt-0.5 size-5 shrink-0 ${isError ? 'text-rose-600' : 'text-emerald-600'}`} aria-hidden />
      <p className="flex-1 text-sm text-slate-700">{toast.message}</p>
      <button type="button" onClick={onClose} className="rounded p-0.5 text-slate-400 hover:text-slate-700" aria-label="Dismiss">
        <X className="size-4" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const dismiss = useCallback((id) => setToasts((all) => all.filter((toast) => toast.id !== id)), []);
  const show = useCallback((type, message) => {
    const id = nextId++;
    setToasts((all) => [...all.slice(-3), { id, type, message }]);
    setTimeout(() => dismiss(id), type === 'error' ? 6000 : 3500);
  }, [dismiss]);
  const api = useMemo(() => ({
    success: (message) => show('success', message),
    error: (message) => show('error', message),
  }), [show]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="no-print pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 p-4 sm:items-end">
        {toasts.map((toast) => <ToastItem key={toast.id} toast={toast} onClose={() => dismiss(toast.id)} />)}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
