import React from "react";

const getPages = (current, total) => {
  const pages = [];
  const start = Math.max(0, current - 2);
  const end = Math.min(total - 1, start + 4);
  for (let i = start; i <= end; i += 1) pages.push(i);
  return pages;
};

const Pagination = ({ currentPage, totalPages, onChange }) => {
  if (totalPages <= 1) return null;
  const pages = getPages(currentPage, totalPages);

  return (
    <div className="pagination">
      <button
        type="button"
        className="btn btn-secondary"
        onClick={() => onChange(Math.max(0, currentPage - 1))}
        disabled={currentPage === 0}
      >
        Anterior
      </button>
      <div className="pagination-pages">
        {pages.map((page) => (
          <button
            key={page}
            type="button"
            className={`page-btn ${page === currentPage ? "active" : ""}`}
            onClick={() => onChange(page)}
          >
            {page + 1}
          </button>
        ))}
      </div>
      <button
        type="button"
        className="btn btn-secondary"
        onClick={() => onChange(Math.min(totalPages - 1, currentPage + 1))}
        disabled={currentPage === totalPages - 1}
      >
        Siguiente
      </button>
    </div>
  );
};

export default Pagination;
