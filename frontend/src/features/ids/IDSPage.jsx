import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGetIDSDetailQuery } from '@/features/ids/idsApi';
import { useCopyIDSToLibraryMutation } from '@/features/ids/idsApi';
import SpecificationCard from '@/features/specifications/SpecificationCard';
import SpecificationModal from '@/features/specifications/SpecificationModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function IDSPage() {
  const { id } = useParams();
  const { data: ids, isLoading, error } = useGetIDSDetailQuery(id);
  const [selectedSpec, setSelectedSpec] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [copyIDSToLibrary, { isLoading: isCopying }] = useCopyIDSToLibraryMutation();

  const handleGetIDS = async () => {
    try {
      await copyIDSToLibrary(id).unwrap();
      setShowConfirmModal(false);
      alert('IDS and specifications added to your library!');
    } catch (err) {
      alert('Failed to add IDS to library. Please try again.');
      console.error(err);
    }
  };

  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;
  if (error) return <p className="text-destructive">Failed to load IDS.</p>;
  if (!ids) return null;

  return (
    <div className="max-w-4xl">
      <div className="flex items-baseline justify-between gap-3 mb-4">
        <div className="flex items-baseline gap-3">
          <h1 className="text-2xl font-bold">{ids.title}</h1>
          {ids.version && <Badge variant="secondary">v{ids.version}</Badge>}
        </div>
        <Button onClick={() => setShowConfirmModal(true)}>Get IDS</Button>
      </div>

      <Card className="mb-8">
        <CardContent className="pt-6 space-y-4">
          {ids.description && (
            <p className="text-sm text-muted-foreground">{ids.description}</p>
          )}

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {ids.author_email && (
              <span><strong className="text-foreground">Author:</strong> {ids.author_email}</span>
            )}
            {ids.date && (
              <span><strong className="text-foreground">Date:</strong> {ids.date}</span>
            )}
            {ids.purpose && (
              <span><strong className="text-foreground">Purpose:</strong> {ids.purpose}</span>
            )}
            {ids.milestone && (
              <span><strong className="text-foreground">Milestone:</strong> {ids.milestone}</span>
            )}
            {ids.copyright_text && (
              <span><strong className="text-foreground">Copyright:</strong> {ids.copyright_text}</span>
            )}
          </div>
        </CardContent>
      </Card>

      <Separator className="my-6" />

      <section>
        <h2 className="text-xl font-semibold mb-4">
          Specifications ({ids.specifications?.length || 0})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ids.specifications && ids.specifications.length > 0 ? (
            ids.specifications.map((spec) => (
              <SpecificationCard
                key={spec.id}
                spec={spec}
                onClick={setSelectedSpec}
              />
            ))
          ) : (
            <p className="text-muted-foreground italic">No specifications in this IDS.</p>
          )}
        </div>
      </section>

      <SpecificationModal
        spec={selectedSpec}
        onClose={() => setSelectedSpec(null)}
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
