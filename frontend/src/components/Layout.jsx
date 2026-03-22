import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import MainToolbar from '@/components/MainToolbar';
import { useGetMeQuery } from '@/features/auth/authApi';
import { setUser, selectIsAuthenticated } from '@/features/auth/authSlice';

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
    <div className="flex min-h-screen">
      <MainToolbar />
      <main className="ml-14 flex-1 p-6 overflow-x-hidden">
        <div className="mx-auto w-full max-w-5xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
