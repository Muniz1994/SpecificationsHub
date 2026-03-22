import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function SpecificationCard({ spec, onClick }) {
  return (
    <Card
      className="min-w-[240px] max-w-[280px] shrink-0 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5"
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
      <CardContent>
        <p className="text-sm text-muted-foreground mb-2">
          {spec.description
            ? spec.description.length > 100
              ? spec.description.slice(0, 100) + '…'
              : spec.description
            : 'No description'}
        </p>
        {spec.tags && spec.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {spec.tags.map((tag) => (
              <Badge key={tag.id} variant="outline" className="text-xs">
                {tag.name}
              </Badge>
            ))}
          </div>
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
