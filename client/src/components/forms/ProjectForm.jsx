import { useState } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';

const HTTP_REGEX = /^https?:\/\//i;

export default function ProjectForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Save',
}) {
  const [formData, setFormData] = useState(() => ({
    title: initialData?.title || '',
    description: initialData?.description || '',
    repoUrl: initialData?.repoUrl || '',
    liveUrl: initialData?.liveUrl || '',
    architecture: initialData?.architecture || '',
    techStack: Array.isArray(initialData?.techStack)
      ? initialData.techStack.join(', ')
      : initialData?.techStack || '',
    media: Array.isArray(initialData?.media)
      ? initialData.media.join('\n')
      : initialData?.media || '',
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
    const trimmedTitle = formData.title.trim();
    const trimmedDesc = formData.description.trim();
    const trimmedRepo = formData.repoUrl.trim();
    const trimmedLive = formData.liveUrl.trim();
    const trimmedArch = formData.architecture.trim();

    if (!trimmedTitle) {
      errors.title = 'Title is required.';
    }

    if (!trimmedDesc) {
      errors.description = 'Description is required.';
    }

    if (trimmedRepo && !HTTP_REGEX.test(trimmedRepo)) {
      errors.repoUrl = 'Repository URL must start with http:// or https://';
    }

    if (trimmedLive && !HTTP_REGEX.test(trimmedLive)) {
      errors.liveUrl = 'Live URL must start with http:// or https://';
    }

    const mediaLines = formData.media
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const hasInvalidMedia = mediaLines.some((url) => !HTTP_REGEX.test(url));
    if (hasInvalidMedia) {
      errors.media = 'Every media URL must start with http:// or https://';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    // Process techStack (deduplicate case-insensitively, keep first spelling)
    const seenTech = new Set();
    const techStack = [];
    for (const raw of formData.techStack.split(',')) {
      const item = raw.trim();
      if (!item) continue;
      const lower = item.toLowerCase();
      if (!seenTech.has(lower)) {
        seenTech.add(lower);
        techStack.push(item);
      }
    }

    const tags = techStack.map((item) => item.toLowerCase());

    const payload = {
      title: trimmedTitle,
      description: trimmedDesc,
      repoUrl: trimmedRepo,
      liveUrl: trimmedLive,
      architecture: trimmedArch,
      techStack,
      tags,
      media: mediaLines,
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

      {/* Title */}
      <Input
        id="project-title"
        name="title"
        label="Title"
        required
        value={formData.title}
        onChange={handleChange}
        error={fieldErrors.title}
        placeholder="e.g. DevShowcase Portfolio Platform"
      />

      {/* Description */}
      <div className="w-full">
        <label
          htmlFor="project-description"
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          Description <span className="text-red-500 ml-1">*</span>
        </label>
        <textarea
          id="project-description"
          name="description"
          rows={3}
          value={formData.description}
          onChange={handleChange}
          placeholder="Brief description of the project, features, and outcomes..."
          className={`${textareaBaseStyles} ${
            fieldErrors.description
              ? 'border-red-500 text-red-900 focus:border-red-500 focus:ring-red-500'
              : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500'
          }`}
        />
        {fieldErrors.description && (
          <p className="mt-1 text-sm text-red-600">
            {fieldErrors.description}
          </p>
        )}
      </div>

      {/* URLs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          id="project-repoUrl"
          name="repoUrl"
          label="Repository URL"
          type="url"
          value={formData.repoUrl}
          onChange={handleChange}
          error={fieldErrors.repoUrl}
          placeholder="https://github.com/..."
        />
        <Input
          id="project-liveUrl"
          name="liveUrl"
          label="Live Demo URL"
          type="url"
          value={formData.liveUrl}
          onChange={handleChange}
          error={fieldErrors.liveUrl}
          placeholder="https://..."
        />
      </div>

      {/* Architecture */}
      <div className="w-full">
        <label
          htmlFor="project-architecture"
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          Architecture
        </label>
        <textarea
          id="project-architecture"
          name="architecture"
          rows={2}
          value={formData.architecture}
          onChange={handleChange}
          placeholder="e.g. MERN stack application with JWT auth cookies and REST API..."
          className={`${textareaBaseStyles} border-slate-300 focus:border-indigo-500 focus:ring-indigo-500`}
        />
      </div>

      {/* Tech Stack */}
      <div className="w-full">
        <Input
          id="project-techStack"
          name="techStack"
          label="Tech stack"
          value={formData.techStack}
          onChange={handleChange}
          error={fieldErrors.techStack}
          placeholder="React, Node.js, Express, MongoDB"
        />
        <p className="mt-1 text-xs text-slate-500">
          Comma-separated, e.g. React, Node.js
        </p>
      </div>

      {/* Media URLs */}
      <div className="w-full">
        <label
          htmlFor="project-media"
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          Media URLs
        </label>
        <textarea
          id="project-media"
          name="media"
          rows={3}
          value={formData.media}
          onChange={handleChange}
          placeholder="https://images.unsplash.com/..."
          className={`${textareaBaseStyles} ${
            fieldErrors.media
              ? 'border-red-500 text-red-900 focus:border-red-500 focus:ring-red-500'
              : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500'
          }`}
        />
        <p className="mt-1 text-xs text-slate-500">
          One URL per line
        </p>
        {fieldErrors.media && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.media}</p>
        )}
      </div>

      {/* Public Checkbox */}
      <div className="flex items-center gap-2 pt-1">
        <input
          id="project-isPublic"
          name="isPublic"
          type="checkbox"
          checked={formData.isPublic}
          onChange={handleChange}
          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
        />
        <label
          htmlFor="project-isPublic"
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
