import { ChevronLeft, ChevronRight } from 'lucide-react';

/** "Showing 21–40 of 132" with previous/next buttons. */
export default function Pagination({ page, size, totalElements, totalPages, onChange }) {
  if (!totalElements) return null;
  const start = page * size + 1;
  const end = Math.min(totalElements, (page + 1) * size);
  const buttonClass = 'inline-flex size-9 items-center justify-center rounded-lg ring-1 ring-inset ring-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent';

  return (
    <nav aria-label="Pagination" className="flex items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">
      <p className="text-sm text-slate-500">
        <span className="font-medium text-slate-700">{start}–{end}</span> of {totalElements}
      </p>
      <div className="flex items-center gap-2">
        <span className="hidden text-sm text-slate-500 sm:inline">Page {page + 1} of {totalPages}</span>
        <button type="button" className={buttonClass} disabled={page === 0} onClick={() => onChange(page - 1)} aria-label="Previous page">
          <ChevronLeft className="size-4" />
        </button>
        <button type="button" className={buttonClass} disabled={page + 1 >= totalPages} onClick={() => onChange(page + 1)} aria-label="Next page">
          <ChevronRight className="size-4" />
        </button>
      </div>
    </nav>
  );
}
