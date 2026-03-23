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
import { useCopyIDSToLibraryMutation } from '@/features/ids/idsApi';

export default function IDSCard({ ids }) {
  const navigate = useNavigate();
  const [copyIDS, { isLoading: isCopying }] = useCopyIDSToLibraryMutation();
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
        <div>
          {ids.owner_username && <span>by {ids.owner_username}</span>}
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
