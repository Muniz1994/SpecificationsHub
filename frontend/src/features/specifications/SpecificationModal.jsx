/**
 * SpecificationModal — shows full detail of a specification in an overlay.
 */
import './SpecificationModal.css';

export default function SpecificationModal({ spec, onClose }) {
  if (!spec) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>

        <h2>{spec.name}</h2>

        <div className="modal-field">
          <strong>IFC Version:</strong> {spec.ifc_version}
        </div>

        {spec.identifier && (
          <div className="modal-field">
            <strong>Identifier:</strong> {spec.identifier}
          </div>
        )}

        {spec.description && (
          <div className="modal-field">
            <strong>Description:</strong>
            <p>{spec.description}</p>
          </div>
        )}

        {spec.instructions && (
          <div className="modal-field">
            <strong>Instructions:</strong>
            <p>{spec.instructions}</p>
          </div>
        )}

        {spec.applicability_data &&
          Object.keys(spec.applicability_data).length > 0 && (
            <div className="modal-field">
              <strong>Applicability:</strong>
              <pre className="modal-json">
                {JSON.stringify(spec.applicability_data, null, 2)}
              </pre>
            </div>
          )}

        {spec.requirements_data &&
          Object.keys(spec.requirements_data).length > 0 && (
            <div className="modal-field">
              <strong>Requirements:</strong>
              <pre className="modal-json">
                {JSON.stringify(spec.requirements_data, null, 2)}
              </pre>
            </div>
          )}

        {spec.owner_username && (
          <div className="modal-field">
            <strong>Owner:</strong> {spec.owner_username}
          </div>
        )}
      </div>
    </div>
  );
}
