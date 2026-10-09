export const TITLE_MAX = 100;
export const DESCRIPTION_MAX = 1000;

/** Returns an object of field -> message. Empty object means valid. */
export function validateTask(values) {
  const errors = {};
  const title = values.title.trim();
  const description = values.description.trim();

  if (!title) errors.title = 'Title is required';
  else if (title.length > TITLE_MAX) errors.title = `Title must be at most ${TITLE_MAX} characters`;

  if (!description) errors.description = 'Description is required';
  else if (description.length > DESCRIPTION_MAX)
    errors.description = `Description must be at most ${DESCRIPTION_MAX} characters`;

  return errors;
}
