import { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCreateIDSMutation, useUpdateIDSMutation } from './idsApi';

const EMPTY_FORM = {
  title: '',
  version: '',
  description: '',
  author_email: '',
  copyright_text: '',
  date: '',
  purpose: '',
  milestone: '',
};

export default function IDSForm({ open, onClose, initial = null }) {
  const isEdit = !!initial;
  const [form, setForm] = useState(isEdit ? {
    title: initial.title || '',
    version: initial.version || '',
    description: initial.description || '',
    author_email: initial.author_email || '',
    copyright_text: initial.copyright_text || '',
    date: initial.date || '',
    purpose: initial.purpose || '',
    milestone: initial.milestone || '',
  } : EMPTY_FORM);

  const [createIDS, { isLoading: creating }] = useCreateIDSMutation();
  const [updateIDS, { isLoading: updating }] = useUpdateIDSMutation();
  const isLoading = creating || updating;

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await updateIDS({ id: initial.id, ...form }).unwrap();
      } else {
        await createIDS(form).unwrap();
      }
      onClose();
    } catch (err) {
      console.error('Failed to save IDS', err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit IDS' : 'New IDS'}</DialogTitle>
          <DialogDescription>
            Fill in the IDS information. You can add specifications after creating it.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <form id="ids-form" onSubmit={handleSubmit} className="space-y-4 pb-2">

            <div className="space-y-1">
              <Label htmlFor="ids-title">Title *</Label>
              <Input id="ids-title" required value={form.title} onChange={set('title')}
                placeholder="e.g. Fire Safety IDS" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="ids-version">Version</Label>
                <Input id="ids-version" value={form.version} onChange={set('version')}
                  placeholder="e.g. 1.0.0" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="ids-date">Date</Label>
                <Input id="ids-date" type="date" value={form.date} onChange={set('date')} />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="ids-author">Author Email</Label>
              <Input id="ids-author" type="email" value={form.author_email}
                onChange={set('author_email')} placeholder="author@example.com" />
            </div>

            <div className="space-y-1">
              <Label htmlFor="ids-copyright">Copyright</Label>
              <Input id="ids-copyright" value={form.copyright_text}
                onChange={set('copyright_text')} placeholder="© 2026 Organisation" />
            </div>

            <div className="space-y-1">
              <Label htmlFor="ids-desc">Description</Label>
              <textarea
                id="ids-desc"
                rows={3}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={form.description}
                onChange={set('description')}
                placeholder="Describe the purpose of this IDS…"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="ids-purpose">Purpose</Label>
                <Input id="ids-purpose" value={form.purpose} onChange={set('purpose')}
                  placeholder="e.g. BIM coordination" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="ids-milestone">Milestone</Label>
                <Input id="ids-milestone" value={form.milestone} onChange={set('milestone')}
                  placeholder="e.g. Design development" />
              </div>
            </div>

          </form>
        </ScrollArea>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="ids-form" disabled={isLoading}>
            {isLoading ? 'Saving…' : isEdit ? 'Save Changes' : 'Create IDS'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
