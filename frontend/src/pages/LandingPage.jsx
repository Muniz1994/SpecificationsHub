import { useNavigate, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '@/features/auth/authSlice';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';

export default function LandingPage() {
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-8 py-4 border-b bg-card">
        <div
          className="text-xl font-bold text-primary cursor-pointer"
          onClick={() => navigate('/')}
        >
          SpecificationsHUB
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button variant="outline" onClick={() => navigate('/login')}>
            Log in
          </Button>
          <Button onClick={() => navigate('/register')}>Register</Button>
        </div>
      </header>

      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Share IDS &amp; Specifications with the Community
        </h1>
        <p className="max-w-2xl text-muted-foreground text-lg leading-relaxed mb-8">
          SpecificationsHUB is a platform to create, edit, upload and share
          Information Delivery Specifications (IDS) and their specifications
          with the wider BIM community. Collaborate on quality-assurance
          checks, structural requirements, energy-performance criteria and
          more.
        </p>
        <Button size="lg" onClick={() => navigate('/register')}>
          Get started
        </Button>
      </section>
    </div>
  );
}
