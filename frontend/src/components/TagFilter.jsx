import { cn } from '@/lib/utils';
import { useGetTagsQuery } from '@/features/tags/tagsApi';

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

  if (!tags.length) return null;

  const toggle = (tagId) => {
    if (selectedTagIds.includes(tagId)) {
      onChange(selectedTagIds.filter((id) => id !== tagId));
    } else {
      onChange([...selectedTagIds, tagId]);
    }
  };

  const grouped = {};
  for (const tag of tags) {
    const cat = tag.category || 'other';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(tag);
  }

  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {Object.entries(grouped).map(([category, catTags]) =>
        catTags.map((tag) => {
          const active = selectedTagIds.includes(tag.id);
          const style = CATEGORY_STYLES[category] || CATEGORY_STYLES.other;
          const label = CATEGORY_LABELS[category] || category;

          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggle(tag.id)}
              className={cn(
                'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors cursor-pointer',
                active
                  ? cn(style.activeBg, style.activeText, style.border)
                  : cn(style.bg, style.text, style.border, 'opacity-70 hover:opacity-100'),
              )}
            >
              <span className={active ? 'opacity-90' : 'opacity-70'}>{label}:</span> {tag.name}
            </button>
          );
        })
      )}
    </div>
  );
}
