import { useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import { RotateCcw, Save } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { templatesApi } from '../../api/endpoints';
import { useApiMutation } from '../../hooks/useResource';
import { useEntityForm } from '../../hooks/useEntityForm';
import { useClinicSettings } from '../../hooks/useClinicSettings';
import { useAuth } from '../../context/AuthContext';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { QueryState } from '../../components/ui/States';
import Button from '../../components/ui/Button';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import DocumentTemplate from '../../components/print/DocumentTemplate';
import {
  CheckboxField, FormGrid, FormSection, SelectField, TextField,
} from '../../components/form/Fields';
import { intRange, optionalText, requiredText } from '../../utils/validation';
import { labelize } from '../../utils/format';
import TemplateSample from './TemplateSample';
import { PrescriptionDocument } from '../appointment/prescription/PrescriptionSheet';

const baseSchema = z.object({
  title: requiredText('Document title', 120),
  pageWidth: intRange('Page width', 200, 2000),
  pageHeight: intRange('Page height', 200, 3000),
  headerHeight: intRange('Header height', 40, 400),
  logoAreaWidth: intRange('Logo area width', 20, 600),
  logoAreaHeight: intRange('Logo area height', 20, 300),
  padding: intRange('Side padding', 0, 100),
  paddingTop: intRange('Top padding', 0, 200),
  paddingBottom: intRange('Bottom padding', 0, 200),
  headerPaddingTop: intRange('Space above header content', 0, 200),
  headerTextAlign: z.enum(['AUTO', 'LEFT', 'CENTER', 'RIGHT']),
  margin: intRange('Margin', 0, 100),
  showLogo: z.boolean(),
  showFooter: z.boolean(),
  footerText: optionalText('Footer text'),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Choose a colour'),
});
const schemaShape = baseSchema.shape;

const schema = baseSchema.refine((t) => t.logoAreaHeight + t.headerPaddingTop <= t.headerHeight, { path: ['logoAreaHeight'], message: 'The logo and the top space do not fit in the header height' })
  .refine((t) => t.logoAreaWidth <= t.pageWidth - 2 * t.padding, { path: ['logoAreaWidth'], message: 'Logo area is wider than the page content' });

const PAGE_PRESETS = [
  { value: '794x1123', label: 'A4 portrait (794 × 1123)' },
  { value: '1123x794', label: 'A4 landscape (1123 × 794)' },
  { value: '559x794', label: 'A5 portrait (559 × 794)' },
  { value: '816x1056', label: 'US Letter (816 × 1056)' },
];

/** Configure printable templates; the preview updates instantly as dimensions change. */
export default function TemplateSection() {
  const query = useQuery({ queryKey: [templatesApi.key], queryFn: templatesApi.list });
  const [type, setType] = useState('APPOINTMENT_SLIP');
  return (
    <QueryState query={query}>
      {(templates) => {
        const template = templates.find((item) => item.templateType === type) || templates[0];
        return (
          <div className="space-y-4">
            <Card className="p-4">
              <SelectField label="Template" value={template.templateType} onChange={(event) => setType(event.target.value)}
                options={templates.map((item) => ({ value: item.templateType, label: `${item.title} (${labelize(item.templateType)})` }))} className="max-w-md" />
            </Card>
            <TemplateEditor key={`${template.templateType}-${template.updatedAt}`} template={template} />
          </div>
        );
      }}
    </QueryState>
  );
}

function TemplateEditor({ template }) {
  const { can } = useAuth();
  const readOnly = !can('SETTINGS', 'WRITE');
  const [confirmReset, setConfirmReset] = useState(false);
  const save = useApiMutation((body) => templatesApi.update(template.templateType, body), { success: 'Template saved', invalidate: [templatesApi.key] });
  const reset = useApiMutation(() => templatesApi.reset(template.templateType), { success: 'Template reset to default', invalidate: [templatesApi.key], onSuccess: () => setConfirmReset(false) });
  const defaults = Object.fromEntries(Object.keys(schemaShape).map((key) => [key, template[key] ?? '']));
  const form = useEntityForm({ schema, defaultValues: defaults, mutation: save });
  const live = schema.safeParse(form.watch());
  const preview = { ...template, ...(live.success ? live.data : lastValid(form.watch(), template)) };

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,26rem)_1fr]">
      <Card>
        <CardHeader title="Layout" subtitle="All sizes are in pixels (96 per inch)" />
        <CardBody>
          <form onSubmit={form.submit} noValidate>
            <fieldset disabled={readOnly} className="space-y-6">
              <TemplateFields form={form} />
              {!readOnly && (
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
                  <Button variant="ghost" icon={RotateCcw} onClick={() => setConfirmReset(true)}>Reset to default</Button>
                  <Button type="submit" icon={Save} loading={form.saving}>Save template</Button>
                </div>
              )}
            </fieldset>
          </form>
        </CardBody>
      </Card>
      <Card className="overflow-hidden xl:sticky xl:top-20 xl:self-start">
        <CardHeader title="Preview" subtitle={`${preview.pageWidth} × ${preview.pageHeight} px · scaled to fit`} />
        <ScaledPreview template={preview} />
      </Card>
      <ConfirmDialog open={confirmReset} onClose={() => setConfirmReset(false)} onConfirm={() => reset.mutate()} loading={reset.isPending}
        title="Reset this template?" message="All layout values for this document return to the professional default." confirmLabel="Reset template" />
    </div>
  );
}

