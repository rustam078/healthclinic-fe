import { useQuery } from '@tanstack/react-query';
import { bedsApi } from '../api/endpoints';

/** Beds that can take a new admission, grouped by room; the current bed of an admission stays listed. */
export function useBedOptions(currentBedId) {
  const query = useQuery({
    queryKey: [bedsApi.key, 'options'],
    queryFn: () => bedsApi.list({ size: 100 }),
  });
  const beds = (query.data?.content || []).filter((bed) => ['AVAILABLE', 'RESERVED'].includes(bed.status) || bed.id === currentBedId);
  return { options: groupByRoom(beds), isLoading: query.isPending, empty: !query.isPending && beds.length === 0 };
}

function groupByRoom(beds) {
  const groups = new Map();
  beds.forEach((bed) => {
    const key = `Room ${bed.roomNumber} · ${bed.roomType.replace('_', ' ').toLowerCase()}`;
    if (!groups.has(key)) groups.set(key, []);
    const suffix = bed.status === 'RESERVED' ? ' (reserved)' : '';
    groups.get(key).push({ value: String(bed.id), label: `Bed ${bed.bedNumber}${suffix}` });
  });
  return [...groups].map(([label, options]) => ({ label, options }));
}
