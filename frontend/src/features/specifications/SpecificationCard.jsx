/**
 * SpecificationCard — displays a summary of a single specification.
 * Clicking the card opens a modal with more details.
 */
import './SpecificationCard.css';

export default function SpecificationCard({ spec, onClick }) {
  return (
    <div className="spec-card" onClick={() => onClick && onClick(spec)}>
      <h3 className="spec-card-title">{spec.name}</h3>
      <span className="spec-card-version">{spec.ifc_version}</span>
      <p className="spec-card-desc">
        {spec.description
          ? spec.description.length > 100
            ? spec.description.slice(0, 100) + '…'
            : spec.description
          : 'No description'}
      </p>
      {spec.owner_username && (
        <p className="spec-card-author">by {spec.owner_username}</p>
      )}
    </div>
  );
}