/** While a number field is being typed (e.g. empty), keep the last valid value in the preview. */
function lastValid(values, template) {
  const result = {};
  Object.entries(values).forEach(([key, value]) => {
    const parsed = schemaShape[key]?.safeParse(value);
    result[key] = parsed?.success ? parsed.data : template[key];
  });
  return result;
}

function TemplateFields({ form }) {
  const { register, errorOf, setValue, watch } = form;
  const size = `${watch('pageWidth')}x${watch('pageHeight')}`;
  const applyPreset = (value) => {
    const [width, height] = value.split('x').map(Number);
    setValue('pageWidth', width, { shouldValidate: true });
    setValue('pageHeight', height, { shouldValidate: true });
  };
  const number = (name, label, extra = {}) => <TextField label={label} type="number" inputMode="numeric" error={errorOf(name)} {...extra} {...register(name)} />;
  return (
    <>
      <ThemeColour form={form} />
      <FormSection title="Document">
        <div className="space-y-4">
          <TextField label="Document title" error={errorOf('title')} {...register('title')} />
          <SelectField label="Page size preset" placeholder="Custom size" value={PAGE_PRESETS.some((p) => p.value === size) ? size : ''} onChange={(e) => e.target.value && applyPreset(e.target.value)} options={PAGE_PRESETS} />
          <FormGrid>{number('pageWidth', 'Page width')}{number('pageHeight', 'Page height')}</FormGrid>
        </div>
      </FormSection>
      <FormSection title="Header & logo area">
        <FormGrid>
          {number('headerHeight', 'Header height')}
          {number('headerPaddingTop', 'Space above header content')}
          {number('logoAreaWidth', 'Logo area width')}
          {number('logoAreaHeight', 'Logo area height')}
        </FormGrid>
        <CheckboxField label="Show logo" className="mt-3" {...register('showLogo')} />
      </FormSection>
      <FormSection title="Page spacing">
        <FormGrid>
          {number('paddingTop', 'Top padding')}
          {number('paddingBottom', 'Bottom padding')}
          {number('padding', 'Side padding (left & right)')}
          {number('margin', 'Section margin')}
        </FormGrid>
      </FormSection>
      <FormSection title="Footer">
        <CheckboxField label="Show footer" {...register('showFooter')} />
        <TextField label="Footer text" className="mt-3" error={errorOf('footerText')} {...register('footerText')} />
      </FormSection>
    </>
  );
}

/** First section: the document's theme colour; the preview follows instantly. */
function ThemeColour({ form }) {
  const { register, errorOf, watch } = form;
  return (
    <FormSection title="Theme colour">
      <div className="flex flex-wrap items-end gap-3">
        <TextField label="Accent colour" type="color" className="w-24 [&_input]:p-1" error={errorOf('accentColor')} {...register('accentColor')} />
        <span className="pb-2.5 font-mono text-sm text-slate-600">{watch('accentColor')}</span>
      </div>
    </FormSection>
  );
}

/** Renders the real DocumentTemplate at full size and scales it down to the card width. */
function ScaledPreview({ template }) {
  const { data: settings } = useClinicSettings();
  const box = useRef(null);
  const [width, setWidth] = useState(600);
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(box.current);
    return () => observer.disconnect();
  }, []);
  const scale = Math.min(1, (width - 32) / template.pageWidth);
  const Page = template.templateType === 'PRESCRIPTION' ? PrescriptionDocument : DocumentTemplate;
  return (
    <div ref={box} className="bg-slate-100 p-4">
      <div style={{ width: template.pageWidth * scale, height: template.pageHeight * scale }} className="mx-auto overflow-hidden shadow-lg ring-1 ring-slate-300">
        <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: template.pageWidth }}>
          <Page template={template} settings={settings}>
            <TemplateSample type={template.templateType} template={template} />
          </Page>
        </div>
      </div>
    </div>
  );
}
