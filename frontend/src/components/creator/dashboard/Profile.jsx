import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ExternalLink, Globe, LinkIcon } from 'lucide-react';

/* ─── tiny helpers ─────────────────────────────────────────── */
const getInitials = (name = '') =>
  name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

const getSocialIcon = (url = '') => {
  if (url.includes('twitter.com') || url.includes('x.com')) return '𝕏';
  if (url.includes('instagram.com')) return '◈';
  if (url.includes('youtube.com')) return '▶';
  if (url.includes('github.com')) return '⌥';
  if (url.includes('linkedin.com')) return 'in';
  return '↗';
};

const getSocialLabel = (url = '') => {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
};

/* ─── skeleton loader ──────────────────────────────────────── */
function ProfileSkeleton() {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-0">
      <Skeleton className="w-full h-48 rounded-t-2xl" />
      <div className="px-6 pb-6 space-y-4 border border-t-0 rounded-b-2xl">
        <div className="flex items-end gap-4 -mt-10">
          <Skeleton className="w-20 h-20 rounded-full ring-4 ring-background shrink-0" />
          <div className="space-y-2 pb-1 flex-1">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Separator />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/* ─── main component ───────────────────────────────────────── */
export default function CreatorProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('creators/profile/me');
        if (res.data.success) {
          setProfile(res.data.data.profile);
        } else {
          setError('Could not load profile.');
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <ProfileSkeleton />;

  if (error) {
    return (
      <Card className="w-full max-w-2xl mx-auto border-destructive/40 bg-destructive/5">
        <CardContent className="py-10 text-center">
          <p className="text-sm text-destructive font-medium">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!profile) return null;

  const {
    pageName,
    pageUrl,
    bio,
    aboutPage,
    profileImageUrl,
    bannerUrl,
    socialLinks = [],
  } = profile;

  return (
    <div
      className="w-full max-w-2xl mx-auto rounded-2xl overflow-hidden border bg-card shadow-sm"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ── Banner ── */}
      <div className="relative w-full h-48 bg-muted overflow-hidden">
        {bannerUrl ? (
          <img
            src={bannerUrl}
            alt="Banner"
            className="w-full h-full object-cover"
          />
        ) : (
          /* subtle mesh gradient fallback */
          <div
            className="w-full h-full"
            style={{
              background:
                'radial-gradient(ellipse at 20% 50%, hsl(var(--primary)/0.18) 0%, transparent 60%),' +
                'radial-gradient(ellipse at 80% 20%, hsl(var(--primary)/0.12) 0%, transparent 55%),' +
                'hsl(var(--muted))',
            }}
          />
        )}
      </div>

      {/* ── Body ── */}
      <div className="px-6 pb-8">
        {/* Avatar row */}
        <div className="flex items-end justify-between -mt-10 mb-4">
          <Avatar className="w-20 h-20 ring-4 ring-background shadow-md text-lg font-bold">
            <AvatarImage src={profileImageUrl} alt={pageName} />
            <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
              {getInitials(pageName)}
            </AvatarFallback>
          </Avatar>

          {/* Page URL badge */}
          {pageUrl && (
            <Badge
              variant="secondary"
              className="mb-1 gap-1 text-xs font-mono tracking-tight"
            >
              <Globe className="w-3 h-3" />
              {pageUrl}
            </Badge>
          )}
        </div>

        {/* Name + bio */}
        <div className="space-y-1 mb-4">
          <h2 className="text-xl font-semibold tracking-tight leading-none">
            {pageName}
          </h2>
          {bio && (
            <p className="text-sm text-muted-foreground leading-relaxed">{bio}</p>
          )}
        </div>

        {/* About */}
        {aboutPage && (
          <>
            <Separator className="my-4" />
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                About
              </p>
              <p className="text-sm text-foreground/80 leading-relaxed">
                {aboutPage}
              </p>
            </div>
          </>
        )}

        {/* Social links */}
        {socialLinks.length > 0 && (
          <>
            <Separator className="my-4" />
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                <LinkIcon className="w-3 h-3" /> Links
              </p>
              <div className="flex flex-wrap gap-2">
                {socialLinks.map((url, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium
                               bg-background hover:bg-accent hover:text-accent-foreground
                               transition-colors duration-150"
                  >
                    <span className="text-primary font-bold">
                      {getSocialIcon(url)}
                    </span>
                    {getSocialLabel(url)}
                    <ExternalLink className="w-3 h-3 text-muted-foreground" />
                  </a>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}