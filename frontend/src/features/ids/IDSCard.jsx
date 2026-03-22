import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function IDSCard({ ids }) {
  const navigate = useNavigate();

  return (
    <Card
      className="min-w-[260px] max-w-[300px] shrink-0 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5"
      onClick={() => navigate(`/ids/${ids.id}`)}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{ids.title}</CardTitle>
        {ids.version && <Badge variant="secondary" className="w-fit">v{ids.version}</Badge>}
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {ids.description
            ? ids.description.length > 100
              ? ids.description.slice(0, 100) + '…'
              : ids.description
            : 'No description'}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between text-xs text-muted-foreground">
        {ids.owner_username && <span>by {ids.owner_username}</span>}
        {ids.specifications_count != null && (
          <span>
            {ids.specifications_count} spec{ids.specifications_count !== 1 ? 's' : ''}
          </span>
        )}
      </CardFooter>
    </Card>
  );
}
