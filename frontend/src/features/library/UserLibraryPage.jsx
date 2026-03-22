/**
 * UserLibraryPage (UL) — the user's personal library.
 *
 * Left sidebar lists the user's IDSs. Clicking one shows the IDS
 * detail (reuses IDSPage-style layout) on the right.
 */
import { useState } from 'react';
import LibrarySidebar from './LibrarySidebar';
import { useGetMyIDSQuery } from '../ids/idsApi';
import { useGetIDSDetailQuery } from '../ids/idsApi';
import SpecificationCard from '../specifications/SpecificationCard';
import SpecificationModal from '../specifications/SpecificationModal';
import './UserLibraryPage.css';

function IDSDetail({ idsId }) {
  const { data: ids, isLoading } = useGetIDSDetailQuery(idsId, {
    skip: !idsId,
  });
  const [selectedSpec, setSelectedSpec] = useState(null);

  if (!idsId) return <p className="library-hint">Select an IDS from the sidebar.</p>;
  if (isLoading) return <p>Loading…</p>;
  if (!ids) return null;

  return (
    <div className="library-detail">
      <header className="ids-page-header">
        <h1>{ids.title}</h1>
        {ids.version && <span className="ids-page-version">v{ids.version}</span>}
      </header>

      <div className="ids-page-info">
        {ids.description && <p>{ids.description}</p>}
        <div className="ids-page-meta">
          {ids.author_email && <span><strong>Author:</strong> {ids.author_email}</span>}
          {ids.date && <span><strong>Date:</strong> {ids.date}</span>}
          {ids.purpose && <span><strong>Purpose:</strong> {ids.purpose}</span>}
          {ids.milestone && <span><strong>Milestone:</strong> {ids.milestone}</span>}
        </div>
      </div>

      <section className="ids-page-specs">
        <h2>Specifications ({ids.specifications?.length || 0})</h2>
        <div className="card-row">
          {ids.specifications && ids.specifications.length > 0 ? (
            ids.specifications.map((spec) => (
              <SpecificationCard key={spec.id} spec={spec} onClick={setSelectedSpec} />
            ))
          ) : (
            <p className="empty">No specifications.</p>
          )}
        </div>
      </section>

      <SpecificationModal spec={selectedSpec} onClose={() => setSelectedSpec(null)} />
    </div>
  );
}

export default function UserLibraryPage() {
  const { data } = useGetMyIDSQuery();
  const [selectedIdsId, setSelectedIdsId] = useState(null);

  const idsList = data?.results || data || [];

  return (
    <div className="library-page">
      <LibrarySidebar
        idsList={idsList}
        selectedId={selectedIdsId}
        onSelectIDS={setSelectedIdsId}
      />
      <div className="library-content">
        <IDSDetail idsId={selectedIdsId} />
      </div>
    </div>
  );
}
