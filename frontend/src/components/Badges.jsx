import { PRIORITY_OPTIONS, STATUS_OPTIONS, labelOf } from '../utils/constants';

export function StatusBadge({ status }) {
  return <span className={`badge status-${status}`}>{labelOf(STATUS_OPTIONS, status)}</span>;
}

export function PriorityBadge({ priority }) {
  return (
    <span className={`badge priority-${priority}`}>
      <span className="dot" aria-hidden="true" />
      {labelOf(PRIORITY_OPTIONS, priority)}
    </span>
  );
}
