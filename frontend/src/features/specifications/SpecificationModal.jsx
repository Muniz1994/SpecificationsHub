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

function ApplicabilitySection({ conditions }) {
  if (!conditions || conditions.length === 0) return null;
  return (
    <>
      <Separator />
      <div>
        <span className="text-sm font-medium">Applicability Conditions</span>
        <div className="mt-2 space-y-2">
          {conditions.map((c) => (
            <div key={c.id} className="rounded-md bg-muted px-3 py-2 text-xs">
              <span className="font-medium capitalize">{c.type}</span>
              {c.key && <span className="ml-2 text-muted-foreground">key: {c.key}</span>}
              {c.operator && <span className="ml-2 text-muted-foreground">op: {c.operator}</span>}
              {c.value && <span className="ml-2 text-muted-foreground">= {c.value}</span>}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function RequirementsSection({ requirements }) {
  if (!requirements || requirements.length === 0) return null;
  return (
    <>
      <Separator />
      <div>
        <span className="text-sm font-medium">Requirements</span>
        <div className="mt-2 space-y-2">
          {requirements.map((r) => (
            <div key={r.id} className="rounded-md bg-muted px-3 py-2 text-xs">
              <span className="font-medium">{r.property_set}.{r.property_name}</span>
              <span className="ml-2 text-muted-foreground capitalize">[{r.constraint_type}]</span>
              {r.value && <span className="ml-2 text-muted-foreground">= {r.value}</span>}
              {r.data_type && <span className="ml-2 text-muted-foreground">({r.data_type})</span>}
              {r.unit && <span className="ml-2 text-muted-foreground">{r.unit}</span>}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

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

              <ApplicabilitySection conditions={spec.applicability_conditions} />
              <RequirementsSection requirements={spec.requirements} />

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
