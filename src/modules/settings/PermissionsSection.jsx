import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Lock, Save } from 'lucide-react';
import { permissionsApi } from '../../api/endpoints';
import { useApiMutation } from '../../hooks/useResource';
import { useAuth } from '../../context/AuthContext';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { QueryState } from '../../components/ui/States';
import Button from '../../components/ui/Button';
import { NAV_ITEMS } from '../../components/layout/navigation';

const ROLES = [{ id: 'ADMIN', label: 'Administrator' }, { id: 'STAFF', label: 'Staff' }];
const LEVELS = [
  { value: 'NONE', label: 'No access' },
  { value: 'READ', label: 'View only' },
  { value: 'WRITE', label: 'View & edit' },
];
const isLocked = (role, module) => role === 'ADMIN' && module === 'SETTINGS';
const keyOf = (role, module) => `${role}:${module}`;

/** Administrator-only matrix: what each role can do in each module. */
export default function PermissionsSection() {
  const query = useQuery({ queryKey: [permissionsApi.key], queryFn: permissionsApi.list });
  const actions = useQuery({ queryKey: [permissionsApi.key, 'actions'], queryFn: permissionsApi.actions });
  return (
    <div className="space-y-6">
      <QueryState query={query}>{(permissions) => <PermissionMatrix permissions={permissions} />}</QueryState>
      <QueryState query={actions}>{(list) => <ActionMatrix actions={list} />}</QueryState>
    </div>
  );
}

function PermissionMatrix({ permissions }) {
  const { refresh } = useAuth();
  const [matrix, setMatrix] = useState({});
  useEffect(() => {
    setMatrix(Object.fromEntries(permissions.map((p) => [keyOf(p.role, p.module), p.access])));
  }, [permissions]);
  const save = useApiMutation(
    () => permissionsApi.update(Object.entries(matrix).map(([key, access]) => ({ role: key.split(':')[0], module: key.split(':')[1], access }))),
    { success: 'Permissions saved', invalidate: [permissionsApi.key], onSuccess: refresh },
  );
  const setLevel = (role, module, access) => setMatrix((current) => ({ ...current, [keyOf(role, module)]: access }));

  return (
    <Card className="max-w-4xl">
      <CardHeader title="Role permissions" subtitle="Changes apply immediately to everyone with that role" />
      <CardBody>
        <div className="relative overflow-x-auto">
          <table className="w-full min-w-[32rem] text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase">
                <th scope="col" className="py-2 pr-4">Module</th>
                {ROLES.map((role) => <th key={role.id} scope="col" className="px-2 py-2">{role.label}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {NAV_ITEMS.map((item) => (
                <tr key={item.module}>
                  <th scope="row" className="py-3 pr-4 text-left font-medium text-slate-800">
                    <span className="flex items-center gap-2"><item.icon className="size-4 text-slate-500" aria-hidden />{item.label}</span>
                  </th>
                  {ROLES.map((role) => (
                    <td key={role.id} className="px-2 py-3">
                      <LevelSelect role={role} module={item} value={matrix[keyOf(role.id, item.module)] || 'NONE'} onChange={setLevel} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 flex items-center gap-1.5 text-xs text-slate-500"><Lock className="size-3.5" aria-hidden />Administrators always keep full access to Settings, so the system can't be locked.</p>
        <div className="mt-4 flex justify-end"><Button icon={Save} loading={save.isPending} onClick={() => save.mutate()}>Save permissions</Button></div>
      </CardBody>
    </Card>
  );
}

function LevelSelect({ role, module, value, onChange }) {
  const locked = isLocked(role.id, module.module);
  return (
    <select
      value={value}
      disabled={locked}
      onChange={(event) => onChange(role.id, module.module, event.target.value)}
      aria-label={`${role.label} access to ${module.label}`}
      className="h-9 w-full rounded-lg border border-slate-300 bg-white px-2 text-sm focus:border-brand-600 focus:ring-2 focus:ring-brand-100 focus:outline-none disabled:bg-slate-50 disabled:text-slate-500"
    >
      {LEVELS.map((level) => <option key={level.value} value={level.value}>{level.label}</option>)}
    </select>
  );
}

const ACTIONS = [
  { id: 'APPOINTMENT_COMPLETE', label: 'Write prescriptions & complete appointments', hint: 'Usually the doctor. Editing a completed prescription is always administrator only' },
  { id: 'APPOINTMENT_APPROVE_DELETE', label: 'Approve appointment deletions', hint: 'Others can only request a deletion' },
  { id: 'PRESCRIPTION_VIEW', label: 'View & print prescriptions', hint: 'Completed prescriptions, read-only' },
  { id: 'IPD_DISCHARGE', label: 'Discharge IPD patients' },
];

/** Individual actions per role. Administrators always have every action. */
function ActionMatrix({ actions }) {
  const { refresh } = useAuth();
  const [allowed, setAllowed] = useState({});
  useEffect(() => {
    setAllowed(Object.fromEntries(actions.map((a) => [keyOf(a.role, a.action), a.allowed])));
  }, [actions]);
  const save = useApiMutation(
    () => permissionsApi.updateActions(ACTIONS.map((a) => ({ role: 'STAFF', action: a.id, allowed: Boolean(allowed[keyOf('STAFF', a.id)]) }))),
    { success: 'Action permissions saved', invalidate: [permissionsApi.key], onSuccess: refresh },
  );
  const toggle = (action) => setAllowed((current) => ({ ...current, [keyOf('STAFF', action)]: !current[keyOf('STAFF', action)] }));

  return (
    <Card className="max-w-4xl">
      <CardHeader title="Actions" subtitle="Allow or block specific actions for each role" />
      <CardBody>
        <div className="relative overflow-x-auto">
          <table className="w-full min-w-[28rem] text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase">
                <th scope="col" className="py-2 pr-4">Action</th>
                {ROLES.map((role) => <th key={role.id} scope="col" className="px-2 py-2 text-center">{role.label}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ACTIONS.map((action) => (
                <tr key={action.id}>
                  <th scope="row" className="py-3 pr-4 text-left font-medium text-slate-800">
                    {action.label}
                    {action.hint && <span className="block text-xs font-normal text-slate-500">{action.hint}</span>}
                  </th>
                  <td className="px-2 py-3 text-center"><input type="checkbox" checked disabled aria-label={`Administrator: ${action.label}`} className="size-4 rounded border-slate-300 text-brand-700" /></td>
                  <td className="px-2 py-3 text-center">
                    <input type="checkbox" checked={Boolean(allowed[keyOf('STAFF', action.id)])} onChange={() => toggle(action.id)} aria-label={`Staff: ${action.label}`}
                      className="size-4 rounded border-slate-300 text-brand-700 focus:ring-brand-600" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-slate-500">Tip: to hide a whole module from a role's menu, set it to "No access" in Role permissions above.</p>
        <div className="mt-4 flex justify-end"><Button icon={Save} loading={save.isPending} onClick={() => save.mutate()}>Save actions</Button></div>
      </CardBody>
    </Card>
  );
}
