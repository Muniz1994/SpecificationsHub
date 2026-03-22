import { useState } from 'react';
import SearchBox from '@/components/SearchBox';
import SpecificationCard from '@/features/specifications/SpecificationCard';
import SpecificationModal from '@/features/specifications/SpecificationModal';
import IDSCard from '@/features/ids/IDSCard';
import { useGetSpecificationsQuery } from '@/features/specifications/specificationsApi';
import { useGetIDSListQuery, useSearchQuery } from '@/features/ids/idsApi';
import { Separator } from '@/components/ui/separator';

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpec, setSelectedSpec] = useState(null);

  const { data: specsData } = useGetSpecificationsQuery();
  const { data: idsData } = useGetIDSListQuery();
  const { data: searchResults } = useSearchQuery(searchQuery, {
    skip: !searchQuery,
  });

  const specs = searchQuery
    ? searchResults?.specifications || []
    : specsData?.results || [];
  const idsList = searchQuery
    ? searchResults?.ids || []
    : idsData?.results || [];

  return (
    <div>
      <SearchBox
        onSearch={setSearchQuery}
        placeholder="Search specifications and IDSs…"
      />

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Specifications</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {specs.length === 0 && (
            <p className="text-muted-foreground italic">No specifications found.</p>
          )}
          {specs.map((spec) => (
            <SpecificationCard
              key={spec.id}
              spec={spec}
              onClick={setSelectedSpec}
            />
          ))}
        </div>
      </section>

      <Separator className="my-6" />

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">IDSs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {idsList.length === 0 && (
            <p className="text-muted-foreground italic">No IDSs found.</p>
          )}
          {idsList.map((ids) => (
            <IDSCard key={ids.id} ids={ids} />
          ))}
        </div>
      </section>

      <SpecificationModal
        spec={selectedSpec}
        onClose={() => setSelectedSpec(null)}
      />
    </div>
  );
}
