import { useState } from 'react';
import IDSCard from '@/features/ids/IDSCard';
import IDSForm from '@/features/ids/IDSForm';
import { useGetIDSListQuery } from '@/features/ids/idsApi';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function CommunityIDSPage() {
  const { data, isLoading } = useGetIDSListQuery();
  const [showForm, setShowForm] = useState(false);

  const idsList = data?.results || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Community IDSs</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-1" /> New IDS
        </Button>
      </div>

      {isLoading && <p className="text-muted-foreground">Loading…</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {idsList.length === 0 && !isLoading && (
          <p className="text-muted-foreground italic">No IDSs available.</p>
        )}
        {idsList.map((ids) => (
          <IDSCard key={ids.id} ids={ids} />
        ))}
      </div>

      <IDSForm open={showForm} onClose={() => setShowForm(false)} />
    </div>
  );
}
