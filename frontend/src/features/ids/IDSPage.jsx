import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import SpecificationCard from '@/features/specifications/SpecificationCard';
import SpecificationModal from '@/features/specifications/SpecificationModal';
import { selectCurrentUser } from '@/features/auth/authSlice';
import {
  useGetIDSDetailQuery,
  useRemoveSpecificationFromIDSMutation,
  useCopyIDSToLibraryMutation,
} from '@/features/ids/idsApi';
import { Trash2 } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function IDSPage() {
  const { id } = useParams();
  const { data: ids, isLoading, error } = useGetIDSDetailQuery(id);
  const currentUser = useSelector(selectCurrentUser);
  const [removeSpec] = useRemoveSpecificationFromIDSMutation();
  const [copyIDSToLibrary, { isLoading: isCopying }] = useCopyIDSToLibraryMutation();

  const [selectedSpec, setSelectedSpec] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;
  if (error) return <p className="text-destructive">Failed to load IDS.</p>;
  if (!ids) return null;

  const isOwner = currentUser && ids.owner === currentUser.id;

  const handleRemoveSpec = async (specId) => {
    await removeSpec({ idsId: ids.id, specificationId: specId });
  };

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

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-4">
        <h1 className="text-2xl font-bold">{ids.title}</h1>
        {ids.version && <Badge variant="secondary">v{ids.version}</Badge>}
        {!isOwner && (
          <Button size="sm" className="ml-auto" onClick={() => setShowConfirmModal(true)}>
            Get IDS
          </Button>
        )}
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
        <h2 className="text-xl font-semibold mb-4">
          Specifications ({ids.specifications?.length || 0})
        </h2>

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

      <SpecificationModal spec={selectedSpec} onClose={() => setSelectedSpec(null)} />

      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add IDS to Library</DialogTitle>
            <DialogDescription>
              A local copy of this IDS and all its specifications will be added to your library.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmModal(false)} disabled={isCopying}>
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
