import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export default function LibrarySidebar({ idsList, selectedId, onSelectIDS }) {
  return (
    <aside className="w-56 min-h-full shrink-0 border-r bg-card p-4">
      <h3 className="text-sm font-semibold mb-3">My IDSs</h3>
      <Separator className="mb-3" />
      {(!idsList || idsList.length === 0) && (
        <p className="text-sm text-muted-foreground">No IDSs yet.</p>
      )}
      <ScrollArea className="h-[calc(100vh-160px)]">
        <ul className="space-y-1">
          {idsList &&
            idsList.map((ids) => (
              <li key={ids.id}>
                <Button
                  variant={selectedId === ids.id ? 'secondary' : 'ghost'}
                  size="sm"
                  className={cn(
                    'w-full justify-start text-left',
                    selectedId === ids.id && 'font-medium'
                  )}
                  onClick={() => onSelectIDS(ids.id)}
                >
                  {ids.title}
                </Button>
              </li>
            ))}
        </ul>
      </ScrollArea>
    </aside>
  );
}
