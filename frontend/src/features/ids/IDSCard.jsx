import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TagList } from '@/components/TagPill';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ArrowUp, BadgeCheck } from 'lucide-react';
import {
  useCopyIDSToLibraryMutation,
  useEndorseIDSMutation,
  useUnendorseIDSMutation,
} from '@/features/ids/idsApi';

const BACKEND_BASE = import.meta.env.VITE_API_BASE_URL
  ? ''
  : 'http://localhost:8000';

export default function IDSCard({ ids }) {
  const navigate = useNavigate();
  const [copyIDS, { isLoading: isCopying }] = useCopyIDSToLibraryMutation();
  const [endorseIDS] = useEndorseIDSMutation();
  const [unendorseIDS] = useUnendorseIDSMutation();
  const [copied, setCopied] = useState(false);

  const handleGetIt = async (e) => {
    e.stopPropagation();
    try {
      await copyIDS(ids.id).unwrap();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // silently ignore
    }
  };

  const handleEndorse = async (e) => {
    e.stopPropagation();
    try {
      if (ids.is_endorsed) {
        await unendorseIDS(ids.id).unwrap();
      } else {
        await endorseIDS(ids.id).unwrap();
      }
    } catch {
      // ignore
    }
  };

  return (
    <Card
      className="min-w-[300px] max-w-[1000px] shrink-0 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5"
      onClick={() => navigate(`/ids/${ids.id}`)}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{ids.title}</CardTitle>
        <div className="flex flex-wrap gap-1">
          {ids.version && <Badge variant="secondary">v{ids.version}</Badge>}
          {ids.is_public === false && (
            <Badge variant="outline" className="text-xs">Private</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {ids.description
            ? ids.description.length > 100
              ? ids.description.slice(0, 100) + '…'
              : ids.description
            : 'No description'}
        </p>
        <TagList tags={ids.tags} className="mt-2" />
      </CardContent>
      <CardFooter className="flex justify-between items-center text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          {ids.owner_username && (
            <span className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Avatar className="h-6 w-6 cursor-default">
                    {ids.owner_avatar_url && (
                      <AvatarImage src={`${BACKEND_BASE}${ids.owner_avatar_url}`} alt={ids.owner_username} />
                    )}
                    <AvatarFallback className="text-[10px]">
                      {ids.owner_username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>{ids.owner_username}</TooltipContent>
              </Tooltip>
              {ids.owner_is_certified && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <BadgeCheck className="h-3.5 w-3.5 text-blue-500" />
                  </TooltipTrigger>
                  <TooltipContent>Certified Creator</TooltipContent>
                </Tooltip>
              )}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="gap-1"
            onClick={handleEndorse}
          >
            <ArrowUp className={`h-4 w-4 ${(ids.endorsement_count ?? 0) > 0 ? 'text-green-500' : 'text-muted-foreground'} ${ids.is_endorsed ? 'stroke-[3]' : ''}`} />
            <span className={(ids.endorsement_count ?? 0) > 0 ? 'text-green-500' : 'text-muted-foreground'}>
              {ids.endorsement_count ?? 0}
            </span>
          </Button>
        </div>
        <div className="flex items-center gap-3">
          {ids.specifications_count != null && (
            <span>
              {ids.specifications_count} spec{ids.specifications_count !== 1 ? 's' : ''}
            </span>
          )}
          <Button
            variant={copied ? 'default' : 'outline'}
            size="sm"
            disabled={isCopying}
            onClick={handleGetIt}
          >
            {copied ? 'Added!' : isCopying ? '…' : 'Add to Library'}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
