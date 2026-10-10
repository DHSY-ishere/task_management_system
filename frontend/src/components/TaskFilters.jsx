import { PRIORITY_OPTIONS, SORT_OPTIONS, STATUS_OPTIONS } from '../utils/constants';

export default function TaskFilters({ filters, onChange, onClear, hasActiveFilters }) {
  const set = (key) => (e) => onChange({ [key]: e.target.value });

  return (
    <section className="filters" aria-label="Search, filter and sort tasks">
      <div className="search-box">
        <input
          type="search"
          value={filters.search}
          onChange={set('search')}
          placeholder="Search by title or description…"
          aria-label="Search tasks"
        />
      </div>

      <select value={filters.status} onChange={set('status')} aria-label="Filter by status">
        <option value="">All statuses</option>
        {STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <select value={filters.priority} onChange={set('priority')} aria-label="Filter by priority">
        <option value="">All priorities</option>
        {PRIORITY_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <div className="sort-group">
        <select value={filters.sortBy} onChange={set('sortBy')} aria-label="Sort by">
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              Sort: {o.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="btn btn-ghost btn-icon"
          onClick={() => onChange({ order: filters.order === 'asc' ? 'desc' : 'asc' })}
          aria-label={`Sort order: ${filters.order === 'asc' ? 'ascending' : 'descending'}. Click to toggle`}
          title={filters.order === 'asc' ? 'Ascending' : 'Descending'}
        >
          {filters.order === 'asc' ? '↑' : '↓'}
        </button>
      </div>

      {hasActiveFilters && (
        <button type="button" className="btn btn-ghost" onClick={onClear}>
          Clear
        </button>
      )}
    </section>
  );
}
