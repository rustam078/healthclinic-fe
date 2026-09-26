import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../context/ToastContext';

/** Paged list for any resource created with createResource(). */
export function useList(resource, params, options = {}) {
  return useQuery({
    queryKey: [resource.key, 'list', params],
    queryFn: () => resource.list(params),
    placeholderData: keepPreviousData,
    ...options,
  });
}

export function useItem(resource, id, options = {}) {
  return useQuery({
    queryKey: [resource.key, 'item', String(id)],
    queryFn: () => resource.get(id),
    enabled: Boolean(id),
    ...options,
  });
}

export function useReport(resource, params) {
  return useQuery({
    queryKey: [resource.key, 'report', params],
    queryFn: () => resource.report(params),
    placeholderData: keepPreviousData,
  });
}

/**
 * Wraps any API call in a mutation that shows a toast and refreshes cached data.
 * `invalidate` lists extra query keys (resource keys) to refresh besides the resource itself.
 */
export function useApiMutation(mutationFn, { success, invalidate = [], onSuccess } = {}) {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn,
    onSuccess: (result, variables) => {
      invalidate.forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));
      if (success) toast.success(typeof success === 'function' ? success(result) : success);
      onSuccess?.(result, variables);
    },
    onError: (error) => toast.error(error.message),
  });
}

/** Create or update depending on whether an id is given. */
export function useSave(resource, id, options = {}) {
  const save = (body) => (id ? resource.update(id, body) : resource.create(body));
  return useApiMutation(save, {
    success: id ? 'Changes saved' : 'Saved successfully',
    invalidate: [resource.key, 'activity', 'dashboard', ...(options.invalidate || [])],
    onSuccess: options.onSuccess,
  });
}
