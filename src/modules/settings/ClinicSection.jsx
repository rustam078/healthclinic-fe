import { z } from 'zod';
import { Save } from 'lucide-react';
import { settingsApi } from '../../api/endpoints';
import { useApiMutation } from '../../hooks/useResource';
import { useEntityForm } from '../../hooks/useEntityForm';
import { useClinicSettings } from '../../hooks/useClinicSettings';
import { useAuth } from '../../context/AuthContext';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { QueryState } from '../../components/ui/States';
import Button from '../../components/ui/Button';
import { FormGrid, SelectField, TextAreaField, TextField } from '../../components/form/Fields';
import { optionalEmail, optionalText, requiredText } from '../../utils/validation';

const schema = z.object({
  clinicName: requiredText('Clinic name', 120),
  address: optionalText('Address'),
  phone: optionalText('Phone', 30),
  email: optionalEmail(),
  website: optionalText('Website', 120),
  registrationNo: optionalText('Registration number', 60),
  currencySymbol: requiredText('Currency symbol', 5),
  availabilityText: optionalText('Availability', 60),
  sidebarMode: z.enum(['FULL', 'ICONS']),
  autoRefreshSeconds: z.coerce.number().int().min(0).max(600),
});

const REFRESH_OPTIONS = [
  { value: '0', label: 'Off — only when a screen is opened' }, { value: '5', label: 'Every 5 seconds' },
  { value: '10', label: 'Every 10 seconds (recommended)' }, { value: '15', label: 'Every 15 seconds' },
  { value: '30', label: 'Every 30 seconds' }, { value: '60', label: 'Every minute' }, { value: '120', label: 'Every 2 minutes' },
];

const pick = (settings) => ({ ...Object.fromEntries(Object.keys(schema.shape).map((key) => [key, settings[key] ?? ''])), sidebarMode: settings.sidebarMode || 'FULL', autoRefreshSeconds: String(settings.autoRefreshSeconds ?? 10) });

/** Saves a partial change by merging it over the current settings (the API expects the whole record). */
export function useSettingsSave(settings) {
  return useApiMutation((changes) => settingsApi.update({ ...settings, ...changes }), {
    success: 'Settings saved', invalidate: [settingsApi.key],
  });
}

export default function ClinicSection() {
  const query = useClinicSettings();
  return <QueryState query={query}>{(settings) => <ClinicForm settings={settings} />}</QueryState>;
}

function ClinicForm({ settings }) {
  const { can } = useAuth();
  const readOnly = !can('SETTINGS', 'WRITE');
  const form = useEntityForm({ schema, defaultValues: pick(settings), mutation: useSettingsSave(settings) });
  const { register, errorOf } = form;
  return (
    <Card className="max-w-3xl">
      <CardHeader title="Clinic information" subtitle="Shown on printed documents and the sign-in page" />
      <CardBody>
        <form onSubmit={form.submit} noValidate>
          <fieldset disabled={readOnly} className="space-y-4">
            <FormGrid>
              <TextField label="Clinic name" required className="sm:col-span-2" error={errorOf('clinicName')} {...register('clinicName')} />
              <TextAreaField label="Address" rows={2} className="sm:col-span-2" error={errorOf('address')} {...register('address')} />
              <TextField label="Phone" type="tel" error={errorOf('phone')} {...register('phone')} />
              <TextField label="Email" type="email" error={errorOf('email')} {...register('email')} />
              <TextField label="Website" error={errorOf('website')} {...register('website')} />
              <TextField label="Registration number" error={errorOf('registrationNo')} {...register('registrationNo')} />
              <TextField label="Currency symbol" required hint="Used when showing fees and estimates" error={errorOf('currencySymbol')} {...register('currencySymbol')} />
              <SelectField label="Menu style (default)" hint="Users can still collapse or expand the menu" options={[{ value: 'FULL', label: 'Full — icons and names' }, { value: 'ICONS', label: 'Compact — icons only' }]} {...register('sidebarMode')} />
              <SelectField label="Auto-refresh lists" hint="Queue, dashboard, admissions and patient lists update by themselves on every device"
                options={REFRESH_OPTIONS} error={errorOf('autoRefreshSeconds')} {...register('autoRefreshSeconds')} />
              <TextField label="Availability highlight" placeholder="24×7" hint="Shown in the prescription header, e.g. 24×7" error={errorOf('availabilityText')} {...register('availabilityText')} />
            </FormGrid>
            {!readOnly && <div className="flex justify-end"><Button type="submit" icon={Save} loading={form.saving}>Save</Button></div>}
          </fieldset>
          {readOnly && <p className="mt-4 text-sm text-slate-500">You can view these settings. Only users with Settings write access can change them.</p>}
        </form>
      </CardBody>
    </Card>
  );
}
