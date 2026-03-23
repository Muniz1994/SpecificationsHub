import { useState } from 'react';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';
import LibrarySidebar from '@/features/library/LibrarySidebar';
import { useGetIDSDetailQuery, useGetMyIDSQuery, useDeleteIDSMutation } from '@/features/ids/idsApi';
import { useGetMySpecificationsQuery, useDeleteSpecificationMutation, useGetSpecificationDetailQuery } from '@/features/specifications/specificationsApi';
import SpecificationCard from '@/features/specifications/SpecificationCard';
import SpecificationModal from '@/features/specifications/SpecificationModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

function IDSDetail({ idsId, onRemove }) {
  const { data: ids, isLoading } = useGetIDSDetailQuery(idsId, { skip: !idsId });
  const [selectedSpec, setSelectedSpec] = useState(null);

  if (!idsId)
    return (
      <p className="text-muted-foreground mt-10 text-center">
        Select an item from the sidebar.
      </p>
    );
  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;
  if (!ids) return null;

  return (
    <div className="max-w-4xl">
      <div className="flex items-baseline gap-3 mb-4">
        <h1 className="text-2xl font-bold">{ids.title}</h1>
        {ids.version && <Badge variant="secondary">v{ids.version}</Badge>}
        {ids.tags && ids.tags.map((tag) => (
          <Badge key={tag.id} variant="outline" className="text-xs">{tag.name}</Badge>
        ))}
        <Button variant="ghost" size="sm" className="ml-auto text-destructive" onClick={onRemove}>
          Remove from library
        </Button>
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
        <h2 className="text-xl font-semibold mb-4">
          Specifications ({ids.specifications?.length || 0})
        </h2>
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

      <SpecificationModal spec={selectedSpec} onClose={() => setSelectedSpec(null)} />
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
  const [activeTab, setActiveTab] = useState('ids');

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
    <ResizablePanelGroup direction="horizontal" className="min-h-[calc(100vh)] -m-6">
      <ResizablePanel defaultSize={20} minSize={15} maxSize={25} data-panel>
        <LibrarySidebar
          idsList={idsList}
          selectedId={selectedEntryId}
          onSelectIDS={(id) => {
            setSelectedEntryId(id);
            setSelectedSpecId(null);
          }}
          selectedSpec={selectedSpecId}
          onSelectSpec={(id) => {
            setSelectedSpecId(id);
            setSelectedEntryId(null);
          }}
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
  );
}

function SpecificationDetail({ specId, onRemove }) {
  const { data: spec, isLoading } = useGetSpecificationDetailQuery(specId, { skip: !specId });

  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;
  if (!spec) return null;

  return (
    <div className="max-w-4xl">
      <div className="flex items-baseline gap-3 mb-4">
        <h1 className="text-2xl font-bold">{spec.name}</h1>
        <Badge variant="secondary">{spec.ifc_version}</Badge>
        {spec.tags && spec.tags.map((tag) => (
          <Badge key={tag.id} variant="outline" className="text-xs">{tag.name}</Badge>
        ))}
        <Button variant="ghost" size="sm" className="ml-auto text-destructive" onClick={onRemove}>
          Remove from library
        </Button>
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
    </div>
  );
}
