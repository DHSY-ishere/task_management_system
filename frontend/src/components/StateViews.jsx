export function LoadingState({ count = 6 }) {
  return (
    <div className="task-grid" role="status" aria-live="polite" aria-label="Loading tasks">
      {Array.from({ length: count }, (_, i) => (
        <div className="card skeleton" key={i}>
          <div className="sk-line sk-w60" />
          <div className="sk-line" />
          <div className="sk-line sk-w80" />
          <div className="sk-line sk-w40" />
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ filtered, onCreate, onClear }) {
  return (
    <div className="state-box">
      <div className="state-icon" aria-hidden="true">
        {filtered ? '🔍' : '📝'}
      </div>
      <h3>{filtered ? 'No tasks match your filters' : 'No tasks yet'}</h3>
      <p>
        {filtered
          ? 'Try a different search term or clear the filters.'
          : 'Create your first task to get started.'}
      </p>
      {filtered ? (
        <button type="button" className="btn btn-ghost" onClick={onClear}>
          Clear filters
        </button>
      ) : (
        <button type="button" className="btn btn-primary" onClick={onCreate}>
          + New task
        </button>
      )}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="state-box state-error" role="alert">
      <div className="state-icon" aria-hidden="true">
        ⚠️
      </div>
      <h3>Something went wrong</h3>
      <p>{message}</p>
      <button type="button" className="btn btn-primary" onClick={onRetry}>
        Try again
      </button>
    </div>
  );
}
