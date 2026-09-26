import { Card } from '../ui/Card';
import { QueryState } from '../ui/States';
import DataTable from './DataTable';
import Pagination from './Pagination';

/**
 * Card containing an optional toolbar, the paged table and pagination, with loading/error/empty states.
 * Used by every list screen so they all look and behave the same.
 */
export default function ResourceList({ query, columns, toolbar, empty, onRowClick, onPageChange, caption }) {
  return (
    <Card className="overflow-hidden">
      {toolbar && <div className="border-b border-slate-100 p-4">{toolbar}</div>}
      <div className={query.isFetching && !query.isPending ? 'opacity-70 transition-opacity' : ''}>
        <QueryState query={query} isEmpty={(page) => page.content.length === 0} empty={empty}>
          {(page) => (
            <>
              <DataTable columns={columns} rows={page.content} onRowClick={onRowClick} caption={caption} />
              <Pagination {...page} onChange={onPageChange} />
            </>
          )}
        </QueryState>
      </div>
    </Card>
  );
}
