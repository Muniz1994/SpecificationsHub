import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function SpecificationCard({ spec, onClick }) {
  return (
    <Card
      className="min-w-[300px] max-w-[1000px] shrink-0 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5"
      onClick={() => onClick && onClick(spec)}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{spec.name}</CardTitle>
        <Badge variant="secondary" className="w-fit">{spec.ifc_version}</Badge>
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
            <p className="text-xs text-muted-foreground">by {spec.owner_username}</p>
          )}
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            alert('Specification added to your library');
          }}
        >
          Get it!
        </Button>
      </CardContent>
    </Card>
  );
}
