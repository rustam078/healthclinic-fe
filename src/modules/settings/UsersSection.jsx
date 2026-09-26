import { z } from 'zod';
import { Plus, Save, UserCog } from 'lucide-react';
import { usersApi } from '../../api/endpoints';
import { useList, useSave } from '../../hooks/useResource';
import { useFilters } from '../../hooks/useFilters';
import { useEntityForm } from '../../hooks/useEntityForm';
import { useAuth } from '../../context/AuthContext';
import ResourceList from '../../components/data/ResourceList';
import SearchBar from '../../components/data/SearchBar';
import { FilterBar, FilterSelect } from '../../components/data/Filters';
import { EmptyState } from '../../components/ui/States';
import StatusBadge from '../../components/ui/StatusBadge';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import {
  CheckboxField, FormGrid, SelectField, TextField,
} from '../../components/form/Fields';
import { requiredChoice, requiredText } from '../../utils/validation';
import { ROLE_OPTIONS } from '../../utils/options';
import { formatDate } from '../../utils/format';
import PasswordField from '../../components/form/PasswordField';
import { RowActions, useMasterCrud } from './useMasterCrud';

const password = z.string().min(8, 'Password must be at least 8 characters').max(100, 'Password is too long');

function userSchema(isNew) {
  return z.object({
    username: z.string().trim().regex(/^[a-zA-Z0-9._-]{3,50}$/, 'Use 3-50 letters, digits, dots, dashes or underscores'),
    fullName: requiredText('Full name', 100),
    role: requiredChoice('Role'),
    active: z.boolean(),
    password: isNew ? password : z.union([z.literal(''), password]),
  });
}

const roleLabel = (role) => ROLE_OPTIONS.find((option) => option.value === role)?.label || role;

/** Administrator-only: staff accounts (two roles: Administrator and Staff). */
export default function UsersSection() {
  const { user } = useAuth();
  const [filters, setFilters] = useFilters({ search: '', type: '' });
  const query = useList(usersApi, filters);
  const crud = useMasterCrud(usersApi, { noun: 'User' });

  const columns = [
    { key: 'fullName', header: 'Name', primary: true, render: (row) => <span className="font-medium text-slate-900">{row.fullName}{row.username === user.username ? ' (you)' : ''}</span> },
    { key: 'username', header: 'Username' },
    { key: 'role', header: 'Role', render: (row) => roleLabel(row.role) },
    { key: 'active', header: 'Status', render: (row) => <StatusBadge domain="active" value={row.active} /> },
    { key: 'createdAt', header: 'Created', hideOnMobile: true, render: (row) => formatDate(row.createdAt) },
    { key: 'actions', header: <span className="sr-only">Actions</span>, className: 'text-right', render: (row) => <RowActions row={row} crud={crud} canDelete={row.username !== user.username} /> },
  ];

  return (
    <>
      <ResourceList
        query={query}
        columns={columns}
        toolbar={(
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <SearchBar value={filters.search} onChange={(search) => setFilters({ search })} placeholder="Search name or username" />
            <FilterBar>
              <FilterSelect label="Role" value={filters.type} onChange={(type) => setFilters({ type })} options={ROLE_OPTIONS} />
              <Button icon={Plus} onClick={crud.openNew}>Add user</Button>
            </FilterBar>
          </div>
        )}
        empty={<EmptyState icon={UserCog} title="No users found" />}
        onPageChange={(page) => setFilters({ page })}
        caption="Users"
      />
      <Modal open={Boolean(crud.editing)} onClose={crud.close} title={crud.editing?.id ? 'Edit user' : 'Add user'}>
        {crud.editing && <UserForm account={crud.editing.id ? crud.editing : null} onDone={crud.close} />}
      </Modal>
      {crud.deleteDialog}
    </>
  );
}

function UserForm({ account, onDone }) {
  const mutation = useSave(usersApi, account?.id, { onSuccess: onDone });
  const form = useEntityForm({
    schema: userSchema(!account),
    defaultValues: {
      username: account?.username || '', fullName: account?.fullName || '', role: account?.role || 'STAFF',
      active: account?.active ?? true, password: '',
    },
    mutation,
  });
  const { register, errorOf } = form;
  return (
    <form onSubmit={form.submit} noValidate className="space-y-4">
      <FormGrid>
        <TextField label="Full name" required error={errorOf('fullName')} {...register('fullName')} />
        <TextField label="Username" required autoComplete="off" readOnly={Boolean(account)} hint={account ? 'Usernames cannot be changed' : undefined} error={errorOf('username')} {...register('username')} />
        <SelectField label="Role" required options={ROLE_OPTIONS} hint="What each role can do is set under Permissions" error={errorOf('role')} {...register('role')} />
        <PasswordField label={account ? 'New password' : 'Password'} required={!account} autoComplete="new-password" hint={account ? 'Leave empty to keep the current password' : 'At least 8 characters'} error={errorOf('password')} {...register('password')} />
      </FormGrid>
      <CheckboxField label="Active" hint="Inactive users cannot sign in" {...register('active')} />
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onDone}>Cancel</Button>
        <Button type="submit" icon={Save} loading={form.saving}>Save</Button>
      </div>
    </form>
  );
}
