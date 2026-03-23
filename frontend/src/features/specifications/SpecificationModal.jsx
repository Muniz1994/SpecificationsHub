import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { TagList } from '@/components/TagPill';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Pencil, CheckSquare, Filter, X } from 'lucide-react';
import { useGetSpecificationDetailQuery } from './specificationsApi';

function FacetPill({ f }) {
  const label = f.type ? f.type.charAt(0).toUpperCase() + f.type.slice(1) : '?';
  const detail = f.name
    ? f.name
    : f.property_set
    ? `${f.property_set}.${f.base_name ?? ''}`
    : f.system ?? null;
  return (
    <div className="flex items-start gap-2 rounded-md border bg-muted/40 px-3 py-2 text-xs">
      <span className="font-semibold text-foreground min-w-[80px]">{label}</span>
      {detail && <span className="text-muted-foreground truncate">{detail}</span>}
      {f.cardinality && (
        <Badge variant="outline" className="ml-auto text-[10px] px-1 py-0 shrink-0">
          {f.cardinality}
        </Badge>
      )}
    </div>
  );
}

function FacetPanel({ title, icon: Icon, facets, emptyText }) {
  return (
    <section className="space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {title}
        <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0">{facets.length}</Badge>
      </div>
      {facets.length === 0
        ? <p className="text-xs text-muted-foreground italic">{emptyText}</p>
        : facets.map((f, i) => <FacetPill key={i} f={f} />)
      }
    </section>
  );
}

export default function SpecificationModal({ spec: specProp, onClose, onEdit }) {
  const specId = specProp?.id;
  const { data: fullSpec } = useGetSpecificationDetailQuery(specId, { skip: !specId });
  const spec = fullSpec || specProp;

  const applicability = Array.isArray(spec?.applicability_data) ? spec.applicability_data : [];
  const requirements = Array.isArray(spec?.requirements_data) ? spec.requirements_data : [];

  return (
    <Dialog open={!!specProp} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent showCloseButton={false} className="max-w-[60vw] sm:max-w-[95vw] w-[60vw] p-0 gap-0 max-h-[60vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between gap-6 px-6 pt-5 pb-4 border-b">
          <div className="min-w-0 flex-1">
            <DialogTitle className="text-xl leading-tight">{spec?.name}</DialogTitle>
            <DialogDescription className="sr-only">Specification details</DialogDescription>
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              {spec?.ifc_version && <Badge variant="secondary">{spec.ifc_version}</Badge>}
              {spec?.is_public === false && <Badge variant="outline">Private</Badge>}
              <TagList tags={spec?.tags} />
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {onEdit && spec && (
              <Button variant="outline" size="sm" onClick={() => onEdit(spec)}>
                <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
              </Button>
            )}
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </DialogClose>
          </div>
        </div>

        {spec && (
          <div className="flex overflow-hidden" style={{ height: 'calc(95vh - 90px)' }}>
            {/* Left panel — facet summary */}
            <ScrollArea className="w-96 shrink-0 border-r bg-muted/20">
              <div className="p-4 space-y-5">
                <FacetPanel
                  title="Applicability"
                  icon={Filter}
                  facets={applicability}
                  emptyText="No applicability facets"
                />
                <Separator />
                <FacetPanel
                  title="Requirements"
                  icon={CheckSquare}
                  facets={requirements}
                  emptyText="No requirements"
                />
                {spec.owner_username && (
                  <>
                    <Separator />
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">Owner: </span>
                      {spec.owner_username}
                    </div>
                  </>
                )}
              </div>
            </ScrollArea>

            {/* Right panel — full details */}
            <ScrollArea className="flex-1">
              <div className="p-6 space-y-5">
                {spec.identifier && (
                  <div className="text-sm">
                    <span className="font-medium">Identifier: </span>
                    <span className="text-muted-foreground font-mono">{spec.identifier}</span>
                  </div>
                )}

                {spec.description && (
                  <div>
                    <p className="text-sm font-semibold mb-1">Description</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{spec.description}</p>
                  </div>
                )}

                {spec.instructions && (
                  <div>
                    <p className="text-sm font-semibold mb-1">Instructions</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{spec.instructions}</p>
                  </div>
                )}

                {applicability.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-semibold mb-3">Applicability</p>
                      <div className="space-y-2">
                        {applicability.map((f, i) => (
                          <div key={i} className="rounded-md border bg-muted/30 px-3 py-2 text-xs space-y-1">
                            <span className="font-semibold capitalize">{f.type}</span>
                            {Object.entries(f)
                              .filter(([k, v]) => k !== 'type' && k !== 'id' && v !== null && v !== undefined && v !== '')
                              .map(([k, v]) => (
                                <div key={k} className="flex gap-2 text-muted-foreground">
                                  <span className="font-medium text-foreground/70 min-w-[100px]">{k.replace(/_/g, ' ')}:</span>
                                  <span>{String(v)}</span>
                                </div>
                              ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {requirements.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-semibold mb-3">Requirements</p>
                      <div className="space-y-2">
                        {requirements.map((f, i) => (
                          <div key={i} className="rounded-md border bg-muted/30 px-3 py-2 text-xs space-y-1">
                            <span className="font-semibold capitalize">{f.type}</span>
                            {Object.entries(f)
                              .filter(([k, v]) => k !== 'type' && k !== 'id' && v !== null && v !== undefined && v !== '')
                              .map(([k, v]) => (
                                <div key={k} className="flex gap-2 text-muted-foreground">
                                  <span className="font-medium text-foreground/70 min-w-[100px]">{k.replace(/_/g, ' ')}:</span>
                                  <span>{String(v)}</span>
                                </div>
                              ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </ScrollArea>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
