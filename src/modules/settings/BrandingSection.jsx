import { useRef, useState } from 'react';
import { z } from 'zod';
import { ImageUp, Save, Trash2 } from 'lucide-react';
import { settingsApi } from '../../api/endpoints';
import { useApiMutation } from '../../hooks/useResource';
import { useEntityForm } from '../../hooks/useEntityForm';
import { useClinicSettings } from '../../hooks/useClinicSettings';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { QueryState } from '../../components/ui/States';
import Button from '../../components/ui/Button';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import LogoBox from '../../components/print/LogoBox';
import { FormGrid, SelectField, TextField } from '../../components/form/Fields';
import { intRange, optionalText, requiredChoice } from '../../utils/validation';
import { LOGO_POSITION_OPTIONS } from '../../utils/options';
import { useSettingsSave } from './ClinicSection';

const MAX_BYTES = 2 * 1024 * 1024;
const TYPES = ['image/png', 'image/jpeg', 'image/webp'];

const schema = z.object({
  logoWidth: intRange('Logo width', 20, 600),
  logoHeight: intRange('Logo height', 20, 300),
  logoPosition: requiredChoice('Logo position'),
  headerText: optionalText('Header text'),
  footerText: optionalText('Footer text'),
});

export default function BrandingSection() {
  const query = useClinicSettings();
  return (
    <QueryState query={query}>
      {(settings) => (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <LogoCard settings={settings} />
          <BrandingForm settings={settings} />
        </div>
      )}
    </QueryState>
  );
}

/** Upload, replace, preview and remove the clinic logo. The file is stored on the server, never hardcoded. */
function LogoCard({ settings }) {
  const { can } = useAuth();
  const toast = useToast();
  const input = useRef(null);
  const [confirming, setConfirming] = useState(false);
  const upload = useApiMutation(settingsApi.uploadLogo, { success: 'Logo saved', invalidate: [settingsApi.key] });
  const remove = useApiMutation(settingsApi.removeLogo, { success: 'Logo removed', invalidate: [settingsApi.key], onSuccess: () => setConfirming(false) });
  const canWrite = can('SETTINGS', 'WRITE');

  const onFile = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!TYPES.includes(file.type)) { toast.error('Only PNG, JPG or WebP images are allowed'); return; }
    if (file.size > MAX_BYTES) { toast.error('The file is too large. Maximum size is 2 MB'); return; }
    upload.mutate(file);
  };

  return (
    <Card>
      <CardHeader title="Clinic logo" subtitle="PNG, JPG or WebP up to 2 MB. It is scaled to fit — never stretched or cropped." />
      <CardBody className="space-y-4">
        <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-[repeating-conic-gradient(#f1f5f9_0_25%,#fff_0_50%)] bg-[length:16px_16px] p-4">
          <LogoBox src={settings.logoUrl} width={settings.logoWidth} height={settings.logoHeight} stretch className="outline outline-1 outline-dashed outline-teal-300" />
        </div>
        <p className="text-xs text-slate-500">
          {settings.logoUrl ? 'Uploaded logo' : 'No logo uploaded — the default placeholder is shown'} · display area {settings.logoWidth} × {settings.logoHeight} px (dashed outline)
        </p>
        {canWrite && (
          <div className="flex flex-wrap gap-2">
            <input ref={input} type="file" accept={TYPES.join(',')} onChange={onFile} className="sr-only" aria-label="Choose logo file" />
            <Button icon={ImageUp} loading={upload.isPending} onClick={() => input.current.click()}>{settings.logoUrl ? 'Replace logo' : 'Upload logo'}</Button>
            {settings.logoUrl && <Button variant="secondary" icon={Trash2} onClick={() => setConfirming(true)}>Remove</Button>}
          </div>
        )}
        <ConfirmDialog
          open={confirming} onClose={() => setConfirming(false)} onConfirm={() => remove.mutate()} loading={remove.isPending} danger
          title="Remove the clinic logo?" message="Documents and the sign-in page will show the default placeholder until a new logo is uploaded." confirmLabel="Remove logo"
        />
      </CardBody>
    </Card>
  );
}

function BrandingForm({ settings }) {
  const { can } = useAuth();
  const readOnly = !can('SETTINGS', 'WRITE');
  const defaults = Object.fromEntries(Object.keys(schema.shape).map((key) => [key, settings[key] ?? '']));
  const form = useEntityForm({ schema, defaultValues: defaults, mutation: useSettingsSave(settings) });
  const { register, errorOf, watch } = form;
  const [width, height, position, headerText] = watch(['logoWidth', 'logoHeight', 'logoPosition', 'headerText']);

  return (
    <Card>
      <CardHeader title="Header branding" subtitle="Logo size and placement used in the sidebar, sign-in page and document headers" />
      <CardBody>
        <form onSubmit={form.submit} noValidate>
          <fieldset disabled={readOnly} className="space-y-4">
            <FormGrid columns={3}>
              <TextField label="Logo width (px)" type="number" min="20" max="600" error={errorOf('logoWidth')} {...register('logoWidth')} />
              <TextField label="Logo height (px)" type="number" min="20" max="300" error={errorOf('logoHeight')} {...register('logoHeight')} />
              <SelectField label="Logo position" options={LOGO_POSITION_OPTIONS} error={errorOf('logoPosition')} {...register('logoPosition')} />
            </FormGrid>
            <TextField label="Header tagline" placeholder="e.g. Quality care, close to home" error={errorOf('headerText')} {...register('headerText')} />
            <TextField label="Footer text" placeholder="Shown at the bottom of printed documents" error={errorOf('footerText')} {...register('footerText')} />
            <HeaderPreview settings={settings} width={Number(width) || 20} height={Number(height) || 20} position={position} tagline={headerText} />
            {!readOnly && <div className="flex justify-end"><Button type="submit" icon={Save} loading={form.saving}>Save branding</Button></div>}
          </fieldset>
        </form>
      </CardBody>
    </Card>
  );
}

/** Live preview of the document header as values are typed. */
function HeaderPreview({ settings, width, height, position, tagline }) {
  const reverse = position === 'RIGHT' ? 'flex-row-reverse' : '';
  const center = position === 'CENTER' ? 'flex-col text-center' : '';
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white p-4">
      <p className="mb-2 text-xs font-medium text-slate-500">Preview</p>
      <div className={`flex items-center gap-4 border-b border-slate-200 pb-3 ${reverse} ${center}`}>
        <LogoBox src={settings.logoUrl} width={Math.min(width, 600)} height={Math.min(height, 300)} position={position} stretch className="outline outline-1 outline-dashed outline-slate-300" />
        <div className={position === 'LEFT' ? 'text-right flex-1' : 'flex-1'}>
          <p className="font-semibold text-brand-800">{settings.clinicName}</p>
          {tagline && <p className="text-xs text-slate-500 italic">{tagline}</p>}
        </div>
      </div>
    </div>
  );
}
