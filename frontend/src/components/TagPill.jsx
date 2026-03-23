import { cn } from '@/lib/utils';

const CATEGORY_STYLES = {
  use_case:    { bg: 'bg-rose-100 dark:bg-rose-900/40',    text: 'text-rose-700 dark:text-rose-300',    border: 'border-rose-200 dark:border-rose-800' },
  stage:       { bg: 'bg-sky-100 dark:bg-sky-900/40',      text: 'text-sky-700 dark:text-sky-300',      border: 'border-sky-200 dark:border-sky-800' },
  discipline:  { bg: 'bg-emerald-100 dark:bg-emerald-900/40', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800' },
  other:       { bg: 'bg-amber-100 dark:bg-amber-900/40',  text: 'text-amber-700 dark:text-amber-300',  border: 'border-amber-200 dark:border-amber-800' },
};

const CATEGORY_LABELS = {
  use_case: 'Use Case',
  stage: 'Stage',
  discipline: 'Discipline',
  other: 'Other',
};

export default function TagPill({ tag, onRemove, className }) {
  const style = CATEGORY_STYLES[tag.category] || CATEGORY_STYLES.other;
  const label = CATEGORY_LABELS[tag.category] || tag.category;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        style.bg,
        style.text,
        style.border,
        className,
      )}
    >
      <span className="opacity-70">{label}:</span> {tag.name}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onRemove(tag); }}
          className="ml-0.5 rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          aria-label={`Remove tag ${tag.name}`}
        >
          <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 3l6 6M9 3l-6 6" />
          </svg>
        </button>
      )}
    </span>
  );
}

export function TagList({ tags, onRemove, className }) {
  if (!tags || tags.length === 0) return null;
  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {tags.map((tag) => (
        <TagPill key={tag.id} tag={tag} onRemove={onRemove} />
      ))}
    </div>
  );
}
