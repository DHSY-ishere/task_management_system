import { PriorityBadge, StatusBadge } from './Badges';
import { formatDate, isOverdue } from '../utils/format';

export default function TaskCard({ task, onView, onEdit, onDelete }) {
  return (
    <article className={`card priority-border-${task.priority}`}>
      <div className="card-top">
        <h3 className="card-title">
          <button type="button" className="link-btn" onClick={() => onView(task)}>
            {task.title}
          </button>
        </h3>
        <StatusBadge status={task.status} />
      </div>

      <p className="card-description">{task.description}</p>

      <div className="card-meta">
        <PriorityBadge priority={task.priority} />
        <span className={`meta-item ${isOverdue(task) ? 'text-danger' : ''}`}>
          Due: {formatDate(task.dueDate)}
          {isOverdue(task) && ' (overdue)'}
        </span>
        <span className="meta-item">Created: {formatDate(task.createdAt)}</span>
      </div>

      <div className="card-actions">
        <button type="button" className="btn btn-sm btn-ghost" onClick={() => onView(task)}>
          View
        </button>
        <button type="button" className="btn btn-sm btn-ghost" onClick={() => onEdit(task)}>
          Edit
        </button>
        <button type="button" className="btn btn-sm btn-danger-outline" onClick={() => onDelete(task)}>
          Delete
        </button>
      </div>
    </article>
  );
}
