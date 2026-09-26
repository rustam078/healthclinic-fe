import { useQuery } from '@tanstack/react-query';
import { settingsApi } from '../api/endpoints';

/** Clinic name, contact and branding (public endpoint, cached app-wide). */
export function useClinicSettings() {
  return useQuery({ queryKey: [settingsApi.key], queryFn: settingsApi.get, staleTime: 5 * 60 * 1000 });
}
