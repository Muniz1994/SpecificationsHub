/**
 * CommunitySpecsPage (CSP) — full-page view of all community specifications.
 */
import { useState } from 'react';
import SpecificationCard from './SpecificationCard';
import SpecificationModal from './SpecificationModal';
import { useGetSpecificationsQuery } from './specificationsApi';
import './CommunitySpecsPage.css';

export default function CommunitySpecsPage() {
  const { data, isLoading } = useGetSpecificationsQuery();
  const [selectedSpec, setSelectedSpec] = useState(null);

  const specs = data?.results || [];

  return (
    <div className="community-page">
      <h1>Community Specifications</h1>

      {isLoading && <p>Loading…</p>}

      <div className="card-row">
        {specs.length === 0 && !isLoading && (
          <p className="empty">No specifications available.</p>
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
