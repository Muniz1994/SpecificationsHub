/**
 * LandingPage (MPU) — the unlogged main page.
 *
 * Top bar: logo left, Login + Register buttons right.
 * Center: project description.
 */
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../features/auth/authSlice';
import { Navigate } from 'react-router-dom';
import './LandingPage.css';

export default function LandingPage() {
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // If already logged in, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="landing">
      <header className="landing-header">
        <div className="landing-logo" onClick={() => navigate('/')}>
          SpecificationsHUB
        </div>
        <div className="landing-actions">
          <button className="btn btn-outline" onClick={() => navigate('/login')}>
            Log in
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/register')}>
            Register
          </button>
        </div>
      </header>

      <section className="landing-hero">
        <h1>Share IDS &amp; Specifications with the Community</h1>
        <p className="landing-subtitle">
          SpecificationsHUB is a platform to create, edit, upload and share
          Information Delivery Specifications (IDS) and their specifications
          with the wider BIM community. Collaborate on quality-assurance
          checks, structural requirements, energy-performance criteria and
          more.
        </p>
        <div className="landing-cta">
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/register')}>
            Get started
          </button>
        </div>
      </section>
    </div>
  );
}
