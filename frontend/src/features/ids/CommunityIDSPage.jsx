/**
 * CommunityIDSPage (CIP) — full-page view of all community IDSs.
 * Clicking an IDS card navigates to the IDS detail page.
 */
import IDSCard from './IDSCard';
import { useGetIDSListQuery } from './idsApi';
import './CommunityIDSPage.css';

export default function CommunityIDSPage() {
  const { data, isLoading } = useGetIDSListQuery();

  const idsList = data?.results || [];

  return (
    <div className="community-page">
      <h1>Community IDSs</h1>

      {isLoading && <p>Loading…</p>}

      <div className="card-row">
        {idsList.length === 0 && !isLoading && (
          <p className="empty">No IDSs available.</p>
        )}
        {idsList.map((ids) => (
          <IDSCard key={ids.id} ids={ids} />
        ))}
      </div>
    </div>
  );
}
