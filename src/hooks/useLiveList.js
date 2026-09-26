import { useClinicSettings } from './useClinicSettings';

/**
 * Query options for overview lists (queue, dashboard, admissions, beds, patients) so every device sees
 * changes made on other devices: refresh every N seconds from Settings, and as soon as the screen is
 * opened again. Only used for lists, never for forms or the prescription pad; 0 in Settings turns it off.
 * Refreshing pauses while the app is in the background.
 */
export function useLiveList() {
  const { data } = useClinicSettings();
  const seconds = data?.autoRefreshSeconds ?? 10;
  return seconds > 0 ? { refetchInterval: seconds * 1000, refetchOnWindowFocus: true } : {};
}
