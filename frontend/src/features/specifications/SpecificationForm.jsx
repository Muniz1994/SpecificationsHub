import { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
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
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Specification' : 'New Specification'}</DialogTitle>
          <DialogDescription>
            Define the specification's metadata, applicability facets and requirements.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <form id="spec-form" onSubmit={handleSubmit} className="space-y-6 pb-2">

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

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="spec-form" disabled={isLoading}>
            {isLoading ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Specification'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
