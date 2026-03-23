import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

export default function UserInfoPage() {
  const user = useSelector(selectCurrentUser);

  if (!user) return <p className="text-muted-foreground">Loading user info…</p>;

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>

      <Card className="mb-8">
        <CardContent className="pt-6 flex items-start gap-6">
          <Avatar className="h-20 w-20">
            {user.profile_picture && (
              <AvatarImage src={user.profile_picture} alt="Profile" />
            )}
            <AvatarFallback className="text-2xl font-semibold">
              {user.first_name?.[0] || user.username[0]}
            </AvatarFallback>
          </Avatar>

          <div className="space-y-2">
            <div className="text-sm">
              <strong className="text-foreground">Name:</strong>{' '}
              <span className="text-muted-foreground">{user.first_name || '—'}</span>
            </div>
            <div className="text-sm">
              <strong className="text-foreground">Surname:</strong>{' '}
              <span className="text-muted-foreground">{user.last_name || '—'}</span>
            </div>
            <div className="text-sm">
              <strong className="text-foreground">Email:</strong>{' '}
              <span className="text-muted-foreground">{user.email || '—'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator className="my-6" />

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <span className="block text-3xl font-bold text-primary">
              {user.ids_count ?? 0}
            </span>
            <span className="text-sm text-muted-foreground mt-1">IDSs Created</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <span className="block text-3xl font-bold text-primary">
              {user.specifications_count ?? 0}
            </span>
            <span className="text-sm text-muted-foreground mt-1">Specifications Created</span>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
