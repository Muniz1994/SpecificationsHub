/**
 * DashboardPage (MPL) — the logged-in main page.
 *
 * Layout:
 *   - Search box at top
 *   - Specifications section: horizontal row of spec cards
 *   - IDSs section: horizontal row of IDS cards
 */
import { useState } from 'react';
import SearchBox from '../components/SearchBox';
import SpecificationCard from '../features/specifications/SpecificationCard';
import SpecificationModal from '../features/specifications/SpecificationModal';
import IDSCard from '../features/ids/IDSCard';
import { useGetSpecificationsQuery } from '../features/specifications/specificationsApi';
import { useGetIDSListQuery, useSearchQuery } from '../features/ids/idsApi';
import './DashboardPage.css';

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpec, setSelectedSpec] = useState(null);

  // Default data (no search)
  const { data: specsData } = useGetSpecificationsQuery();
  const { data: idsData } = useGetIDSListQuery();

  // Search results (only when there's a query)
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
    <div className="dashboard">
      <SearchBox
        onSearch={setSearchQuery}
        placeholder="Search specifications and IDSs…"
      />

      {/* Specifications section */}
      <section className="dashboard-section">
        <h2>Specifications</h2>
        <div className="card-row">
          {specs.length === 0 && <p className="empty">No specifications found.</p>}
          {specs.map((spec) => (
            <SpecificationCard
              key={spec.id}
              spec={spec}
              onClick={setSelectedSpec}
            />
          ))}
        </div>
      </section>

      {/* IDSs section */}
      <section className="dashboard-section">
        <h2>IDSs</h2>
        <div className="card-row">
          {idsList.length === 0 && <p className="empty">No IDSs found.</p>}
          {idsList.map((ids) => (
            <IDSCard key={ids.id} ids={ids} />
          ))}
        </div>
      </section>

      {/* Specification detail modal */}
      <SpecificationModal
        spec={selectedSpec}
        onClose={() => setSelectedSpec(null)}
      />
    </div>
  );
}
