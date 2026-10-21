import { useState } from 'react';
import useItems from '../../hooks/useItems';
import { mockSkills } from '../../lib/mockData';
import { filterItems, getAllTags } from '../../utils/filterItems';
import SearchBar from '../../components/dashboard/SearchBar';
import TagFilter from '../../components/dashboard/TagFilter';
import EmptyState from '../../components/dashboard/EmptyState';
import ItemCard from '../../components/dashboard/ItemCard';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import SkillForm from '../../components/forms/SkillForm';

const CATEGORY_ORDER = [
  'Languages',
  'Frameworks',
  'Hardware-Robotics',
  'Cloud-DevOps',
];

export default function Skills() {
  const {
    items,
    loading,
    error,
    reload,
    createItem,
    updateItem,
    deleteItem,
    togglePublic,
  } = useItems('/skills', mockSkills);

  const [search, setSearch] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const allTags = getAllTags(items);
  const effectiveSelected = selectedTags.filter((t) => allTags.includes(t));
  const visibleItems = filterItems(items, {
    tags: effectiveSelected,
    search,
    match: 'any',
  });

  const sortedItems = [...visibleItems].sort((a, b) => {
    const aIndex = CATEGORY_ORDER.indexOf(a?.category);
    const bIndex = CATEGORY_ORDER.indexOf(b?.category);

    const aRank = aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex;
    const bRank = bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex;

    if (aRank !== bRank) {
      return aRank - bRank;
    }

    const aName =
      typeof a?.name === 'string' ? a.name.trim().toLowerCase() : '';
    const bName =
      typeof b?.name === 'string' ? b.name.trim().toLowerCase() : '';

    return aName.localeCompare(bName);
  });

  const handleToggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleClearTags = () => {
    setSelectedTags([]);
  };

  const handleDeleteConfirm = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    setDeleteError('');
    try {
      await deleteItem(deleting._id);
      setDeleting(null);
    } catch (err) {
      setDeleteError(
        err.response?.data?.message || 'Could not delete. Please try again.'
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const skillCount = items.length;
  const countText = `${skillCount} ${skillCount === 1 ? 'skill' : 'skills'}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Skills</h1>
          {!loading && <p className="text-sm text-slate-500 mt-1">{countText}</p>}
        </div>
        <Button variant="primary" onClick={() => setEditing('new')}>
          Add skill
        </Button>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <Spinner />
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm font-medium text-red-800 mb-3">{error}</p>
          <Button variant="secondary" onClick={reload}>
            Retry
          </Button>
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title="No skills yet"
          description="Highlight your technical proficiencies, tools, frameworks, and programming languages."
          actionLabel="Add your first skill"
          onAction={() => setEditing('new')}
        />
      ) : (
        <div className="space-y-6">
          {/* Filters */}
          <div className="space-y-3">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search skills..."
            />
            <TagFilter
              tags={allTags}
              selected={effectiveSelected}
              onToggle={handleToggleTag}
              onClear={handleClearTags}
            />
          </div>

          {/* List or Empty Matching State */}
          {sortedItems.length === 0 ? (
            <EmptyState
              title="No matching skills"
              description="No skills match your current search or tag filters."
              actionLabel="Clear filters"
              onAction={() => {
                setSearch('');
                setSelectedTags([]);
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sortedItems.map((skill) => (
                <ItemCard
                  key={skill._id}
                  item={skill}
                  type="skill"
                  onEdit={setEditing}
                  onDelete={(item) => {
                    setDeleteError('');
                    setDeleting(item);
                  }}
                  onTogglePublic={togglePublic}
                  onTagClick={handleToggleTag}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === 'new' ? 'Add skill' : 'Edit skill'}
      >
        {editing !== null && (
          <SkillForm
            key={editing === 'new' ? 'new' : editing._id}
            initialData={editing === 'new' ? undefined : editing}
            onCancel={() => setEditing(null)}
            submitLabel={editing === 'new' ? 'Add skill' : 'Save changes'}
            onSubmit={async (data) => {
              if (editing === 'new') {
                await createItem(data);
              } else {
                await updateItem(editing._id, data);
              }
              setEditing(null);
            }}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={deleting !== null}
        onClose={() => {
          if (!deleteLoading) setDeleting(null);
        }}
        title="Delete skill"
        footer={
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setDeleting(null)}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              loading={deleteLoading}
              onClick={handleDeleteConfirm}
            >
              Delete
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-slate-600">
            Are you sure you want to delete &quot;{deleting?.name}&quot;? This cannot be undone.
          </p>
          {deleteError && (
            <p className="text-sm text-red-600 font-medium" role="alert">
              {deleteError}
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
}
