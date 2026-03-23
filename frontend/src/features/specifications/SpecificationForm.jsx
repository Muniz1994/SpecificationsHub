import { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Filter, CheckSquare } from 'lucide-react';
import FacetBuilder from './FacetBuilder';
import {
  useCreateSpecificationMutation,
  useUpdateSpecificationMutation,
} from './specificationsApi';

const IFC_VERSIONS = ['IFC2X3', 'IFC4', 'IFC4X3_ADD2'];

const EMPTY_FORM = {
  name: '',
  ifc_version: 'IFC4',
  identifier: '',
  description: '',
  instructions: '',
  applicability_data: [],
  requirements_data: [],
};

function FacetPill({ f }) {
  const label = f.type ? f.type.charAt(0).toUpperCase() + f.type.slice(1) : '?';
  const detail = f.name
    ? f.name
    : f.property_set
    ? `${f.property_set}.${f.base_name ?? ''}`
    : f.system ?? null;
  return (
    <div className="flex items-start gap-2 rounded-md border bg-muted/40 px-3 py-2 text-xs">
      <span className="font-semibold text-foreground min-w-[72px]">{label}</span>
      {detail && <span className="text-muted-foreground truncate">{detail}</span>}
      {f.cardinality && (
        <Badge variant="outline" className="ml-auto text-[10px] px-1 py-0 shrink-0">
          {f.cardinality}
        </Badge>
      )}
    </div>
  );
}

function FacetPanel({ title, icon: Icon, facets, emptyText }) {
  return (
    <section className="space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {title}
        <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0">{facets.length}</Badge>
      </div>
      {facets.length === 0
        ? <p className="text-xs text-muted-foreground italic">{emptyText}</p>
        : facets.map((f, i) => <FacetPill key={i} f={f} />)
      }
    </section>
  );
}

export default function SpecificationForm({ open, onClose, initial = null }) {
  const isEdit = !!initial;
  const [form, setForm] = useState(isEdit ? {
    name: initial.name || '',
    ifc_version: initial.ifc_version || 'IFC4',
    identifier: initial.identifier || '',
    description: initial.description || '',
    instructions: initial.instructions || '',
    applicability_data: initial.applicability_data || [],
    requirements_data: initial.requirements_data || [],
  } : EMPTY_FORM);

  // Re-sync form whenever the dialog is opened (initial may load after mount)
  useEffect(() => {
    if (open) {
      setForm(initial ? {
        name: initial.name || '',
        ifc_version: initial.ifc_version || 'IFC4',
        identifier: initial.identifier || '',
        description: initial.description || '',
        instructions: initial.instructions || '',
        applicability_data: Array.isArray(initial.applicability_data) ? initial.applicability_data : [],
        requirements_data: Array.isArray(initial.requirements_data) ? initial.requirements_data : [],
      } : EMPTY_FORM);
    }
  }, [open, initial?.id]);

  const [createSpec, { isLoading: creating }] = useCreateSpecificationMutation();
  const [updateSpec, { isLoading: updating }] = useUpdateSpecificationMutation();
  const isLoading = creating || updating;

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await updateSpec({ id: initial.id, ...form }).unwrap();
      } else {
        await createSpec(form).unwrap();
      }
      onClose();
    } catch (err) {
      console.error('Failed to save specification', err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-[70vw] sm:max-w-[70vw] w-[70vw] p-0 gap-0 max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b">
          <DialogTitle className="text-xl">
            {isEdit ? 'Edit Specification' : 'New Specification'}
          </DialogTitle>
          <DialogDescription className="mt-1">
            Define the specification's metadata, applicability facets and requirements.
          </DialogDescription>
        </div>

        {/* Body */}
        <div className="flex overflow-hidden" style={{ height: 'calc(95vh - 140px)' }}>
          {/* Left panel — live facet preview */}
          <ScrollArea className="w-80 shrink-0 border-r bg-muted/20">
            <div className="p-4 space-y-5">
              <FacetPanel
                title="Applicability"
                icon={Filter}
                facets={form.applicability_data}
                emptyText="No applicability facets yet"
              />
              <Separator />
              <FacetPanel
                title="Requirements"
                icon={CheckSquare}
                facets={form.requirements_data}
                emptyText="No requirements yet"
              />
            </div>
          </ScrollArea>

          {/* Right panel — form */}
          <ScrollArea className="flex-1">
            <form id="spec-form" onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* ── Info ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <Label htmlFor="spec-name">Name *</Label>
                  <Input id="spec-name" required value={form.name} onChange={set('name')}
                    placeholder="e.g. Wall fire rating" />
                </div>
                <div className="space-y-1">
                  <Label>IFC Version *</Label>
                  <select
                    className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                    value={form.ifc_version}
                    onChange={set('ifc_version')}
                  >
                    {IFC_VERSIONS.map((v) => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="spec-id">Identifier</Label>
                  <Input id="spec-id" value={form.identifier} onChange={set('identifier')}
                    placeholder="Optional unique identifier" />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <Label htmlFor="spec-desc">Description</Label>
                  <textarea
                    id="spec-desc"
                    rows={3}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    value={form.description}
                    onChange={set('description')}
                    placeholder="Describe what this specification checks…"
                  />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <Label htmlFor="spec-instr">Instructions</Label>
                  <textarea
                    id="spec-instr"
                    rows={2}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    value={form.instructions}
                    onChange={set('instructions')}
                    placeholder="Optional usage instructions for model authors…"
                  />
                </div>
              </div>

              <Separator />

              {/* ── Applicability ── */}
              <FacetBuilder
                label="Applicability — which elements does this specification apply to?"
                value={form.applicability_data}
                onChange={(v) => setForm((f) => ({ ...f, applicability_data: v }))}
              />

              <Separator />

              {/* ── Requirements ── */}
              <FacetBuilder
                label="Requirements — what must those elements satisfy?"
                value={form.requirements_data}
                onChange={(v) => setForm((f) => ({ ...f, requirements_data: v }))}
              />
            </form>
          </ScrollArea>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-6 py-3 border-t">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="spec-form" disabled={isLoading}>
            {isLoading ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Specification'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
