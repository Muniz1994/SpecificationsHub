/**
 * IDSPage (IP) — detail view for a single IDS.
 *
 * Shows general IDS information at the top, then a grid of
 * specification cards below. Clicking a spec card opens the
 * SpecificationModal.
 */
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGetIDSDetailQuery } from './idsApi';
import SpecificationCard from '../specifications/SpecificationCard';
import SpecificationModal from '../specifications/SpecificationModal';
import './IDSPage.css';

export default function IDSPage() {
  const { id } = useParams();
  const { data: ids, isLoading, error } = useGetIDSDetailQuery(id);
  const [selectedSpec, setSelectedSpec] = useState(null);

  if (isLoading) return <p className="loading">Loading…</p>;
  if (error) return <p className="error-msg">Failed to load IDS.</p>;
  if (!ids) return null;

  return (
    <div className="ids-page">
      <header className="ids-page-header">
        <h1>{ids.title}</h1>
        {ids.version && <span className="ids-page-version">v{ids.version}</span>}
      </header>

      <div className="ids-page-info">
        {ids.description && <p>{ids.description}</p>}

        <div className="ids-page-meta">
          {ids.author_email && (
            <span><strong>Author:</strong> {ids.author_email}</span>
          )}
          {ids.date && (
            <span><strong>Date:</strong> {ids.date}</span>
          )}
          {ids.purpose && (
            <span><strong>Purpose:</strong> {ids.purpose}</span>
          )}
          {ids.milestone && (
            <span><strong>Milestone:</strong> {ids.milestone}</span>
          )}
          {ids.copyright_text && (
            <span><strong>Copyright:</strong> {ids.copyright_text}</span>
          )}
        </div>
      </div>

      <section className="ids-page-specs">
        <h2>Specifications ({ids.specifications?.length || 0})</h2>
        <div className="card-row">
          {ids.specifications && ids.specifications.length > 0 ? (
            ids.specifications.map((spec) => (
              <SpecificationCard
                key={spec.id}
                spec={spec}
                onClick={setSelectedSpec}
              />
            ))
          ) : (
            <p className="empty">No specifications in this IDS.</p>
          )}
        </div>
      </section>

      <SpecificationModal
        spec={selectedSpec}
        onClose={() => setSelectedSpec(null)}
      />
    </div>
  );
}
