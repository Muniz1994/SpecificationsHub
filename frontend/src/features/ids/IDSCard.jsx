/**
 * IDSCard — displays a summary of a single IDS.
 * Clicking the card navigates to the IDS detail page.
 */
import { useNavigate } from 'react-router-dom';
import './IDSCard.css';

export default function IDSCard({ ids }) {
  const navigate = useNavigate();

  return (
    <div className="ids-card" onClick={() => navigate(`/ids/${ids.id}`)}>
      <h3 className="ids-card-title">{ids.title}</h3>
      {ids.version && <span className="ids-card-version">v{ids.version}</span>}
      <p className="ids-card-desc">
        {ids.description
          ? ids.description.length > 100
            ? ids.description.slice(0, 100) + '…'
            : ids.description
          : 'No description'}
      </p>
      <div className="ids-card-footer">
        {ids.owner_username && (
          <span className="ids-card-author">by {ids.owner_username}</span>
        )}
        {ids.specifications_count != null && (
          <span className="ids-card-count">
            {ids.specifications_count} spec{ids.specifications_count !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>
  );
}
