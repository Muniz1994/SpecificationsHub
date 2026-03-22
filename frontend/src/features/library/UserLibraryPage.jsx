import { useState } from 'react';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';
import LibrarySidebar from '@/features/library/LibrarySidebar';
import { useGetMyIDSQuery, useGetIDSDetailQuery } from '@/features/ids/idsApi';
import SpecificationCard from '@/features/specifications/SpecificationCard';
import SpecificationModal from '@/features/specifications/SpecificationModal';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

function IDSDetail({ idsId }) {
  const { data: ids, isLoading } = useGetIDSDetailQuery(idsId, {
    skip: !idsId,
  });
  const [selectedSpec, setSelectedSpec] = useState(null);

  if (!idsId)
    return (
      <p className="text-muted-foreground mt-10 text-center">
        Select an IDS from the sidebar.
      </p>
    );
  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;
  if (!ids) return null;

  return (
    <div className="max-w-4xl">
      <div className="flex items-baseline gap-3 mb-4">
        <h1 className="text-2xl font-bold">{ids.title}</h1>
        {ids.version && <Badge variant="secondary">v{ids.version}</Badge>}
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
  const { data } = useGetMyIDSQuery();
  const [selectedIdsId, setSelectedIdsId] = useState(null);

  const idsList = data?.results || data || [];

  return (
    <ResizablePanelGroup direction="horizontal" className="min-h-[calc(100vh)] -m-6">
      <ResizablePanel defaultSize={20} minSize={15} maxSize={25} data-panel>
        <LibrarySidebar
          idsList={idsList}
          selectedId={selectedIdsId}
          onSelectIDS={setSelectedIdsId}
        />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={80} minSize={75} maxSize={85} data-panel>
        <div className="flex-1 p-6">
          <IDSDetail idsId={selectedIdsId} />
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
