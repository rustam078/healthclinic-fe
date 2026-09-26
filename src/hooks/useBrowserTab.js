import { useEffect } from 'react';
import { useClinicSettings } from './useClinicSettings';

const DEFAULT_ICON = '/assets/logo/default-logo.svg';

/** Browser tab title: "<page> · <clinic name from Settings>". */
export function usePageTitle(title) {
  const { data: settings } = useClinicSettings();
  const clinic = settings?.clinicName || 'Clinic';
  useEffect(() => {
    document.title = title ? `${title} · ${clinic}` : clinic;
  }, [title, clinic]);
}

/** Browser tab icon: the clinic logo from Settings (the neutral default until one is uploaded). */
export function useTabIcon() {
  const { data: settings } = useClinicSettings();
  const href = settings?.logoUrl || DEFAULT_ICON;
  useEffect(() => {
    let link = document.querySelector("link[rel='icon']");
    if (!link) {
      link = document.head.appendChild(document.createElement('link'));
      link.rel = 'icon';
    }
    link.removeAttribute('type');
    link.href = href;
  }, [href]);
}
