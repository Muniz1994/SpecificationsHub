/**
 * LibrarySidebar — vertical list of the current user's IDSs.
 * Clicking an IDS triggers the onSelectIDS callback.
 */
import './LibrarySidebar.css';

export default function LibrarySidebar({ idsList, selectedId, onSelectIDS }) {
  return (
    <aside className="library-sidebar">
      <h3 className="library-sidebar-title">My IDSs</h3>
      {(!idsList || idsList.length === 0) && (
        <p className="library-sidebar-empty">No IDSs yet.</p>
      )}
      <ul className="library-sidebar-list">
        {idsList &&
          idsList.map((ids) => (
            <li
              key={ids.id}
              className={`library-sidebar-item ${
                selectedId === ids.id ? 'active' : ''
              }`}
              onClick={() => onSelectIDS(ids.id)}
            >
              {ids.title}
            </li>
          ))}
      </ul>
    </aside>
  );
}
