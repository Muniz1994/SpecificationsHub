import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser, setUser } from '@/features/auth/authSlice';
import { useGetAvatarsQuery, useUpdateMeMutation } from '@/features/auth/authApi';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { BadgeCheck, Pencil, Check } from 'lucide-react';

const API_BASE = 'http://localhost:8000';

export default function UserInfoPage() {
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const { data: avatars = [] } = useGetAvatarsQuery();
  const [updateMe] = useUpdateMeMutation();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!user) return <p className="text-muted-foreground">Loading user info…</p>;

  const handlePickAvatar = async (filename) => {
    setSaving(true);
    try {
      const updated = await updateMe({ avatar: filename }).unwrap();
      dispatch(setUser(updated));
      setOpen(false);
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  const avatarSrc = user.avatar_url ? `${API_BASE}${user.avatar_url}` : null;

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>

      <Card className="mb-8">
        <CardContent className="pt-6 flex items-start gap-6">
          <div className="relative group">
            <Avatar className="h-20 w-20">
              {avatarSrc && <AvatarImage src={avatarSrc} alt="Profile" />}
              <AvatarFallback className="text-2xl font-semibold">
                {user.first_name?.[0] || user.username[0]}
              </AvatarFallback>
            </Avatar>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <Pencil className="h-5 w-5 text-white" />
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Choose an avatar</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-4 gap-3 py-2">
                  {avatars.map((av) => {
                    const isActive = user.avatar === av.filename;
                    return (
                      <button
                        key={av.filename}
                        type="button"
                        disabled={saving}
                        onClick={() => handlePickAvatar(av.filename)}
                        className={`relative rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                          isActive
                            ? 'border-primary ring-2 ring-primary/30'
                            : 'border-transparent hover:border-muted-foreground/40'
                        }`}
                      >
                        <img
                          src={`${API_BASE}${av.url}`}
                          alt={av.filename}
                          className="w-full aspect-square object-cover"
                        />
                        {isActive && (
                          <span className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-0.5">
                            <Check className="h-3 w-3" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-2">
            <div className="text-sm flex items-center gap-1">
              <strong className="text-foreground">Name:</strong>{' '}
              <span className="text-muted-foreground">{user.first_name || '—'}</span>
              {user.is_certified && <BadgeCheck className="h-4 w-4 text-blue-500" />}
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
