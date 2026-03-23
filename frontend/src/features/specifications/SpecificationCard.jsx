import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useCopySpecificationToLibraryMutation } from '@/features/specifications/specificationsApi';

export default function SpecificationCard({ spec, onClick, hideAddButton = false }) {
  const [copySpec, { isLoading: isCopying }] = useCopySpecificationToLibraryMutation();
  const [copied, setCopied] = useState(false);

  const handleGetIt = async (e) => {
    e.stopPropagation();
    try {
      await copySpec(spec.id).unwrap();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // silently ignore (e.g. already owned)
    }
  };
  return (
    <Card
      className="min-w-[300px] max-w-[1000px] shrink-0 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5"
      onClick={() => onClick && onClick(spec)}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{spec.name}</CardTitle>
        <div className="flex flex-wrap gap-1">
          <Badge variant="secondary">{spec.ifc_version}</Badge>
          {spec.is_public === false && (
            <Badge variant="outline" className="text-xs">Private</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-2">
            {spec.description
              ? spec.description.length > 100
                ? spec.description.slice(0, 100) + '…'
                : spec.description
              : 'No description'}
          </p>
          {spec.owner_username && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Avatar size="md" className="cursor-default">
                  <AvatarFallback>
                    {spec.owner_username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>{spec.owner_username}</TooltipContent>
            </Tooltip>
          )}
        </div>
        {!hideAddButton && (
          <Button
            variant={copied ? 'default' : 'outline'}
            size="sm"
            disabled={isCopying}
            onClick={handleGetIt}
          >
            {copied ? 'Added!' : isCopying ? '…' : 'Add to Library'}
          </Button>
        )}
      </CardContent>
      {spec.owner_username && (
        <CardFooter className="text-xs text-muted-foreground pt-0">
          by {spec.owner_username}
        </CardFooter>
      )}
    </Card>
  );
}
