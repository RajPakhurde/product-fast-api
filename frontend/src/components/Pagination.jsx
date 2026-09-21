function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <nav className="pagination">
      <button
        className="pagination__button"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
      >
        Prev
      </button>

      {pages.map((n) => (
        <button
          key={n}
          className={`pagination__button${n === page ? ' is-active' : ''}`}
          onClick={() => onPageChange(n)}
        >
          {n}
        </button>
      ))}

      <button
        className="pagination__button"
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </button>
    </nav>
  )
}

export default Pagination
