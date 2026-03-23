import { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';
import LibrarySidebar from '@/features/library/LibrarySidebar';
import {
  useGetIDSDetailQuery,
  useGetMyIDSQuery,
  useDeleteIDSMutation,
  useAddSpecificationToIDSMutation,
} from '@/features/ids/idsApi';
import {
  useGetMySpecificationsQuery,
  useDeleteSpecificationMutation,
  useGetSpecificationDetailQuery,
} from '@/features/specifications/specificationsApi';
import SpecificationCard from '@/features/specifications/SpecificationCard';
import SpecificationModal from '@/features/specifications/SpecificationModal';
import SpecificationForm from '@/features/specifications/SpecificationForm';
import IDSForm from '@/features/ids/IDSForm';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Pencil, Plus } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';

function AddSpecificationDialog({ idsId, existingIds, open, onClose }) {
  const { data } = useGetMySpecificationsQuery();
  const [addSpec] = useAddSpecificationToIDSMutation();
  const mySpecs = (Array.isArray(data) ? data : data?.results || []).filter(
    (s) => !existingIds.includes(s.id)
  );
  const handleAdd = async (specId) => {
    await addSpec({ idsId, specificationId: specId });
    onClose();
  };
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Specification</DialogTitle>
          <DialogDescription>Choose one of your specifications to add to this IDS.</DialogDescription>
        </DialogHeader>
        {mySpecs.length === 0
          ? <p className="text-sm text-muted-foreground italic">No specifications available. Create one first.</p>
          : (
            <ul className="space-y-2 max-h-80 overflow-y-auto">
              {mySpecs.map((spec) => (
                <li key={spec.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                  <div>
                    <p className="text-sm font-medium">{spec.name}</p>
                    <p className="text-xs text-muted-foreground">{spec.ifc_version}</p>
                  </div>
                  <Button size="sm" onClick={() => handleAdd(spec.id)}>Add</Button>
                </li>
              ))}
            </ul>
          )}
      </DialogContent>
    </Dialog>
  );
}

function IDSDetail({ idsId, onRemove }) {
  const currentUser = useSelector(selectCurrentUser);
  const { data: ids, isLoading } = useGetIDSDetailQuery(idsId, { skip: !idsId });
  const [selectedSpec, setSelectedSpec] = useState(null);
  const [editSpec, setEditSpec] = useState(null);
  const [showEditIDS, setShowEditIDS] = useState(false);
  const [showAddSpec, setShowAddSpec] = useState(false);
  const [showNewSpec, setShowNewSpec] = useState(false);

  if (!idsId)
    return <p className="text-muted-foreground mt-10 text-center">Select an item from the sidebar.</p>;
  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;
  if (!ids) return null;

  const isOwner = currentUser && ids.owner === currentUser.id;
  const existingSpecIds = (ids.specifications || []).map((s) => s.id);

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-4">
        <h1 className="text-2xl font-bold">{ids.title}</h1>
        {ids.version && <Badge variant="secondary">v{ids.version}</Badge>}
        {ids.tags && ids.tags.map((tag) => (
          <Badge key={tag.id} variant="outline" className="text-xs">{tag.name}</Badge>
        ))}
        <div className="ml-auto flex gap-2">
          {isOwner && (
            <Button variant="outline" size="sm" onClick={() => setShowEditIDS(true)}>
              <Pencil className="h-3.5 w-3.5 mr-1" /> Edit IDS info
            </Button>
          )}
          <Button variant="ghost" size="sm" className="text-destructive" onClick={onRemove}>
            Remove from library
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6 space-y-3">
          {ids.description && (
            <p className="text-sm text-muted-foreground">{ids.description}</p>
          )}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {ids.author_email && <span><strong className="text-foreground">Author:</strong> {ids.author_email}</span>}
            {ids.date && <span><strong className="text-foreground">Date:</strong> {ids.date}</span>}
            {ids.purpose && <span><strong className="text-foreground">Purpose:</strong> {ids.purpose}</span>}
            {ids.milestone && <span><strong className="text-foreground">Milestone:</strong> {ids.milestone}</span>}
          </div>
        </CardContent>
      </Card>

      <Separator className="my-6" />

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Specifications ({ids.specifications?.length || 0})</h2>
          {isOwner && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowAddSpec(true)}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Existing
              </Button>
              <Button size="sm" onClick={() => setShowNewSpec(true)}>
                <Plus className="h-3.5 w-3.5 mr-1" /> New Specification
              </Button>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ids.specifications && ids.specifications.length > 0 ? (
            ids.specifications.map((spec) => (
              <SpecificationCard key={spec.id} spec={spec} onClick={setSelectedSpec} />
            ))
          ) : (
            <p className="text-muted-foreground italic">No specifications.</p>
          )}
        </div>
      </section>

      <SpecificationModal
        spec={selectedSpec}
        onClose={() => setSelectedSpec(null)}
        onEdit={isOwner ? (s) => { setSelectedSpec(null); setEditSpec(s); } : undefined}
      />
      <SpecificationForm
        open={showNewSpec || !!editSpec}
        onClose={() => { setShowNewSpec(false); setEditSpec(null); }}
        initial={editSpec}
      />
      <IDSForm open={showEditIDS} onClose={() => setShowEditIDS(false)} initial={ids} />
      <AddSpecificationDialog
        idsId={idsId}
        existingIds={existingSpecIds}
        open={showAddSpec}
        onClose={() => setShowAddSpec(false)}
      />
    </div>
  );
}

