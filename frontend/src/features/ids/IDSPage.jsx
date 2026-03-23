import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGetIDSDetailQuery } from '@/features/ids/idsApi';
import SpecificationCard from '@/features/specifications/SpecificationCard';
import SpecificationModal from '@/features/specifications/SpecificationModal';
import SpecificationForm from '@/features/specifications/SpecificationForm';
import IDSForm from '@/features/ids/IDSForm';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function IDSPage() {
  const { id } = useParams();
  const { data: ids, isLoading, error } = useGetIDSDetailQuery(id);
  const currentUser = useSelector(selectCurrentUser);
  const [removeSpec] = useRemoveSpecificationFromIDSMutation();

  const [selectedSpec, setSelectedSpec] = useState(null);

  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;
  if (error) return <p className="text-destructive">Failed to load IDS.</p>;
  if (!ids) return null;

  const isOwner = currentUser && ids.owner === currentUser.id;
  const existingSpecIds = (ids.specifications || []).map((s) => s.id);

  const handleRemoveSpec = async (specId) => {
    await removeSpec({ idsId: ids.id, specificationId: specId });
  };

  return (
    <div className="max-w-4xl">
      <div className="flex items-baseline gap-3 mb-4">
        <h1 className="text-2xl font-bold">{ids.title}</h1>
        {ids.version && <Badge variant="secondary">v{ids.version}</Badge>}
      </div>

      <Card className="mb-8">
        <CardContent className="pt-6 space-y-4">
          {ids.description && (
            <p className="text-sm text-muted-foreground">{ids.description}</p>
          )}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {ids.author_email && <span><strong className="text-foreground">Author:</strong> {ids.author_email}</span>}
            {ids.date && <span><strong className="text-foreground">Date:</strong> {ids.date}</span>}
            {ids.purpose && <span><strong className="text-foreground">Purpose:</strong> {ids.purpose}</span>}
            {ids.milestone && <span><strong className="text-foreground">Milestone:</strong> {ids.milestone}</span>}
            {ids.copyright_text && <span><strong className="text-foreground">Copyright:</strong> {ids.copyright_text}</span>}
          </div>
        </CardContent>
      </Card>

      <Separator className="my-6" />

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            Specifications ({ids.specifications?.length || 0})
          </h2>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ids.specifications && ids.specifications.length > 0 ? (
            ids.specifications.map((spec) => (
              <div key={spec.id} className="relative group">
                <SpecificationCard spec={spec} onClick={setSelectedSpec} />
                {isOwner && (
                  <button
                    className="absolute top-2 right-2 hidden group-hover:flex items-center justify-center h-6 w-6 rounded-full bg-destructive text-destructive-foreground"
                    title="Remove from IDS"
                    onClick={() => handleRemoveSpec(spec.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))
          ) : (
            <p className="text-muted-foreground italic">No specifications in this IDS.</p>
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

      <IDSForm
        open={showEditIDS}
        onClose={() => setShowEditIDS(false)}
        initial={ids}
      />

      <AddSpecificationDialog
        idsId={ids.id}
        existingIds={existingSpecIds}
        open={showAddSpec}
        onClose={() => setShowAddSpec(false)}
      />

      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add IDS to Library</DialogTitle>
            <DialogDescription>
              A local copy of this IDS and all its specifications will be added to your library. You'll be able to access them anytime in your User Library.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
              disabled={isCopying}
            >
              Cancel
            </Button>
            <Button onClick={handleGetIDS} disabled={isCopying}>
              {isCopying ? 'Adding...' : 'OK'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
