import { useState } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';

const CATEGORIES = [
  { value: 'Languages', label: 'Languages' },
  { value: 'Frameworks', label: 'Frameworks' },
  { value: 'Hardware-Robotics', label: 'Hardware / Robotics' },
  { value: 'Cloud-DevOps', label: 'Cloud / DevOps' },
];

const PROFICIENCY_LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

const ALLOWED_CATEGORY_VALUES = CATEGORIES.map((c) => c.value);
const ALLOWED_PROFICIENCY_VALUES = PROFICIENCY_LEVELS.map((p) => p.value);

export default function SkillForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Save',
}) {
  const [formData, setFormData] = useState(() => ({
    name: initialData?.name || '',
    category: initialData?.category || 'Languages',
    proficiency: initialData?.proficiency || 'intermediate',
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
    const trimmedName = formData.name.trim();

    if (!trimmedName) {
      errors.name = 'Skill name is required.';
    }

    if (!ALLOWED_CATEGORY_VALUES.includes(formData.category)) {
      errors.category = 'Category must be one of the allowed categories.';
    }

    if (!ALLOWED_PROFICIENCY_VALUES.includes(formData.proficiency)) {
      errors.proficiency = 'Proficiency must be one of beginner, intermediate, or advanced.';
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
      name: trimmedName,
      category: formData.category,
      proficiency: formData.proficiency,
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

      {/* Skill Name */}
      <Input
        id="skill-name"
        name="name"
        label="Skill name"
        required
        value={formData.name}
        onChange={handleChange}
        error={fieldErrors.name}
        placeholder="e.g. React"
      />

      {/* Category & Proficiency */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="w-full">
          <label
            htmlFor="skill-category"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Category <span className="text-red-500 ml-1">*</span>
          </label>
          <select
            id="skill-category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 bg-white shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:bg-slate-50 disabled:cursor-not-allowed ${
              fieldErrors.category
                ? 'border-red-500 text-red-900 focus:border-red-500 focus:ring-red-500'
                : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500'
            }`}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
          {fieldErrors.category && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.category}</p>
          )}
        </div>

        <div className="w-full">
          <label
            htmlFor="skill-proficiency"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Proficiency
          </label>
          <select
            id="skill-proficiency"
            name="proficiency"
            value={formData.proficiency}
            onChange={handleChange}
            className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 bg-white shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:bg-slate-50 disabled:cursor-not-allowed ${
              fieldErrors.proficiency
                ? 'border-red-500 text-red-900 focus:border-red-500 focus:ring-red-500'
                : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500'
            }`}
          >
            {PROFICIENCY_LEVELS.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
          {fieldErrors.proficiency && (
            <p className="mt-1 text-sm text-red-600">
              {fieldErrors.proficiency}
            </p>
          )}
        </div>
      </div>

      {/* Tags */}
      <div className="w-full">
        <Input
          id="skill-tags"
          name="tags"
          label="Tags"
          value={formData.tags}
          onChange={handleChange}
          error={fieldErrors.tags}
          placeholder="react, frontend, javascript"
        />
        <p className="mt-1 text-xs text-slate-500">
          Comma-separated, e.g. react, frontend
        </p>
      </div>

      {/* Public Checkbox */}
      <div className="flex items-center gap-2 pt-1">
        <input
          id="skill-isPublic"
          name="isPublic"
          type="checkbox"
          checked={formData.isPublic}
          onChange={handleChange}
          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
        />
        <label
          htmlFor="skill-isPublic"
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
