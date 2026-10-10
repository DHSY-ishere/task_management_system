import { PriorityBadge, StatusBadge } from './Badges';
import { formatDate, formatDateTime, isOverdue } from '../utils/format';

export default function TaskDetails({ task, onEdit, onDelete, onClose }) {
  return (
    <div className="details">
      <h3 className="details-title">{task.title}</h3>
      <div className="badge-row">
        <StatusBadge status={task.status} />
        <PriorityBadge priority={task.priority} />
        {isOverdue(task) && <span className="badge overdue">Overdue</span>}
      </div>

      <p className="details-description">{task.description}</p>

      <dl className="details-grid">
        <div>
          <dt>Due date</dt>
          <dd>{formatDate(task.dueDate)}</dd>
        </div>
        <div>
          <dt>Created</dt>
          <dd>{formatDateTime(task.createdAt)}</dd>
        </div>
        <div>
          <dt>Last updated</dt>
          <dd>{formatDateTime(task.updatedAt)}</dd>
        </div>
        <div>
          <dt>Task ID</dt>
          <dd className="mono">{task.id}</dd>
        </div>
      </dl>

      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={onClose}>
          Close
        </button>
        <button type="button" className="btn btn-danger-outline" onClick={() => onDelete(task)}>
          Delete
        </button>
        <button type="button" className="btn btn-primary" onClick={() => onEdit(task)}>
          Edit
        </button>
      </div>
    </div>
  );
}
