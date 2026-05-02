import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Copy, MousePointer, Users, ExternalLink } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { usePostHog } from '@posthog/react';

const SOURCES = [
  { value: 'youtube', label: 'YouTube', icon: '📺' },
  { value: 'instagram', label: 'Instagram', icon: '📸' },
  { value: 'facebook', label: 'Facebook', icon: '👥' },
  { value: 'twitter', label: 'Twitter', icon: '🐦' },
  { value: 'custom', label: 'Custom', icon: '🔗' },
];

const TrackingLinks = () => {
  const posthog=usePostHog()
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ source: '', name: '' });
  const [creating, setCreating] = useState(false);

  const totalClicks = links.reduce((sum, l) => sum + l.clicks, 0);
  const uniqueClicks = links.reduce((sum, l) => sum + l.uniqueClicks, 0);

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const response = await api.get('/tracking-links');
      if (response.data.success) {
        setLinks(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching links:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.source) {
      toast.error('Please select a source');
      return;
    }

    setCreating(true);
    try {
      const response = await api.post('/tracking-links', formData);
      if (response.data.success) {
        setLinks([response.data.data, ...links]);
        setFormData({ source: '', name: '' });
        setShowForm(false);
        toast.success('Link created successfully');
        posthog.capture("trackinglink_created")
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create link');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await api.delete(`/tracking-links/${id}`);
      if (response.data.success) {
        setLinks(links.filter(l => l._id !== id));
        toast.success('Link deleted');
      }
    } catch (error) {
      toast.error('Failed to delete link');
    }
  };

  const copyLink = (url) => {
    navigator.clipboard.writeText(url);
    toast.success('Copied to clipboard');
  };

  const getSourceInfo = (source) => SOURCES.find(s => s.value === source);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Attribution Links</h1>
          <p className="text-sm text-muted-foreground">Track which platforms drive traffic to your page</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Link
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <MousePointer className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{totalClicks}</p>
                <p className="text-xs text-muted-foreground">Total Clicks</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{uniqueClicks}</p>
                <p className="text-xs text-muted-foreground">Unique Visitors</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <ExternalLink className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{links.length}</p>
                <p className="text-xs text-muted-foreground">Active Links</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Create New Attribution Link</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Platform</Label>
                  <Select
                    value={formData.source}
                    onValueChange={(value) => setFormData({ ...formData, source: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {SOURCES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.icon} {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Label (optional)</Label>
                  <Input
                    placeholder="e.g., YouTube Bio Link"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={creating} size="sm">
                  {creating ? 'Creating...' : 'Create Link'}
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Links List */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : links.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ExternalLink className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-medium mb-2">No attribution links yet</h3>
            <p className="text-sm text-muted-foreground">Create your first link to start tracking traffic</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {links.map((link) => {
            const source = getSourceInfo(link.source);
            return (
              <Card key={link._id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center text-lg flex-shrink-0">
                        {source?.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{link.name || source?.label}</p>
                        <p className="text-sm text-muted-foreground truncate max-w-[200px] font-mono">
                          {link.trackingUrl}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="text-right">
                        <p className="font-bold">{link.uniqueClicks || 0}</p>
                        <p className="text-xs text-muted-foreground">unique</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{link.clicks || 0}</p>
                        <p className="text-xs text-muted-foreground">clicks</p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => copyLink(link.trackingUrl)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(link._id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TrackingLinks;