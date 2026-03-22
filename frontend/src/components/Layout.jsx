/**
 * Layout — wraps all authenticated pages.
 *
 * Renders the MainToolbar on the left and the matched child route
 * (via <Outlet />) on the right.
 */
import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import MainToolbar from './MainToolbar';
import { useGetMeQuery } from '../features/auth/authApi';
import { setUser, selectIsAuthenticated } from '../features/auth/authSlice';
import './Layout.css';

export default function Layout() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const { data: user } = useGetMeQuery(undefined, { skip: !isAuthenticated });

  useEffect(() => {
    if (user) {
      dispatch(setUser(user));
    }
  }, [user, dispatch]);

  return (
    <div className="layout">
      <MainToolbar />
      <main className="layout-content">
        <Outlet />
      </main>
    </div>
  );
}
