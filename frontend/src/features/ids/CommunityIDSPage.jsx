import { useState, useMemo } from 'react';
import SearchBox from '@/components/SearchBox';
import TagFilter from '@/components/TagFilter';
import IDSCard from '@/features/ids/IDSCard';
import { useGetIDSListQuery, useSearchQuery } from '@/features/ids/idsApi';

export default function CommunityIDSPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState([]);

  const tagParams = selectedTagIds.length ? { tags: selectedTagIds.join(',') } : {};
  const { data, isLoading } = useGetIDSListQuery(tagParams);
  const { data: searchResults } = useSearchQuery(searchQuery, {
    skip: !searchQuery,
  });

  const rawIdsList = searchQuery
    ? searchResults?.ids || []
    : data?.results || [];

  // When filtering by tags on search results, do it client-side
  const filteredList = useMemo(() => {
    if (!searchQuery || selectedTagIds.length === 0) return rawIdsList;
    return rawIdsList.filter((ids) =>
      ids.tags?.some((t) => selectedTagIds.includes(t.id))
    );
  }, [rawIdsList, searchQuery, selectedTagIds]);

  const idsList = useMemo(
    () => [...filteredList].sort((a, b) => (b.endorsement_count ?? 0) - (a.endorsement_count ?? 0)),
    [filteredList],
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Community IDSs</h1>

      <SearchBox onSearch={setSearchQuery} placeholder="Search IDSs…" />

      <TagFilter
        selectedTagIds={selectedTagIds}
        onChange={setSelectedTagIds}
        className="mb-4"
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
