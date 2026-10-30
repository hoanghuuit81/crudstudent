import type { PaginationMeta } from "../types/api";

interface PaginationProps {
  meta: PaginationMeta;
  onChange: (page: number) => void;
}

export function Pagination({ meta, onChange }: PaginationProps) {
  if (meta.totalPages <= 1) return null;

  return (
    <nav className="pagination" aria-label="Phân trang">
      <button className="button secondary" disabled={meta.page <= 1} onClick={() => onChange(meta.page - 1)}>
        ← Trước
      </button>
      <span>
        Trang <strong>{meta.page}</strong> / {meta.totalPages} · {meta.total} kết quả
      </span>
      <button
        className="button secondary"
        disabled={meta.page >= meta.totalPages}
        onClick={() => onChange(meta.page + 1)}
      >
        Sau →
      </button>
    </nav>
  );
}
