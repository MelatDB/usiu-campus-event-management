import React from 'react';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages: number[] = [];
  const start = Math.max(0, page - 2);
  const end = Math.min(totalPages - 1, page + 2);
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <div className="pagination">
      <button disabled={page === 0} onClick={() => onPageChange(page - 1)}>
        <i className="fas fa-chevron-left"></i>
      </button>

      {start > 0 && (
        <>
          <button onClick={() => onPageChange(0)}>1</button>
          {start > 1 && <span className="page-info">...</span>}
        </>
      )}

      {pages.map((p) => (
        <button key={p} className={p === page ? 'active' : ''} onClick={() => onPageChange(p)}>
          {p + 1}
        </button>
      ))}

      {end < totalPages - 1 && (
        <>
          {end < totalPages - 2 && <span className="page-info">...</span>}
          <button onClick={() => onPageChange(totalPages - 1)}>{totalPages}</button>
        </>
      )}

      <button disabled={page >= totalPages - 1} onClick={() => onPageChange(page + 1)}>
        <i className="fas fa-chevron-right"></i>
      </button>
    </div>
  );
};

export default Pagination;
