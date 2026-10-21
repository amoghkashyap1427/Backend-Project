import { useState } from 'react';
import useItems from '../../hooks/useItems';
import { mockOpenSource } from '../../lib/mockData';
import { filterItems, getAllTags } from '../../utils/filterItems';
import SearchBar from '../../components/dashboard/SearchBar';
import TagFilter from '../../components/dashboard/TagFilter';
import EmptyState from '../../components/dashboard/EmptyState';
import ItemCard from '../../components/dashboard/ItemCard';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import OpenSourceForm from '../../components/forms/OpenSourceForm';

export default function OpenSource() {
  const {
    items,
    loading,
    error,
    reload,
    createItem,
    updateItem,
    deleteItem,
    togglePublic,
  } = useItems('/open-source', mockOpenSource);

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

  const contributionCount = items.length;
  const countText = `${contributionCount} ${
    contributionCount === 1 ? 'contribution' : 'contributions'
  }`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Open Source</h1>
          {!loading && <p className="text-sm text-slate-500 mt-1">{countText}</p>}
        </div>
        <Button variant="primary" onClick={() => setEditing('new')}>
          Add contribution
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
          title="No contributions yet"
          description="Share your open source contributions, bug fixes, and feature pull requests."
          actionLabel="Add your first contribution"
          onAction={() => setEditing('new')}
        />
      ) : (
        <div className="space-y-6">
          {/* Filters */}
          <div className="space-y-3">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search repositories, pull requests..."
            />
            <TagFilter
              tags={allTags}
              selected={effectiveSelected}
              onToggle={handleToggleTag}
              onClear={handleClearTags}
            />
          </div>

          {/* List or Empty Matching State */}
          {visibleItems.length === 0 ? (
            <EmptyState
              title="No matching contributions"
              description="No contributions match your current search or tag filters."
              actionLabel="Clear filters"
              onAction={() => {
                setSearch('');
                setSelectedTags([]);
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {visibleItems.map((contribution) => (
                <ItemCard
                  key={contribution._id}
                  item={contribution}
                  type="openSource"
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
        title={editing === 'new' ? 'Add contribution' : 'Edit contribution'}
      >
        {editing !== null && (
          <OpenSourceForm
            key={editing === 'new' ? 'new' : editing._id}
            initialData={editing === 'new' ? undefined : editing}
            onCancel={() => setEditing(null)}
            submitLabel={
              editing === 'new' ? 'Add contribution' : 'Save changes'
            }
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
        title="Delete contribution"
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
            Are you sure you want to delete &quot;{deleting?.prTitle}&quot;? This cannot be undone.
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
