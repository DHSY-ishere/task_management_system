import { useCallback, useEffect, useMemo, useState } from 'react';
import Header from './components/Header';
import TaskFilters from './components/TaskFilters';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import TaskDetails from './components/TaskDetails';
import ConfirmDialog from './components/ConfirmDialog';
import Modal from './components/Modal';
import Pagination from './components/Pagination';
import Toast from './components/Toast';
import { EmptyState, ErrorState, LoadingState } from './components/StateViews';
import useTasks from './hooks/useTasks';
import useDebounce from './hooks/useDebounce';
import useTheme from './hooks/useTheme';
import { taskApi } from './services/api';
import { PAGE_SIZE } from './utils/constants';

const DEFAULT_FILTERS = { search: '', status: '', priority: '', sortBy: 'createdAt', order: 'desc' };

export default function App() {
  const { theme, toggle } = useTheme();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  // modal: null | { type: 'create' | 'edit' | 'view' | 'delete', task? }
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);

  const debouncedSearch = useDebounce(filters.search, 400);

  const query = useMemo(
    () => ({
      search: debouncedSearch.trim(),
      status: filters.status,
      priority: filters.priority,
      sortBy: filters.sortBy,
      order: filters.order,
      page,
      limit: PAGE_SIZE,
    }),
    [debouncedSearch, filters.status, filters.priority, filters.sortBy, filters.order, page]
  );

  const { tasks, meta, loading, error, reload } = useTasks(query);

  // If the current page disappears (e.g. last item deleted), step back one page
  useEffect(() => {
    if (!loading && !error && page > meta.totalPages) setPage(meta.totalPages);
  }, [loading, error, page, meta.totalPages]);

  const hasActiveFilters = Boolean(
    filters.search || filters.status || filters.priority || filters.sortBy !== 'createdAt' || filters.order !== 'desc'
  );
  const isFiltered = Boolean(query.search || query.status || query.priority);

  const handleFilterChange = (changes) => {
    setFilters((f) => ({ ...f, ...changes }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  };

  const closeModal = useCallback(() => setModal(null), []);
  const showToast = (message, type = 'success') => setToast({ message, type, id: Date.now() });
  const dismissToast = useCallback(() => setToast(null), []);

  const handleCreate = async (values) => {
    await taskApi.create(values);
    closeModal();
    showToast('Task created');
    reload();
  };

  const handleUpdate = async (values) => {
    await taskApi.update(modal.task.id, values);
    closeModal();
    showToast('Task updated');
    reload();
  };

  const handleDelete = async () => {
    await taskApi.remove(modal.task.id);
    closeModal();
    showToast('Task deleted');
    reload();
  };

  const openCreate = () => setModal({ type: 'create' });
  const openView = (task) => setModal({ type: 'view', task });
  const openEdit = (task) => setModal({ type: 'edit', task });
  const openDelete = (task) => setModal({ type: 'delete', task });

  let content;
  if (loading) content = <LoadingState count={PAGE_SIZE} />;
  else if (error) content = <ErrorState message={error} onRetry={reload} />;
  else if (tasks.length === 0)
    content = <EmptyState filtered={isFiltered} onCreate={openCreate} onClear={clearFilters} />;
  else
    content = (
      <>
        <TaskList tasks={tasks} onView={openView} onEdit={openEdit} onDelete={openDelete} />
        <Pagination meta={meta} onPageChange={setPage} />
      </>
    );

  return (
    <>
      <Header theme={theme} onToggleTheme={toggle} onCreate={openCreate} />

      <main className="container main">
        <div className="page-heading">
          <h1>Dashboard</h1>
          {!loading && !error && (
            <p className="subtitle">
              {meta.total} {meta.total === 1 ? 'task' : 'tasks'}
              {isFiltered ? ' found' : ''}
            </p>
          )}
        </div>

        <TaskFilters
          filters={filters}
          onChange={handleFilterChange}
          onClear={clearFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {content}
      </main>

      {modal?.type === 'create' && (
        <Modal title="Create task" onClose={closeModal}>
          <TaskForm onSubmit={handleCreate} onCancel={closeModal} />
        </Modal>
      )}
      {modal?.type === 'edit' && (
        <Modal title="Edit task" onClose={closeModal}>
          <TaskForm task={modal.task} onSubmit={handleUpdate} onCancel={closeModal} />
        </Modal>
      )}
      {modal?.type === 'view' && (
        <Modal title="Task details" onClose={closeModal}>
          <TaskDetails task={modal.task} onEdit={openEdit} onDelete={openDelete} onClose={closeModal} />
        </Modal>
      )}
      {modal?.type === 'delete' && (
        <ConfirmDialog
          title="Delete task"
          message={`Are you sure you want to delete “${modal.task.title}”? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={closeModal}
        />
      )}

      <Toast toast={toast} onDismiss={dismissToast} />
    </>
  );
}
