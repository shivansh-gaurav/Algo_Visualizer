function FilterBar({ filters, active, onFilter }) {
  return (
    <div className="filter-row">
      {filters.map((f) => (
        <button
          key={f.value}
          className={`pill ${active === f.value ? "active" : ""}`}
          onClick={() => onFilter(f.value)}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}

export default FilterBar