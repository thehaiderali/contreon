import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import CreatorProfile from './Profile';
import { SquarePen, Link2, BarChart3, Users, Eye } from 'lucide-react';
import { Link } from 'react-router';
import { api } from '@/lib/api';

const CreatorHome = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/insights');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-2">
        <Link to="tracking-links">
          <Button variant="outline" className="w-full h-16 flex flex-col gap-1">
            <Link2 className="h-4 w-4" />
            <span className="text-xs">Attribution</span>
          </Button>
        </Link>
        <Link to="profile/edit">
          <Button variant="outline" className="w-full h-16 flex flex-col gap-1">
            <SquarePen className="h-4 w-4" />
            <span className="text-xs">Edit Profile</span>
          </Button>
        </Link>
        <Link to="insights">
          <Button variant="outline" className="w-full h-16 flex flex-col gap-1">
            <BarChart3 className="h-4 w-4" />
            <span className="text-xs">Insights</span>
          </Button>
        </Link>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-3 gap-2">
          <Card>
            <CardContent className="p-4 text-center">
              <Eye className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-xl font-bold">{stats.totalViews || 0}</p>
              <p className="text-xs text-muted-foreground">Views</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-xl font-bold">{stats.totalSubscribers || 0}</p>
              <p className="text-xs text-muted-foreground">Subscribers</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <BarChart3 className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-xl font-bold">{stats.totalPosts || 0}</p>
              <p className="text-xs text-muted-foreground">Posts</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Profile */}
      <CreatorProfile />
    </div>
  );
};

export default CreatorHome;