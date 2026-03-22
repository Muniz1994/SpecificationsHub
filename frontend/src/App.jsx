/**
 * App — top-level router configuration.
 *
 * Public routes (no toolbar):
 *   /         → LandingPage (MPU)
 *   /login    → LoginPage (LP)
 *   /register → RegisterPage (CAP)
 *
 * Authenticated routes (wrapped in Layout with MainToolbar):
 *   /dashboard       → DashboardPage (MPL)
 *   /specifications  → CommunitySpecsPage (CSP)
 *   /ids             → CommunityIDSPage (CIP)
 *   /ids/:id         → IDSPage (IP)
 *   /editor          → IDSEditorPage (IE)
 *   /library         → UserLibraryPage (UL)
 *   /profile         → UserInfoPage (UI)
 */
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Layout & protected-route wrapper
import Layout from './components/Layout';
import ProtectedRoute from './features/auth/ProtectedRoute';

// Public pages
import LandingPage from './pages/LandingPage';
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';

// Authenticated pages
import DashboardPage from './pages/DashboardPage';
import CommunitySpecsPage from './features/specifications/CommunitySpecsPage';
import CommunityIDSPage from './features/ids/CommunityIDSPage';
import IDSPage from './features/ids/IDSPage';
import IDSEditorPage from './features/ids/IDSEditorPage';
import UserLibraryPage from './features/library/UserLibraryPage';
import UserInfoPage from './features/user/UserInfoPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ---- Public routes (no toolbar) ---- */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* ---- Authenticated routes (with toolbar) ---- */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/specifications" element={<CommunitySpecsPage />} />
            <Route path="/ids" element={<CommunityIDSPage />} />
            <Route path="/ids/:id" element={<IDSPage />} />
            <Route path="/editor" element={<IDSEditorPage />} />
            <Route path="/library" element={<UserLibraryPage />} />
            <Route path="/profile" element={<UserInfoPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
