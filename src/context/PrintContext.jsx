import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import { templatesApi } from '../api/endpoints';
import { useClinicSettings } from '../hooks/useClinicSettings';
import { useToast } from './ToastContext';
import DocumentTemplate from '../components/print/DocumentTemplate';

const PrintContext = createContext(null);

/**
 * Renders a document into a print-only area and opens the browser print dialog.
 * Usage: const print = usePrint(); print({ type: 'APPOINTMENT_SLIP', title, content: <... /> })
 */
export function PrintProvider({ children }) {
  const [job, setJob] = useState(null);
  const toast = useToast();
  const { data: settings } = useClinicSettings();
  const templates = useQuery({ queryKey: [templatesApi.key], queryFn: templatesApi.list, staleTime: 60 * 1000 });

  const print = useCallback((request) => {
    const template = templates.data?.find((item) => item.templateType === request.type);
    if (!template) { toast.error('Print template is not available yet. Please try again.'); return; }
    setJob({ ...request, template });
  }, [templates.data, toast]);

  useEffect(() => {
    if (!job) return undefined;
    const done = () => setJob(null);
    window.addEventListener('afterprint', done, { once: true });
    const timer = setTimeout(() => window.print(), 150);
    return () => { clearTimeout(timer); window.removeEventListener('afterprint', done); };
  }, [job]);

  return (
    <PrintContext.Provider value={print}>
      {children}
      {job && createPortal(<PrintArea job={job} settings={settings} />, document.body)}
    </PrintContext.Provider>
  );
}

function PrintArea({ job, settings }) {
  const { template } = job;
  const Page = job.document || DocumentTemplate;
  return (
    <div id="print-root">
      <style>{`@page { size: ${template.pageWidth}px ${template.pageHeight}px; margin: 0; }`}</style>
      <Page template={template} settings={settings} title={job.title} date={job.date} {...job.documentProps}>
        {job.content}
      </Page>
    </div>
  );
}

export function usePrint() {
  return useContext(PrintContext);
}
