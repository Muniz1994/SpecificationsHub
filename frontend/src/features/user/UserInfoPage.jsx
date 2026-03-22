/**
 * UserInfoPage (UI) — displays the current user's profile information.
 *
 * Shows: name, surname, email, profile picture.
 * Below: counts of IDSs and specifications created.
 */
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../auth/authSlice';
import './UserInfoPage.css';

export default function UserInfoPage() {
  const user = useSelector(selectCurrentUser);

  if (!user) return <p>Loading user info…</p>;

  return (
    <div className="user-info-page">
      <h1>My Profile</h1>

      <div className="user-info-card">
        <div className="user-info-avatar">
          {user.profile_picture ? (
            <img src={user.profile_picture} alt="Profile" />
          ) : (
            <div className="user-info-avatar-placeholder">
              {user.first_name?.[0] || user.username[0]}
            </div>
          )}
        </div>

        <div className="user-info-details">
          <div className="user-info-field">
            <strong>Name:</strong> {user.first_name || '—'}
          </div>
          <div className="user-info-field">
            <strong>Surname:</strong> {user.last_name || '—'}
          </div>
          <div className="user-info-field">
            <strong>Email:</strong> {user.email || '—'}
          </div>
        </div>
      </div>

      <div className="user-info-stats">
        <div className="stat-card">
          <span className="stat-number">{user.ids_count ?? 0}</span>
          <span className="stat-label">IDSs Created</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{user.specifications_count ?? 0}</span>
          <span className="stat-label">Specifications Created</span>
        </div>
      </div>
    </div>
  );
}
