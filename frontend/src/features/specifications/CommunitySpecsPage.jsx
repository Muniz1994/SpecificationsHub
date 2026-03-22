import { useState } from 'react';
import SpecificationCard from '@/features/specifications/SpecificationCard';
import SpecificationModal from '@/features/specifications/SpecificationModal';
import { useGetSpecificationsQuery } from '@/features/specifications/specificationsApi';

export default function CommunitySpecsPage() {
  const { data, isLoading } = useGetSpecificationsQuery();
  const [selectedSpec, setSelectedSpec] = useState(null);

  const specs = data?.results || [];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Community Specifications</h1>

      {isLoading && <p className="text-muted-foreground">Loading…</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {specs.length === 0 && !isLoading && (
          <p className="text-muted-foreground italic">No specifications available.</p>
        )}
        {specs.map((spec) => (
          <SpecificationCard
            key={spec.id}
            spec={spec}
            onClick={setSelectedSpec}
          />
        ))}
      </div>

      <SpecificationModal
        spec={selectedSpec}
        onClose={() => setSelectedSpec(null)}
      />
    </div>
  );
}
