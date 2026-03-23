import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';

const VALUE_TYPES = [
  { value: 'simple', label: 'Simple' },
  { value: 'pattern', label: 'Pattern' },
  { value: 'enumeration', label: 'Enumeration' },
  { value: 'range', label: 'Range' },
];

/**
 * ValueInput — reusable sub-form for IDS facet values.
 *
 * value shape:
 *   { type: 'simple',      value: 'REI90' }
 *   { type: 'pattern',     value: '[A-Z]+' }
 *   { type: 'enumeration', values: ['A', 'B', 'C'] }
 *   { type: 'range',       min: '0', max: '100', minInclusive: true, maxInclusive: true }
 *
 * Pass null to mean "no value constraint".
 */
export default function ValueInput({ value, onChange }) {
  const [enumInput, setEnumInput] = useState('');

  const type = value?.type || 'simple';

  const setType = (newType) => {
    if (newType === 'simple') onChange({ type: 'simple', value: '' });
    else if (newType === 'pattern') onChange({ type: 'pattern', value: '' });
    else if (newType === 'enumeration') onChange({ type: 'enumeration', values: [] });
    else if (newType === 'range') onChange({ type: 'range', min: '', max: '', minInclusive: true, maxInclusive: true });
  };

  const addEnum = () => {
    const v = enumInput.trim();
    if (!v) return;
    onChange({ ...value, values: [...(value?.values || []), v] });
    setEnumInput('');
  };

  const removeEnum = (i) => {
    onChange({ ...value, values: value.values.filter((_, idx) => idx !== i) });
  };

  return (
    <div className="space-y-2">
      <select
        className="h-8 rounded-md border bg-background px-2 text-xs"
        value={type}
        onChange={(e) => setType(e.target.value)}
      >
        {VALUE_TYPES.map((t) => (
          <option key={t.value} value={t.value}>{t.label}</option>
        ))}
      </select>

      {(type === 'simple' || type === 'pattern') && (
        <Input
          className="h-8 text-xs"
          placeholder={type === 'pattern' ? 'e.g. [A-Z0-9]+' : 'e.g. REI90'}
          value={value?.value || ''}
          onChange={(e) => onChange({ ...value, value: e.target.value })}
        />
      )}

      {type === 'enumeration' && (
        <div className="space-y-1">
          <div className="flex gap-1">
            <Input
              className="h-8 text-xs"
              placeholder="Add value…"
              value={enumInput}
              onChange={(e) => setEnumInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addEnum())}
            />
            <Button type="button" size="icon" variant="outline" className="h-8 w-8 shrink-0" onClick={addEnum}>
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-1">
            {(value?.values || []).map((v, i) => (
              <Badge key={i} variant="secondary" className="gap-1 text-xs">
                {v}
                <button type="button" onClick={() => removeEnum(i)}>
                  <X className="h-2.5 w-2.5" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {type === 'range' && (
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <Input
                className="h-8 text-xs"
                placeholder="Min"
                value={value?.min || ''}
                onChange={(e) => onChange({ ...value, min: e.target.value })}
              />
              <label className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={value?.minInclusive ?? true}
                  onChange={(e) => onChange({ ...value, minInclusive: e.target.checked })}
                />
                incl.
              </label>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <Input
                className="h-8 text-xs"
                placeholder="Max"
                value={value?.max || ''}
                onChange={(e) => onChange({ ...value, max: e.target.value })}
              />
              <label className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={value?.maxInclusive ?? true}
                  onChange={(e) => onChange({ ...value, maxInclusive: e.target.checked })}
                />
                incl.
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
