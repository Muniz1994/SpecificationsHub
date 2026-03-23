import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import ValueInput from './ValueInput';

const FACET_TYPES = [
  { value: 'entity', label: 'Entity' },
  { value: 'attribute', label: 'Attribute' },
  { value: 'property', label: 'Property' },
  { value: 'classification', label: 'Classification' },
  { value: 'material', label: 'Material' },
  { value: 'partof', label: 'PartOf' },
];

const CARDINALITIES = [
  { value: 'required', label: 'Required' },
  { value: 'optional', label: 'Optional' },
  { value: 'prohibited', label: 'Prohibited' },
];

const IFC_ENTITY_SUGGESTIONS = [
  'IFCWALL', 'IFCWALLSTANDARDCASE', 'IFCSLAB', 'IFCBEAM', 'IFCCOLUMN',
  'IFCDOOR', 'IFCWINDOW', 'IFCSPACE', 'IFCBUILDINGELEMENT', 'IFCFURNITURE',
  'IFCFLOW SEGMENT', 'IFCPIPESEGMENT', 'IFCDUCT SEGMENT', 'IFCSTAIR', 'IFCROOF',
];

const PARTOF_RELATIONS = [
  'IFCRELAGGREGATES', 'IFCRELCONTAINEDINSPATIALSTRUCTURE',
  'IFCRELASSIGNSTOGROUP', 'IFCRELCONNECTSELEMENTS',
];

