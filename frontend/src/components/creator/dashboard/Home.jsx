import { Button } from '@/components/ui/button';
import CreatorProfile from './Profile';
import { SquarePen } from 'lucide-react';
import { Link } from 'react-router';


const CreatorHome = () => {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex justify-end mb-4">
        <Link to="profile/edit">
          <Button variant="outline" size="sm" className="gap-2">
            <SquarePen size={16} />
            Edit Profile
          </Button>
        </Link>
      </div>
      <CreatorProfile />
    </div>
  );
};

export default CreatorHome;