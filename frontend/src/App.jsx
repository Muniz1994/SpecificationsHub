import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Layout from '@/components/Layout';
import ProtectedRoute from '@/features/auth/ProtectedRoute';

import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/features/auth/LoginPage';
import RegisterPage from '@/features/auth/RegisterPage';

import DashboardPage from '@/pages/DashboardPage';
import CommunitySpecsPage from '@/features/specifications/CommunitySpecsPage';
import CommunityIDSPage from '@/features/ids/CommunityIDSPage';
import IDSPage from '@/features/ids/IDSPage';
import IDSEditorPage from '@/features/ids/IDSEditorPage';
import UserLibraryPage from '@/features/library/UserLibraryPage';
import UserInfoPage from '@/features/user/UserInfoPage';
import GeneratePage from '@/features/generate/GeneratePage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/specifications" element={<CommunitySpecsPage />} />
            <Route path="/ids" element={<CommunityIDSPage />} />
            <Route path="/ids/:id" element={<IDSPage />} />
            <Route path="/editor" element={<IDSEditorPage />} />
            <Route path="/library" element={<UserLibraryPage />} />
            <Route path="/profile" element={<UserInfoPage />} />
            <Route path="/generate" element={<GeneratePage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
