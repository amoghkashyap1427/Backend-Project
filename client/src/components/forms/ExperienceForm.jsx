import { useState } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';

const formatDateInitial = (val) =>
  typeof val === 'string' ? val.substring(0, 10) : '';

export default function ExperienceForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Save',
}) {
  const [formData, setFormData] = useState(() => ({
    role: initialData?.role || '',
    company: initialData?.company || '',
    location: initialData?.location || '',
    startDate: formatDateInitial(initialData?.startDate),
    endDate: initialData?.isCurrent
      ? ''
      : formatDateInitial(initialData?.endDate),
    isCurrent: Boolean(initialData?.isCurrent),
    techStack: Array.isArray(initialData?.techStack)
      ? initialData.techStack.join(', ')
      : initialData?.techStack || '',
    bullets: Array.isArray(initialData?.bullets)
      ? initialData.bullets.join('\n')
      : initialData?.bullets || '',
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

  const handleCurrentChange = (e) => {
    const checked = e.target.checked;
    setFormData((prev) => ({
      ...prev,
      isCurrent: checked,
      endDate: checked ? '' : prev.endDate,
    }));

    if (fieldErrors.isCurrent || fieldErrors.endDate) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.isCurrent;
        delete next.endDate;
        return next;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const errors = {};
    const trimmedRole = formData.role.trim();
    const trimmedCompany = formData.company.trim();
    const trimmedLocation = formData.location.trim();
    const trimmedStart = formData.startDate.trim();
    const trimmedEnd = formData.endDate.trim();

    if (!trimmedRole) {
      errors.role = 'Role is required.';
    }

    if (!trimmedCompany) {
      errors.company = 'Company is required.';
    }

    if (!trimmedStart) {
      errors.startDate = 'Start date is required.';
    }

    if (!formData.isCurrent && trimmedEnd) {
      if (trimmedStart && trimmedEnd < trimmedStart) {
        errors.endDate = 'End date cannot be before the start date.';
      }
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

    const bullets = formData.bullets
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const payload = {
      role: trimmedRole,
      company: trimmedCompany,
      location: trimmedLocation,
      startDate: trimmedStart,
      endDate: formData.isCurrent || !trimmedEnd ? null : trimmedEnd,
      isCurrent: Boolean(formData.isCurrent),
      techStack,
      tags,
      bullets,
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

      {/* Role */}
      <Input
        id="experience-role"
        name="role"
        label="Role"
        required
        value={formData.role}
        onChange={handleChange}
        error={fieldErrors.role}
        placeholder="e.g. Senior Full Stack Developer"
      />

      {/* Company & Location */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          id="experience-company"
          name="company"
          label="Company"
          required
          value={formData.company}
          onChange={handleChange}
          error={fieldErrors.company}
          placeholder="e.g. Acme Corp"
        />
        <Input
          id="experience-location"
          name="location"
          label="Location"
          value={formData.location}
          onChange={handleChange}
          error={fieldErrors.location}
          placeholder="e.g. San Francisco, CA (Remote)"
        />
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          id="experience-startDate"
          name="startDate"
          label="Start date"
          type="date"
          required
          value={formData.startDate}
          onChange={handleChange}
          error={fieldErrors.startDate}
        />
        <Input
          id="experience-endDate"
          name="endDate"
          label="End date"
          type="date"
          disabled={formData.isCurrent}
          value={formData.endDate}
          onChange={handleChange}
          error={fieldErrors.endDate}
        />
      </div>

      {/* Current Position Checkbox */}
      <div className="flex items-center gap-2 pt-1">
        <input
          id="experience-isCurrent"
          name="isCurrent"
          type="checkbox"
          checked={formData.isCurrent}
          onChange={handleCurrentChange}
          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
        />
        <label
          htmlFor="experience-isCurrent"
          className="text-sm font-medium text-slate-700 select-none cursor-pointer"
        >
          I currently work here
        </label>
      </div>

      {/* Tech Stack */}
      <div className="w-full">
        <Input
          id="experience-techStack"
          name="techStack"
          label="Tech stack"
          value={formData.techStack}
          onChange={handleChange}
          error={fieldErrors.techStack}
          placeholder="React, Node.js, TypeScript, Docker"
        />
        <p className="mt-1 text-xs text-slate-500">
          Comma-separated, e.g. React, Node.js
        </p>
      </div>

      {/* Bullets / Key deliverables */}
      <div className="w-full">
        <label
          htmlFor="experience-bullets"
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          Key deliverables
        </label>
        <textarea
          id="experience-bullets"
          name="bullets"
          rows={4}
          value={formData.bullets}
          onChange={handleChange}
          placeholder="Architected RESTful microservices reducing API latency by 35%...&#10;Integrated automated end-to-end testing with Jest..."
          className={`${textareaBaseStyles} border-slate-300 focus:border-indigo-500 focus:ring-indigo-500`}
        />
        <p className="mt-1 text-xs text-slate-500">One per line</p>
        {fieldErrors.bullets && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.bullets}</p>
        )}
      </div>

      {/* Public Checkbox */}
      <div className="flex items-center gap-2 pt-1">
        <input
          id="experience-isPublic"
          name="isPublic"
          type="checkbox"
          checked={formData.isPublic}
          onChange={handleChange}
          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
        />
        <label
          htmlFor="experience-isPublic"
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
