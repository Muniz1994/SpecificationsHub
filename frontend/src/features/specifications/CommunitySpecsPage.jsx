import { useState, useMemo } from 'react';
import SearchBox from '@/components/SearchBox';
import TagFilter from '@/components/TagFilter';
import SpecificationCard from '@/features/specifications/SpecificationCard';
import SpecificationModal from '@/features/specifications/SpecificationModal';
import { useGetSpecificationsQuery } from '@/features/specifications/specificationsApi';
import { useSearchQuery } from '@/features/ids/idsApi';

export default function CommunitySpecsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpec, setSelectedSpec] = useState(null);
  const [selectedTagIds, setSelectedTagIds] = useState([]);

  const tagParams = selectedTagIds.length ? { tags: selectedTagIds.join(',') } : {};
  const { data, isLoading } = useGetSpecificationsQuery(tagParams);
  const { data: searchResults } = useSearchQuery(searchQuery, {
    skip: !searchQuery,
  });

  const rawSpecs = searchQuery
    ? searchResults?.specifications || []
    : data?.results || [];

  const filteredSpecs = useMemo(() => {
    if (!searchQuery || selectedTagIds.length === 0) return rawSpecs;
    return rawSpecs.filter((spec) =>
      spec.tags?.some((t) => selectedTagIds.includes(t.id))
    );
  }, [rawSpecs, searchQuery, selectedTagIds]);

  const specs = useMemo(
    () => [...filteredSpecs].sort((a, b) => (b.endorsement_count ?? 0) - (a.endorsement_count ?? 0)),
    [filteredSpecs],
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Community Specifications</h1>

      <SearchBox onSearch={setSearchQuery} placeholder="Search specifications…" />

      <TagFilter
        selectedTagIds={selectedTagIds}
        onChange={setSelectedTagIds}
        className="mb-4"
      />

      {isLoading && !searchQuery && <p className="text-muted-foreground">Loading…</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {specs.length === 0 && !isLoading && (
          <p className="text-muted-foreground italic">No specifications found.</p>
        )}
        {specs.map((spec) => (
          <SpecificationCard key={spec.id} spec={spec} onClick={setSelectedSpec} />
        ))}
      </div>

      <SpecificationModal spec={selectedSpec} onClose={() => setSelectedSpec(null)} />
    </div>
  );
}
