import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Pencil } from 'lucide-react';

function FacetList({ facets }) {
  if (!facets || facets.length === 0) return null;
  return (
    <div className="space-y-2">
      {facets.map((f, i) => (
        <div key={i} className="rounded-md bg-muted px-3 py-2 text-xs space-y-0.5">
          <span className="font-medium capitalize">{f.type}</span>
          {f.name && <span className="ml-2 text-muted-foreground">name: {f.name}</span>}
          {f.property_set && <span className="ml-2 text-muted-foreground">{f.property_set}.{f.base_name}</span>}
          {f.system && <span className="ml-2 text-muted-foreground">system: {f.system}</span>}
          {f.cardinality && <span className="ml-2 text-muted-foreground">[{f.cardinality}]</span>}
        </div>
      ))}
    </div>
  );
}

export default function SpecificationModal({ spec, onClose, onEdit }) {
  const hasFacets = Array.isArray(spec?.applicability_data) && spec.applicability_data.length > 0;
  const hasReqs = Array.isArray(spec?.requirements_data) && spec.requirements_data.length > 0;

  return (
    <Dialog open={!!spec} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <div className="flex items-start justify-between gap-2">
            <div>
              <DialogTitle className="text-xl">{spec?.name}</DialogTitle>
              <DialogDescription>Specification details</DialogDescription>
            </div>
            {onEdit && spec && (
              <Button variant="outline" size="sm" onClick={() => onEdit(spec)}>
                <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
              </Button>
            )}
          </div>
        </DialogHeader>

        {spec && (
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-4">

              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{spec.ifc_version}</Badge>
                {spec.is_public === false && (
                  <Badge variant="outline">Private</Badge>
                )}
              </div>

              {spec.tags && spec.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {spec.tags.map((tag) => (
                    <Badge key={tag.id} variant="outline" className="text-xs">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              )}

              {spec.identifier && (
                <div>
                  <span className="text-sm font-medium">Identifier: </span>
                  <span className="text-sm text-muted-foreground">{spec.identifier}</span>
                </div>
              )}

              {spec.description && (
                <>
                  <Separator />
                  <div>
                    <span className="text-sm font-medium">Description</span>
                    <p className="text-sm text-muted-foreground mt-1">{spec.description}</p>
                  </div>
                </>
              )}

              {spec.instructions && (
                <div>
                  <span className="text-sm font-medium">Instructions</span>
                  <p className="text-sm text-muted-foreground mt-1">{spec.instructions}</p>
                </div>
              )}

              {hasFacets && (
                <>
                  <Separator />
                  <div>
                    <span className="text-sm font-medium">Applicability</span>
                    <div className="mt-2">
                      <FacetList facets={spec.applicability_data} />
                    </div>
                  </div>
                </>
              )}

              {hasReqs && (
                <>
                  <Separator />
                  <div>
                    <span className="text-sm font-medium">Requirements</span>
                    <div className="mt-2">
                      <FacetList facets={spec.requirements_data} />
                    </div>
                  </div>
                </>
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
