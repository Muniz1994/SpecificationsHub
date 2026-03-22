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
      className="min-w-[400px] max-w-[550px] shrink-0 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5"
      onClick={() => onClick && onClick(spec)}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{spec.name}</CardTitle>
        <Badge variant="secondary" className="w-fit">{spec.ifc_version}</Badge>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
}
