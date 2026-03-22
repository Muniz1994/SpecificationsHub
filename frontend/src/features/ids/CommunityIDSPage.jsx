import IDSCard from '@/features/ids/IDSCard';
import { useGetIDSListQuery } from '@/features/ids/idsApi';

export default function CommunityIDSPage() {
  const { data, isLoading } = useGetIDSListQuery();

  const idsList = data?.results || [];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Community IDSs</h1>

      {isLoading && <p className="text-muted-foreground">Loading…</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {idsList.length === 0 && !isLoading && (
          <p className="text-muted-foreground italic">No IDSs available.</p>
        )}
        {idsList.map((ids) => (
          <IDSCard key={ids.id} ids={ids} />
        ))}
      </div>
    </div>
  );
}
