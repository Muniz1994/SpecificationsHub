import { useState } from 'react';
import { TagList } from '@/components/TagPill';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  useGetTagsQuery,
  useCreateTagMutation,
  useAddTagToIDSMutation,
  useRemoveTagFromIDSMutation,
  useAddTagToSpecificationMutation,
  useRemoveTagFromSpecificationMutation,
} from '@/features/tags/tagsApi';
import { Plus, Tag } from 'lucide-react';

const CATEGORY_OPTIONS = [
  { value: 'use_case', label: 'Use Case' },
  { value: 'stage', label: 'Stage' },
  { value: 'discipline', label: 'Discipline' },
  { value: 'other', label: 'Other' },
];

export default function TagManager({ itemId, itemType, currentTags = [] }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('other');

  const { data: tagsData } = useGetTagsQuery({}, { skip: !open });
  const [createTag, { isLoading: isCreating }] = useCreateTagMutation();

  const [addTagToIDS] = useAddTagToIDSMutation();
  const [removeTagFromIDS] = useRemoveTagFromIDSMutation();
  const [addTagToSpec] = useAddTagToSpecificationMutation();
  const [removeTagFromSpec] = useRemoveTagFromSpecificationMutation();

  const allTags = tagsData?.results || (Array.isArray(tagsData) ? tagsData : []);
  const currentTagIds = new Set(currentTags.map((t) => t.id));

  const filtered = allTags.filter(
    (t) =>
      !currentTagIds.has(t.id) &&
      (t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.category.toLowerCase().includes(search.toLowerCase()))
  );

  const handleAdd = async (tagId) => {
    if (itemType === 'ids') {
      await addTagToIDS({ idsId: itemId, tagId });
    } else {
      await addTagToSpec({ specId: itemId, tagId });
    }
  };

  const handleRemove = async (tag) => {
    if (itemType === 'ids') {
      await removeTagFromIDS({ idsId: itemId, tagId: tag.id });
    } else {
      await removeTagFromSpec({ specId: itemId, tagId: tag.id });
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      const created = await createTag({ name: newName.trim(), category: newCategory }).unwrap();
      await handleAdd(created.id);
      setNewName('');
      setShowCreate(false);
    } catch (err) {
      console.error('Failed to create tag', err);
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-1.5">
        <TagList tags={currentTags} onRemove={handleRemove} />
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs text-muted-foreground"
          onClick={() => setOpen(true)}
        >
          <Tag className="h-3 w-3 mr-1" />
          {currentTags.length === 0 ? 'Add tags' : '+'}
        </Button>
      </div>

      <Dialog open={open} onOpenChange={(o) => { if (!o) { setOpen(false); setShowCreate(false); setSearch(''); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Tags</DialogTitle>
            <DialogDescription>Add or create tags for this {itemType === 'ids' ? 'IDS' : 'specification'}.</DialogDescription>
          </DialogHeader>

          <Input
            placeholder="Search tags…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />

          <div className="max-h-48 overflow-y-auto space-y-1">
            {filtered.length === 0 && !showCreate && (
              <p className="text-sm text-muted-foreground italic py-2">No matching tags found.</p>
            )}
            {filtered.map((tag) => {
              const catLabel =
                CATEGORY_OPTIONS.find((c) => c.value === tag.category)?.label || tag.category;
              return (
                <button
                  key={tag.id}
                  className="flex items-center justify-between w-full rounded-md border px-3 py-2 text-sm hover:bg-accent transition-colors"
                  onClick={() => handleAdd(tag.id)}
                >
                  <span>
                    <span className="text-muted-foreground">{catLabel}:</span> {tag.name}
                  </span>
                  <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              );
            })}
          </div>

          {!showCreate ? (
            <Button variant="outline" size="sm" onClick={() => setShowCreate(true)}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Create new tag
            </Button>
          ) : (
            <form onSubmit={handleCreate} className="space-y-3 rounded-md border p-3">
              <p className="text-sm font-medium">Create new tag</p>
              <Input
                placeholder="Tag name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />
              <div className="flex gap-1.5 flex-wrap">
                {CATEGORY_OPTIONS.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                      newCategory === cat.value
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'hover:bg-accent'
                    }`}
                    onClick={() => setNewCategory(cat.value)}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowCreate(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={isCreating}>
                  {isCreating ? 'Creating…' : 'Create & Add'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
