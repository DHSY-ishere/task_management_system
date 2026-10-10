import { useState } from 'react';
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from '../utils/constants';
import { DESCRIPTION_MAX, TITLE_MAX, validateTask } from '../utils/validation';

const emptyValues = { title: '', description: '', status: 'pending', priority: 'medium', dueDate: '' };

const toFormValues = (task) =>
  task
    ? {
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate || '',
      }
    : emptyValues;

export default function TaskForm({ task, onSubmit, onCancel }) {
  const [values, setValues] = useState(() => toFormValues(task));
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const isEdit = Boolean(task);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const next = { ...values, [name]: value };
    setValues(next);
    // Re-validate live once a field has been touched (or a submit was attempted)
    if (touched[name]) setErrors(validateTask(next));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((t) => ({ ...t, [name]: true }));
    setErrors(validateTask(values));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validateTask(values);
    setTouched({ title: true, description: true });
    setErrors(found);
    if (Object.keys(found).length) return;

    setSubmitting(true);
    setFormError('');
    try {
      await onSubmit({
        title: values.title.trim(),
        description: values.description.trim(),
        status: values.status,
        priority: values.priority,
        dueDate: values.dueDate || null,
      });
    } catch (err) {
      // Surface server-side validation errors next to the fields
      if (err.errors) {
        setErrors(err.errors);
        setTouched({ title: true, description: true, dueDate: true });
      }
      setFormError(err.message);
      setSubmitting(false);
    }
  };

  const fieldError = (name) => (touched[name] || errors[name]) && errors[name];

  return (
    <form className="task-form" onSubmit={handleSubmit} noValidate>
      {formError && (
        <div className="alert alert-error" role="alert">
          {formError}
        </div>
      )}

      <div className="field">
        <label htmlFor="title">
          Title <span className="req">*</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          value={values.title}
          onChange={handleChange}
          onBlur={handleBlur}
          maxLength={TITLE_MAX + 20}
          placeholder="e.g. Prepare project demo"
          aria-invalid={Boolean(fieldError('title'))}
          aria-describedby={fieldError('title') ? 'title-error' : undefined}
          autoFocus
        />
        {fieldError('title') && (
          <p className="field-error" id="title-error">
            {errors.title}
          </p>
        )}
      </div>

      <div className="field">
        <label htmlFor="description">
          Description <span className="req">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          value={values.description}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="What needs to be done?"
          aria-invalid={Boolean(fieldError('description'))}
          aria-describedby={fieldError('description') ? 'description-error' : undefined}
        />
        <div className="field-meta">
          {fieldError('description') ? (
            <p className="field-error" id="description-error">
              {errors.description}
            </p>
          ) : (
            <span />
          )}
          <span className="counter">
            {values.description.length}/{DESCRIPTION_MAX}
          </span>
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="status">Status</label>
          <select id="status" name="status" value={values.status} onChange={handleChange}>
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="priority">Priority</label>
          <select id="priority" name="priority" value={values.priority} onChange={handleChange}>
            {PRIORITY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="field">
        <label htmlFor="dueDate">Due date</label>
        <input id="dueDate" name="dueDate" type="date" value={values.dueDate} onChange={handleChange} />
        {fieldError('dueDate') && <p className="field-error">{errors.dueDate}</p>}
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create task'}
        </button>
      </div>
    </form>
  );
}
