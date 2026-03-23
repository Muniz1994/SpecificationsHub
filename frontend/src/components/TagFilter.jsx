import { useState, useMemo } from 'react';
import { Filter, Search, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGetTagsQuery } from '@/features/tags/tagsApi';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

const CATEGORY_STYLES = {
  use_case:   { bg: 'bg-rose-100 dark:bg-rose-900/40',       text: 'text-rose-700 dark:text-rose-300',       border: 'border-rose-200 dark:border-rose-800',   activeBg: 'bg-rose-500 dark:bg-rose-600',       activeText: 'text-white' },
  stage:      { bg: 'bg-sky-100 dark:bg-sky-900/40',         text: 'text-sky-700 dark:text-sky-300',         border: 'border-sky-200 dark:border-sky-800',     activeBg: 'bg-sky-500 dark:bg-sky-600',         activeText: 'text-white' },
  discipline: { bg: 'bg-emerald-100 dark:bg-emerald-900/40', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800', activeBg: 'bg-emerald-500 dark:bg-emerald-600', activeText: 'text-white' },
  other:      { bg: 'bg-amber-100 dark:bg-amber-900/40',     text: 'text-amber-700 dark:text-amber-300',     border: 'border-amber-200 dark:border-amber-800', activeBg: 'bg-amber-500 dark:bg-amber-600',     activeText: 'text-white' },
};

const CATEGORY_LABELS = {
  use_case: 'Use Case',
  stage: 'Stage',
  discipline: 'Discipline',
  other: 'Other',
};

export default function TagFilter({ selectedTagIds = [], onChange, className }) {
  const { data: tagsData } = useGetTagsQuery();
  const tags = tagsData?.results ?? tagsData ?? [];

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState([]);
  const [search, setSearch] = useState('');

  // Build a tag-id → tag lookup
  const tagMap = useMemo(() => {
    const m = {};
    for (const t of tags) m[t.id] = t;
    return m;
  }, [tags]);

  // Group and filter tags by search term
  const grouped = useMemo(() => {
    const g = {};
    const q = search.toLowerCase();
    for (const tag of tags) {
      if (q && !tag.name.toLowerCase().includes(q)) continue;
      const cat = tag.category || 'other';
      if (!g[cat]) g[cat] = [];
      g[cat].push(tag);
    }
    return g;
  }, [tags, search]);

  const handleOpen = (isOpen) => {
    if (isOpen) {
      setDraft([...selectedTagIds]);
      setSearch('');
    }
    setOpen(isOpen);
  };

  const toggleDraft = (tagId) => {
    setDraft((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId],
    );
  };

  const handleConfirm = () => {
    onChange(draft);
    setOpen(false);
  };

  const handleClear = () => {
    setDraft([]);
  };

  const removeTag = (tagId) => {
    onChange(selectedTagIds.filter((id) => id !== tagId));
  };

  if (!tags.length) return null;

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {/* Trigger button */}
      <Dialog open={open} onOpenChange={handleOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5 cursor-pointer">
            <Filter className="h-3.5 w-3.5" />
            Filter by tags
            {selectedTagIds.length > 0 && (
              <span className="ml-1 rounded-full bg-primary text-primary-foreground px-1.5 text-[10px] leading-4 font-semibold">
                {selectedTagIds.length}
              </span>
            )}
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Filter by tags</DialogTitle>
          </DialogHeader>

          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tags…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>

          {/* Tag list grouped by category */}
          <ScrollArea className="max-h-64">
            <div className="space-y-3 pr-3">
              {Object.entries(CATEGORY_LABELS).map(([cat, label]) => {
                const catTags = grouped[cat];
                if (!catTags?.length) return null;
                return (
                  <div key={cat}>
                    <p className="text-xs font-semibold text-muted-foreground mb-1.5">{label}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {catTags.map((tag) => {
                        const active = draft.includes(tag.id);
                        const style = CATEGORY_STYLES[cat] || CATEGORY_STYLES.other;
                        return (
                          <button
                            key={tag.id}
                            type="button"
                            onClick={() => toggleDraft(tag.id)}
                            className={cn(
                              'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors cursor-pointer',
                              active
                                ? cn(style.activeBg, style.activeText, style.border)
                                : cn(style.bg, style.text, style.border, 'opacity-70 hover:opacity-100'),
                            )}
                          >
                            {active && <Check className="h-3 w-3" />}
                            {tag.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              {Object.keys(grouped).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No tags match your search.</p>
              )}
            </div>
          </ScrollArea>

          {/* Footer actions */}
          <div className="flex items-center justify-between pt-2 border-t">
            <Button variant="ghost" size="sm" onClick={handleClear} disabled={draft.length === 0} className="cursor-pointer">
              Clear all
            </Button>
            <Button size="sm" onClick={handleConfirm} className="cursor-pointer">
              Apply{draft.length > 0 && ` (${draft.length})`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Selected tag pills */}
      {selectedTagIds.map((id) => {
        const tag = tagMap[id];
        if (!tag) return null;
        const cat = tag.category || 'other';
        const style = CATEGORY_STYLES[cat] || CATEGORY_STYLES.other;
        return (
          <span
            key={id}
            className={cn(
              'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium',
              style.activeBg, style.activeText, style.border,
            )}
          >
            {tag.name}
            <button type="button" onClick={() => removeTag(id)} className="hover:opacity-75 cursor-pointer">
              <X className="h-3 w-3" />
            </button>
          </span>
        );
      })}
    </div>
  );
}
