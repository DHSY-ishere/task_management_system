export default function Header({ theme, onToggleTheme, onCreate }) {
  return (
    <header className="app-header">
      <div className="container header-inner">
        <div className="brand">
          <span className="brand-logo" aria-hidden="true">
            ✓
          </span>
          <span className="brand-name">TaskFlow</span>
        </div>
        <div className="header-actions">
          <button
            type="button"
            className="btn btn-ghost btn-icon"
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title="Toggle theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button type="button" className="btn btn-primary" onClick={onCreate}>
            + New task
          </button>
        </div>
      </div>
    </header>
  );
}