function Field({ label, children }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

function FacetFields({ facet, onChange }) {
  const set = (key, val) => onChange({ ...facet, [key]: val });

  switch (facet.type) {
    case 'entity':
      return (
        <>
          <Field label="IFC Entity Name *">
            <Input className="h-8 text-xs" list="ifc-entities"
              placeholder="e.g. IFCWALL"
              value={facet.name || ''}
              onChange={(e) => set('name', e.target.value.toUpperCase())} />
            <datalist id="ifc-entities">
              {IFC_ENTITY_SUGGESTIONS.map((s) => <option key={s} value={s} />)}
            </datalist>
          </Field>
          <Field label="Predefined Type">
            <Input className="h-8 text-xs" placeholder="e.g. SHEAR"
              value={facet.predefined_type || ''}
              onChange={(e) => set('predefined_type', e.target.value)} />
          </Field>
        </>
      );

    case 'attribute':
      return (
        <>
          <Field label="Attribute Name *">
            <Input className="h-8 text-xs" placeholder="e.g. Name"
              value={facet.name || ''}
              onChange={(e) => set('name', e.target.value)} />
          </Field>
          <Field label="Value">
            <ValueInput value={facet.value} onChange={(v) => set('value', v)} />
          </Field>
        </>
      );

    case 'property':
      return (
        <>
          <Field label="Property Set *">
            <Input className="h-8 text-xs" placeholder="e.g. Pset_WallCommon"
              value={facet.property_set || ''}
              onChange={(e) => set('property_set', e.target.value)} />
          </Field>
          <Field label="Property Name *">
            <Input className="h-8 text-xs" placeholder="e.g. FireRating"
              value={facet.base_name || ''}
              onChange={(e) => set('base_name', e.target.value)} />
          </Field>
          <Field label="Data Type">
            <Input className="h-8 text-xs" placeholder="e.g. IfcLabel"
              value={facet.data_type || ''}
              onChange={(e) => set('data_type', e.target.value)} />
          </Field>
          <Field label="Value">
            <ValueInput value={facet.value} onChange={(v) => set('value', v)} />
          </Field>
          <Field label="URI">
            <Input className="h-8 text-xs" placeholder="Optional URI"
              value={facet.uri || ''}
              onChange={(e) => set('uri', e.target.value)} />
          </Field>
        </>
      );

    case 'classification':
      return (
        <>
          <Field label="System">
            <Input className="h-8 text-xs" placeholder="e.g. Uniclass, OmniClass"
              value={facet.system || ''}
              onChange={(e) => set('system', e.target.value)} />
          </Field>
          <Field label="Value">
            <ValueInput value={facet.value} onChange={(v) => set('value', v)} />
          </Field>
          <Field label="URI">
            <Input className="h-8 text-xs" placeholder="Optional URI"
              value={facet.uri || ''}
              onChange={(e) => set('uri', e.target.value)} />
          </Field>
        </>
      );

    case 'material':
      return (
        <>
          <Field label="Value">
            <ValueInput value={facet.value} onChange={(v) => set('value', v)} />
          </Field>
          <Field label="URI">
            <Input className="h-8 text-xs" placeholder="Optional URI"
              value={facet.uri || ''}
              onChange={(e) => set('uri', e.target.value)} />
          </Field>
        </>
      );

    case 'partof':
      return (
        <>
          <Field label="Entity Name *">
            <Input className="h-8 text-xs" list="ifc-entities-partof"
              placeholder="e.g. IFCBUILDING"
              value={facet.name || ''}
              onChange={(e) => set('name', e.target.value.toUpperCase())} />
            <datalist id="ifc-entities-partof">
              {IFC_ENTITY_SUGGESTIONS.map((s) => <option key={s} value={s} />)}
            </datalist>
          </Field>
          <Field label="Predefined Type">
            <Input className="h-8 text-xs"
              value={facet.predefined_type || ''}
              onChange={(e) => set('predefined_type', e.target.value)} />
          </Field>
          <Field label="Relation">
            <select className="h-8 w-full rounded-md border bg-background px-2 text-xs"
              value={facet.relation || ''}
              onChange={(e) => set('relation', e.target.value)}>
              <option value="">— select —</option>
              {PARTOF_RELATIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </Field>
        </>
      );

    default:
      return null;
  }
}

function FacetRow({ facet, onChange, onRemove }) {
  return (
    <div className="rounded-md border p-3 space-y-3 bg-muted/30">
      <div className="flex items-center gap-2">
        <select
          className="h-8 rounded-md border bg-background px-2 text-xs font-medium"
          value={facet.type}
          onChange={(e) => onChange({ type: e.target.value, cardinality: 'required' })}
        >
          {FACET_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <select
          className="h-8 rounded-md border bg-background px-2 text-xs ml-auto"
          value={facet.cardinality || 'required'}
          onChange={(e) => onChange({ ...facet, cardinality: e.target.value })}
        >
          {CARDINALITIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive"
          onClick={onRemove}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FacetFields facet={facet} onChange={onChange} />
      </div>
      <Field label="Instructions">
        <Input className="h-8 text-xs" placeholder="Optional instructions"
          value={facet.instructions || ''}
          onChange={(e) => onChange({ ...facet, instructions: e.target.value })} />
      </Field>
    </div>
  );
}

const DEFAULT_FACET = { type: 'entity', cardinality: 'required', name: '' };

/**
 * FacetBuilder — dynamic list of facets for Applicability or Requirements.
 * value: array of facet objects
 * onChange: (newArray) => void
 */
export default function FacetBuilder({ label, value = [], onChange }) {
  const add = () => onChange([...value, { ...DEFAULT_FACET }]);
  const update = (i, facet) => onChange(value.map((f, idx) => idx === i ? facet : f));
  const remove = (i) => onChange(value.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">{label}</span>
        <Button type="button" variant="outline" size="sm" onClick={add}>
          <Plus className="h-3 w-3 mr-1" /> Add Facet
        </Button>
      </div>
      {value.length === 0 && (
        <p className="text-xs text-muted-foreground italic">No facets yet. Click "Add Facet" to define one.</p>
      )}
      {value.map((facet, i) => (
        <FacetRow key={i} facet={facet}
          onChange={(f) => update(i, f)}
          onRemove={() => remove(i)} />
      ))}
    </div>
  );
}
