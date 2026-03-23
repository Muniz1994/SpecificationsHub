import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Trash2 } from 'lucide-react';
import { useDeleteIDSMutation } from '@/features/ids/idsApi';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function LibrarySidebar({ idsList, selectedId, onSelectIDS }) {
  const [deleteIDS, { isLoading: isDeleting }] = useDeleteIDSMutation();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedIDSToDelete, setSelectedIDSToDelete] = useState(null);

  const handleDeleteClick = (e, ids) => {
    e.stopPropagation();
    setSelectedIDSToDelete(ids);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedIDSToDelete) return;
    try {
      await deleteIDS(selectedIDSToDelete.id).unwrap();
      setShowDeleteModal(false);
      setSelectedIDSToDelete(null);
    } catch (err) {
      alert('Failed to delete IDS. Please try again.');
      console.error(err);
    }
  };
  return (
    <aside className="min-h-full shrink-0 border-r bg-card p-4">
      <h3 className="text-sm font-semibold mb-3">My IDSs</h3>
      <Separator className="mb-3" />
      {(!idsList || idsList.length === 0) && (
        <p className="text-sm text-muted-foreground">No IDSs yet.</p>
      )}
      <ScrollArea className="h-[calc(100vh-160px)]">
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
            ))}
        </ul>
      </ScrollArea>

      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete IDS</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedIDSToDelete?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
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
