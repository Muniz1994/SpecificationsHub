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
import { TagList } from '@/components/TagPill';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ArrowUp } from 'lucide-react';
import {
  useCopySpecificationToLibraryMutation,
  useEndorseSpecificationMutation,
  useUnendorseSpecificationMutation,
} from '@/features/specifications/specificationsApi';

const AVATAR_COLORS = [
  '#6b8e8e', // muted teal
  '#8e6b6b', // muted rose
  '#6b7a8e', // muted steel blue
  '#8e856b', // muted sand
  '#7a6b8e', // muted lavender
  '#6b8e76', // muted sage
  '#8e7a6b', // muted terracotta
  '#6b848e', // muted slate
  '#8e6b82', // muted mauve
  '#768e6b', // muted olive
];

function getAvatarColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function SpecificationCard({ spec, onClick, hideAddButton = false }) {
  const [copySpec, { isLoading: isCopying }] = useCopySpecificationToLibraryMutation();
  const [endorse] = useEndorseSpecificationMutation();
  const [unendorse] = useUnendorseSpecificationMutation();
  const [copied, setCopied] = useState(false);

  const handleGetIt = async (e) => {
    e.stopPropagation();
    try {
      await copySpec({ id: spec.id }).unwrap();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // silently ignore (e.g. already owned)
    }
  };

  const handleEndorse = async (e) => {
    e.stopPropagation();
    try {
      if (spec.is_endorsed) {
        await unendorse(spec.id).unwrap();
      } else {
        await endorse(spec.id).unwrap();
      }
    } catch {
      // ignore
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
          <TagList tags={spec.tags} />
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
        <CardFooter className="text-xs text-muted-foreground pt-0 flex justify-between items-center">
          {spec.owner_username && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Avatar size="md" className="cursor-default" style={{ backgroundColor: getAvatarColor(spec.owner_username) }}>
                  <AvatarFallback style={{ backgroundColor: getAvatarColor(spec.owner_username), color: '#fff' }}>
                    {spec.owner_username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>{spec.owner_username}</TooltipContent>
            </Tooltip>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="gap-1"
            onClick={handleEndorse}
          >
            <ArrowUp className={`h-4 w-4 ${(spec.endorsement_count ?? 0) > 0 ? 'text-green-500' : 'text-muted-foreground'} ${spec.is_endorsed ? 'stroke-[3]' : ''}`} />
            <span className={(spec.endorsement_count ?? 0) > 0 ? 'text-green-500' : 'text-muted-foreground'}>
              {spec.endorsement_count ?? 0}
            </span>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