function SpecificationDetail({ specId, onRemove }) {
  const { data: spec, isLoading } = useGetSpecificationDetailQuery(specId, { skip: !specId });
  const [showEdit, setShowEdit] = useState(false);

  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;
  if (!spec) return null;

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-4">
        <h1 className="text-2xl font-bold">{spec.name}</h1>
        <Badge variant="secondary">{spec.ifc_version}</Badge>
        {spec.tags && spec.tags.map((tag) => (
          <Badge key={tag.id} variant="outline" className="text-xs">{tag.name}</Badge>
        ))}
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowEdit(true)}>
            <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
          </Button>
          <Button variant="ghost" size="sm" className="text-destructive" onClick={onRemove}>
            Remove from library
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6 space-y-3">
          {spec.description && (
            <p className="text-sm text-muted-foreground">{spec.description}</p>
          )}
          {spec.instructions && (
            <div>
              <h3 className="font-semibold text-sm mb-1">Instructions</h3>
              <p className="text-sm text-muted-foreground">{spec.instructions}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator className="my-6" />

      {spec.applicability_conditions && spec.applicability_conditions.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Applicability</h2>
          <div className="space-y-2">
            {spec.applicability_conditions.map((cond) => (
              <div key={cond.id} className="text-sm p-2 bg-muted rounded">
                <strong>{cond.type}</strong>: {cond.key} {cond.operator} {cond.value}
              </div>
            ))}
          </div>
        </section>
      )}

      {spec.requirements && spec.requirements.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-3">Requirements</h2>
          <div className="space-y-2">
            {spec.requirements.map((req) => (
              <div key={req.id} className="text-sm p-2 bg-muted rounded">
                <strong>{req.property_set}.{req.property_name}</strong> ({req.constraint_type}): {req.value}
              </div>
            ))}
          </div>
        </section>
      )}

      <SpecificationForm open={showEdit} onClose={() => setShowEdit(false)} initial={spec} />
    </div>
  );
}

export default function UserLibraryPage() {
  const { data: myIDSData } = useGetMyIDSQuery();
  const { data: mySpecsData } = useGetMySpecificationsQuery();
  const [deleteIDS] = useDeleteIDSMutation();
  const [deleteSpec] = useDeleteSpecificationMutation();
  const [selectedEntryId, setSelectedEntryId] = useState(null);
  const [selectedSpecId, setSelectedSpecId] = useState(null);
  const [showNewIDS, setShowNewIDS] = useState(false);
  const [showNewSpec, setShowNewSpec] = useState(false);

  const idsList = Array.isArray(myIDSData) ? myIDSData : myIDSData?.results || [];
  const specsList = Array.isArray(mySpecsData) ? mySpecsData : mySpecsData?.results || [];
  const selectedIDS = idsList.find((ids) => ids.id === selectedEntryId);
  const selectedSpecification = specsList.find((spec) => spec.id === selectedSpecId);

  const handleRemoveIDS = async () => {
    if (!selectedIDS) return;
    try {
      await deleteIDS(selectedIDS.id).unwrap();
      setSelectedEntryId(null);
    } catch (err) {
      alert('Failed to remove IDS from library.');
      console.error(err);
    }
  };

  const handleRemoveSpec = async () => {
    if (!selectedSpecification) return;
    try {
      await deleteSpec(selectedSpecification.id).unwrap();
      setSelectedSpecId(null);
    } catch (err) {
      alert('Failed to remove specification from library.');
      console.error(err);
    }
  };

  return (
    <>
      <ResizablePanelGroup direction="horizontal" className="min-h-[calc(100vh)] -m-6">
        <ResizablePanel defaultSize={20} minSize={15} maxSize={25} data-panel>
          <LibrarySidebar
            idsList={idsList}
            selectedId={selectedEntryId}
            onSelectIDS={(id) => { setSelectedEntryId(id); setSelectedSpecId(null); }}
            selectedSpec={selectedSpecId}
            onSelectSpec={(id) => { setSelectedSpecId(id); setSelectedEntryId(null); }}
            onNewIDS={() => setShowNewIDS(true)}
            onNewSpec={() => setShowNewSpec(true)}
          />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={80} minSize={75} maxSize={85} data-panel>
          <div className="flex-1 p-6">
            {selectedEntryId ? (
              <IDSDetail idsId={selectedEntryId} onRemove={handleRemoveIDS} />
            ) : selectedSpecId ? (
              <SpecificationDetail specId={selectedSpecId} onRemove={handleRemoveSpec} />
            ) : (
              <p className="text-muted-foreground mt-10 text-center">
                Select an item from the sidebar.
              </p>
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      <IDSForm open={showNewIDS} onClose={() => setShowNewIDS(false)} />
      <SpecificationForm open={showNewSpec} onClose={() => setShowNewSpec(false)} />
    </>
  );
}
