import { useState } from 'react';
import SearchBox from '@/components/SearchBox';
import IDSCard from '@/features/ids/IDSCard';
import { useGetIDSListQuery, useSearchQuery } from '@/features/ids/idsApi';

export default function CommunityIDSPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading } = useGetIDSListQuery();
  const { data: searchResults } = useSearchQuery(searchQuery, {
    skip: !searchQuery,
  });

  const idsList = searchQuery
    ? searchResults?.ids || []
    : data?.results || [];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Community IDSs</h1>

      <SearchBox
        onSearch={setSearchQuery}
        placeholder="Search IDSs…"
      />

      {isLoading && !searchQuery && <p className="text-muted-foreground">Loading…</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {idsList.length === 0 && !isLoading && (
          <p className="text-muted-foreground italic">No IDSs found.</p>
        )}
        {idsList.map((ids) => (
          <IDSCard key={ids.id} ids={ids} />
        ))}
      </div>
    </div>
  );
}
