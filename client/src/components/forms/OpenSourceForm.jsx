import { useState } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';

const HTTP_REGEX = /^https?:\/\//i;
const VALID_STATUSES = ['open', 'merged', 'closed'];

export default function OpenSourceForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Save',
}) {
  const [formData, setFormData] = useState(() => ({
    repository: initialData?.repository || '',
    prTitle: initialData?.prTitle || '',
    prUrl: initialData?.prUrl || '',
    status: initialData?.status || 'open',
    description: initialData?.description || '',
    tags: Array.isArray(initialData?.tags)
      ? initialData.tags.join(', ')
      : initialData?.tags || '',
    isPublic: Boolean(initialData?.isPublic),
  }));

  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: fieldValue }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const errors = {};
    const trimmedRepo = formData.repository.trim();
    const trimmedTitle = formData.prTitle.trim();
    const trimmedUrl = formData.prUrl.trim();
    const trimmedDesc = formData.description.trim();

    if (!trimmedRepo) {
      errors.repository = 'Repository is required.';
    }

    if (!trimmedTitle) {
      errors.prTitle = 'PR title is required.';
    }

    if (trimmedUrl && !HTTP_REGEX.test(trimmedUrl)) {
      errors.prUrl = 'PR URL must start with http:// or https://';
    }

    if (!VALID_STATUSES.includes(formData.status)) {
      errors.status = 'Status must be one of open, merged, or closed.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    // Process tags (trim, lowercase, remove empty, remove duplicates)
    const seenTags = new Set();
    const tags = [];
    for (const raw of formData.tags.split(',')) {
      const item = raw.trim().toLowerCase();
      if (!item) continue;
      if (!seenTags.has(item)) {
        seenTags.add(item);
        tags.push(item);
      }
    }

    const payload = {
      repository: trimmedRepo,
      prTitle: trimmedTitle,
      prUrl: trimmedUrl,
      status: formData.status,
      description: trimmedDesc,
      tags,
      isPublic: Boolean(formData.isPublic),
    };

    setLoading(true);
    setError('');

    try {
      await onSubmit(payload);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const textareaBaseStyles =
    'w-full rounded-lg border px-3 py-2 text-sm text-slate-900 bg-white placeholder-slate-400 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:bg-slate-50 disabled:cursor-not-allowed';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div
          role="alert"
          className="rounded-lg bg-red-50 p-4 border border-red-200 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {/* Repository */}
      <div className="w-full">
        <Input
          id="opensource-repository"
          name="repository"
          label="Repository"
          required
          value={formData.repository}
          onChange={handleChange}
          error={fieldErrors.repository}
          placeholder="e.g. facebook/react"
        />
        <p className="mt-1 text-xs text-slate-500">
          owner/repo, e.g. facebook/react
        </p>
      </div>

      {/* PR Title */}
      <Input
        id="opensource-prTitle"
        name="prTitle"
        label="PR title"
        required
        value={formData.prTitle}
        onChange={handleChange}
        error={fieldErrors.prTitle}
        placeholder="e.g. fix(docs): clarify useEffect cleanup sequence"
      />

      {/* PR URL & Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          id="opensource-prUrl"
          name="prUrl"
          label="PR URL"
          type="url"
          value={formData.prUrl}
          onChange={handleChange}
          error={fieldErrors.prUrl}
          placeholder="https://github.com/..."
        />
        <div className="w-full">
          <label
            htmlFor="opensource-status"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Status
          </label>
          <select
            id="opensource-status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 bg-white shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:bg-slate-50 disabled:cursor-not-allowed ${
              fieldErrors.status
                ? 'border-red-500 text-red-900 focus:border-red-500 focus:ring-red-500'
                : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500'
            }`}
          >
            <option value="open">Open</option>
            <option value="merged">Merged</option>
            <option value="closed">Closed</option>
          </select>
          {fieldErrors.status && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.status}</p>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="w-full">
        <label
          htmlFor="opensource-description"
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          Description
        </label>
        <textarea
          id="opensource-description"
          name="description"
          rows={3}
          value={formData.description}
          onChange={handleChange}
          placeholder="Summary of changes, problems addressed, and review status..."
          className={`${textareaBaseStyles} border-slate-300 focus:border-indigo-500 focus:ring-indigo-500`}
        />
      </div>

      {/* Tags */}
      <div className="w-full">
        <Input
          id="opensource-tags"
          name="tags"
          label="Tags"
          value={formData.tags}
          onChange={handleChange}
          error={fieldErrors.tags}
          placeholder="react, typescript, documentation"
        />
        <p className="mt-1 text-xs text-slate-500">
          Comma-separated, e.g. react, typescript
        </p>
      </div>

      {/* Public Checkbox */}
      <div className="flex items-center gap-2 pt-1">
        <input
          id="opensource-isPublic"
          name="isPublic"
          type="checkbox"
          checked={formData.isPublic}
          onChange={handleChange}
          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
        />
        <label
          htmlFor="opensource-isPublic"
          className="text-sm font-medium text-slate-700 select-none cursor-pointer"
        >
          Make this public
        </label>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={loading}
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
