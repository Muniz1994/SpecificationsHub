import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectCurrentUser } from '@/features/auth/authSlice';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Logo from '@/assets/logoName.svg';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/theme-toggle';
import { FileText, Layers, PenTool, Library, User, LogOut, Pencil } from 'lucide-react';

export default function MainToolbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);

  const communityButtons = [
    { icon: FileText, path: '/specifications', title: 'Community Specifications' },
    { icon: Layers, path: '/ids', title: 'Community IDSs' },
  ];

  const toolButtons = [
    { icon: Library, path: '/library', title: 'User Library' },
    //{ icon: Pencil, path: '/editor', title: 'IDS Editor' },
    
  ];

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 z-50 flex h-screen w-14 flex-col items-center justify-between border-r bg-card py-3">
      <div className="flex flex-col items-center gap-4">
        <img
          src={Logo}
          alt="Logo"
          className="h-8 w-8 cursor-pointer dark:invert-0 invert"
          onClick={() => navigate('/dashboard')}
        />
        <div className="flex flex-col items-center gap-1">
        {communityButtons.map((btn) => (
          <Tooltip key={btn.path}>
            <TooltipTrigger asChild>
              <Button
                variant={location.pathname === btn.path ? 'default' : 'ghost'}
                size="icon"
                onClick={() => navigate(btn.path)}
              >
                <btn.icon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">{btn.title}</TooltipContent>
          </Tooltip>
        ))}
        <Separator className="my-1 w-8" />
        {toolButtons.map((btn) => (
          <Tooltip key={btn.path}>
            <TooltipTrigger asChild>
              <Button
                variant={location.pathname === btn.path ? 'default' : 'ghost'}
                size="icon"
                disabled={btn.path === '/editor'}
                onClick={() => navigate(btn.path)}
              >
                <btn.icon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">{btn.title}</TooltipContent>
          </Tooltip>
        ))}
        </div>
      </div>

      <div className="flex flex-col items-center gap-1">
        <ThemeToggle />
        <Separator className="my-1 w-8" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <User className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="end" className="w-48">
            {user && (
              <>
                <DropdownMenuLabel>
                  {user.first_name} {user.last_name}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem onClick={() => navigate('/profile')}>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
