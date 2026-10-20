import { useState } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';

const HTTP_REGEX = /^https?:\/\//i;

function getTodayLocalDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const formatDateInitial = (val) =>
  typeof val === 'string' ? val.substring(0, 10) : '';

export default function CertificationForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Save',
}) {
  const [formData, setFormData] = useState(() => ({
    title: initialData?.title || '',
    issuer: initialData?.issuer || '',
    credentialId: initialData?.credentialId || '',
    completedOn: formatDateInitial(initialData?.completedOn),
    verifyUrl: initialData?.verifyUrl || '',
    fileUrl: initialData?.fileUrl || '',
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
    const trimmedTitle = formData.title.trim();
    const trimmedIssuer = formData.issuer.trim();
    const trimmedCredentialId = formData.credentialId.trim();
    const trimmedCompletedOn = formData.completedOn.trim();
    const trimmedVerifyUrl = formData.verifyUrl.trim();
    const trimmedFileUrl = formData.fileUrl.trim();

    if (!trimmedTitle) {
      errors.title = 'Certification title is required.';
    }

    if (!trimmedIssuer) {
      errors.issuer = 'Issuing organization is required.';
    }

    if (trimmedVerifyUrl && !HTTP_REGEX.test(trimmedVerifyUrl)) {
      errors.verifyUrl = 'Verification URL must start with http:// or https://';
    }

    if (trimmedFileUrl && !HTTP_REGEX.test(trimmedFileUrl)) {
      errors.fileUrl = 'Certificate file URL must start with http:// or https://';
    }

    if (trimmedCompletedOn) {
      const today = getTodayLocalDateString();
      if (trimmedCompletedOn > today) {
        errors.completedOn = 'Completion date cannot be in the future.';
      }
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
      title: trimmedTitle,
      issuer: trimmedIssuer,
      credentialId: trimmedCredentialId,
      completedOn: trimmedCompletedOn || null,
      verifyUrl: trimmedVerifyUrl,
      fileUrl: trimmedFileUrl,
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

      {/* Certification Title */}
      <Input
        id="certification-title"
        name="title"
        label="Certification title"
        required
        value={formData.title}
        onChange={handleChange}
        error={fieldErrors.title}
        placeholder="e.g. AWS Certified Solutions Architect – Associate"
      />

      {/* Issuer & Credential ID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          id="certification-issuer"
          name="issuer"
          label="Issuing organization"
          required
          value={formData.issuer}
          onChange={handleChange}
          error={fieldErrors.issuer}
          placeholder="e.g. Amazon Web Services"
        />
        <Input
          id="certification-credentialId"
          name="credentialId"
          label="Credential ID"
          value={formData.credentialId}
          onChange={handleChange}
          error={fieldErrors.credentialId}
          placeholder="e.g. AWS-SAA-884920"
        />
      </div>

      {/* Completed On */}
      <div className="w-full">
        <Input
          id="certification-completedOn"
          name="completedOn"
          label="Completed on"
          type="date"
          value={formData.completedOn}
          onChange={handleChange}
          error={fieldErrors.completedOn}
        />
      </div>

      {/* URLs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          id="certification-verifyUrl"
          name="verifyUrl"
          label="Verification URL"
          type="url"
          value={formData.verifyUrl}
          onChange={handleChange}
          error={fieldErrors.verifyUrl}
          placeholder="https://..."
        />
        <div className="w-full">
          <Input
            id="certification-fileUrl"
            name="fileUrl"
            label="Certificate file URL"
            type="url"
            value={formData.fileUrl}
            onChange={handleChange}
            error={fieldErrors.fileUrl}
            placeholder="https://..."
          />
          <p className="mt-1 text-xs text-slate-500">
            Link only. File uploads are not supported yet.
          </p>
        </div>
      </div>

      {/* Tags */}
      <div className="w-full">
        <Input
          id="certification-tags"
          name="tags"
          label="Tags"
          value={formData.tags}
          onChange={handleChange}
          error={fieldErrors.tags}
          placeholder="aws, cloud, architecture"
        />
        <p className="mt-1 text-xs text-slate-500">
          Comma-separated, e.g. aws, cloud
        </p>
      </div>

      {/* Public Checkbox */}
      <div className="flex items-center gap-2 pt-1">
        <input
          id="certification-isPublic"
          name="isPublic"
          type="checkbox"
          checked={formData.isPublic}
          onChange={handleChange}
          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
        />
        <label
          htmlFor="certification-isPublic"
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
