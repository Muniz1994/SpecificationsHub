import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Trash2, Plus } from 'lucide-react';
import { useDeleteIDSMutation, useDeleteIDSWithSpecificationsMutation } from '@/features/ids/idsApi';
import { useGetMySpecificationsQuery, useDeleteSpecificationMutation } from '@/features/specifications/specificationsApi';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function LibrarySidebar({ idsList, selectedId, onSelectIDS, selectedSpec, onSelectSpec, onNewIDS, onNewSpec }) {
  const [activeTab, setActiveTab] = useState('ids');
  const [deleteIDS, { isLoading: isDeletingIDS }] = useDeleteIDSMutation();
  const [deleteIDSWithSpecs, { isLoading: isDeletingIDSWithSpecs }] = useDeleteIDSWithSpecificationsMutation();
  const [deleteSpec, { isLoading: isDeletingSpec }] = useDeleteSpecificationMutation();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedIDSToDelete, setSelectedIDSToDelete] = useState(null);
  const [alsoDeleteSpecs, setAlsoDeleteSpecs] = useState(false);
  const { data: specsData } = useGetMySpecificationsQuery();
  const mySpecs = Array.isArray(specsData) ? specsData : specsData?.results || [];

  const isDeleting = isDeletingIDS || isDeletingIDSWithSpecs || isDeletingSpec;

  const handleDeleteClick = (e, item) => {
    e.stopPropagation();
    setSelectedIDSToDelete(item);
    setAlsoDeleteSpecs(false);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedIDSToDelete) return;
    try {
      const isSpec = !selectedIDSToDelete.title;
      if (isSpec) {
        await deleteSpec(selectedIDSToDelete.id).unwrap();
      } else if (alsoDeleteSpecs) {
        await deleteIDSWithSpecs(selectedIDSToDelete.id).unwrap();
      } else {
        await deleteIDS(selectedIDSToDelete.id).unwrap();
      }
      setShowDeleteModal(false);
      setSelectedIDSToDelete(null);
      setAlsoDeleteSpecs(false);
    } catch (err) {
      alert('Failed to delete item. Please try again.');
      console.error(err);
    }
  };
  return (
    <aside className="min-h-full shrink-0 border-r bg-card p-4 flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Button
          variant={activeTab === 'ids' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('ids')}
        >
          My IDSs
        </Button>
        <Button
          variant={activeTab === 'specs' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('specs')}
        >
          My Specifications
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 ml-auto"
          title={activeTab === 'ids' ? 'New IDS' : 'New Specification'}
          onClick={activeTab === 'ids' ? onNewIDS : onNewSpec}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <Separator className="mb-3" />
      {activeTab === 'ids' ? (
        <>
          {(!idsList || idsList.length === 0) && (
            <p className="text-sm text-muted-foreground">No IDSs yet.</p>
          )}
          <ScrollArea className="h-[calc(100vh-200px)] flex-1">
            <ul className="space-y-1">
          {idsList &&
            idsList.map((ids) => (
              <li key={ids.id} className="flex items-center gap-2">
                <Button
                  variant={selectedId === ids.id ? 'secondary' : 'ghost'}
                  size="sm"
                  className={cn(
                    'flex-1 justify-start text-left',
                    selectedId === ids.id && 'font-medium'
                  )}
                  onClick={() => onSelectIDS(ids.id)}
                >
                  {ids.title}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 shrink-0"
                  onClick={(e) => handleDeleteClick(e, ids)}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                </Button>
              </li>
            ))}            </ul>
          </ScrollArea>
        </>
      ) : (
        <>
          {(!mySpecs || mySpecs.length === 0) && (
            <p className="text-sm text-muted-foreground">No specifications yet.</p>
          )}
          <ScrollArea className="h-[calc(100vh-200px)] flex-1">
            <ul className="space-y-1">
              {mySpecs &&
                mySpecs.map((spec) => (
                  <li key={spec.id} className="flex items-center gap-2">
                    <Button
                      variant={selectedSpec === spec.id ? 'secondary' : 'ghost'}
                      size="sm"
                      className={cn(
                        'flex-1 justify-start text-left',
                        selectedSpec === spec.id && 'font-medium'
                      )}
                      onClick={() => onSelectSpec(spec.id)}
                      title={spec.description || 'No description'}
                    >
                      {spec.name}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 shrink-0"
                      onClick={(e) => handleDeleteClick(e, spec)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </li>
                ))}
            </ul>
          </ScrollArea>
        </>
      )}

      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {selectedIDSToDelete?.title ? 'IDS' : 'Specification'}</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{selectedIDSToDelete?.title || selectedIDSToDelete?.name}&rdquo;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedIDSToDelete?.title && (
            <div className="flex items-center gap-2 py-2">
              <Checkbox
                id="delete-specs"
                checked={alsoDeleteSpecs}
                onCheckedChange={(checked) => setAlsoDeleteSpecs(!!checked)}
              />
              <label htmlFor="delete-specs" className="text-sm cursor-pointer">
                Also delete all its specifications
              </label>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </aside>
  );
}
