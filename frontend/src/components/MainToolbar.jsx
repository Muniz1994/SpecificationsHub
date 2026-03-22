/**
 * MainToolbar — vertical left sidebar visible on all authenticated pages.
 *
 * Buttons:
 *   S → Community Specifications (CSP)
 *   I → Community IDSs (CIP)
 *   E → IDS Editor (IE)
 *   L → User Library (UL)
 *   U → Context menu with user info / logout
 */
import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectCurrentUser } from '../features/auth/authSlice';
import './MainToolbar.css';

export default function MainToolbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef(null);

  // Close the user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const buttons = [
    { letter: 'S', path: '/specifications', title: 'Community Specifications' },
    { letter: 'I', path: '/ids', title: 'Community IDSs' },
    { letter: 'E', path: '/editor', title: 'IDS Editor' },
    { letter: 'L', path: '/library', title: 'User Library' },
  ];

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <nav className="main-toolbar">
      <div className="toolbar-buttons">
        {buttons.map((btn) => (
          <button
            key={btn.letter}
            className={`toolbar-btn ${location.pathname === btn.path ? 'active' : ''}`}
            title={btn.title}
            onClick={() => navigate(btn.path)}
          >
            {btn.letter}
          </button>
        ))}
      </div>

      <div className="toolbar-user" ref={menuRef}>
        <button
          className="toolbar-btn user-btn"
          title="User menu"
          onClick={() => setShowUserMenu((prev) => !prev)}
        >
          U
        </button>

        {showUserMenu && (
          <div className="user-menu">
            {user && (
              <p className="user-menu-name">
                {user.first_name} {user.last_name}
              </p>
            )}
            <button onClick={() => { navigate('/profile'); setShowUserMenu(false); }}>
              Profile
            </button>
            <button onClick={handleLogout}>Log out</button>
          </div>
        )}
      </div>
    </nav>
  );
}
