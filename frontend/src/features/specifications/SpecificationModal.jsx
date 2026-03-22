import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

export default function SpecificationModal({ spec, onClose }) {
  return (
    <Dialog open={!!spec} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="text-xl">{spec?.name}</DialogTitle>
          <DialogDescription>Specification details</DialogDescription>
        </DialogHeader>

        {spec && (
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">IFC Version:</span>
                <Badge variant="secondary">{spec.ifc_version}</Badge>
              </div>

              {spec.identifier && (
                <div>
                  <span className="text-sm font-medium">Identifier:</span>
                  <p className="text-sm text-muted-foreground">{spec.identifier}</p>
                </div>
              )}

              {spec.description && (
                <>
                  <Separator />
                  <div>
                    <span className="text-sm font-medium">Description:</span>
                    <p className="text-sm text-muted-foreground mt-1">{spec.description}</p>
                  </div>
                </>
              )}

              {spec.instructions && (
                <div>
                  <span className="text-sm font-medium">Instructions:</span>
                  <p className="text-sm text-muted-foreground mt-1">{spec.instructions}</p>
                </div>
              )}

              {spec.applicability_data &&
                Object.keys(spec.applicability_data).length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <span className="text-sm font-medium">Applicability:</span>
                      <pre className="mt-1 rounded-md bg-muted p-3 text-xs overflow-x-auto">
                        {JSON.stringify(spec.applicability_data, null, 2)}
                      </pre>
                    </div>
                  </>
                )}

              {spec.requirements_data &&
                Object.keys(spec.requirements_data).length > 0 && (
                  <div>
                    <span className="text-sm font-medium">Requirements:</span>
                    <pre className="mt-1 rounded-md bg-muted p-3 text-xs overflow-x-auto">
                      {JSON.stringify(spec.requirements_data, null, 2)}
                    </pre>
                  </div>
                )}

              {spec.owner_username && (
                <>
                  <Separator />
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Owner:</span>
                    <span className="text-sm text-muted-foreground">{spec.owner_username}</span>
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
