import { Button } from '@/components/ui/button';
import CreatorProfile from './Profile';
import { SquarePen } from 'lucide-react';
import { Link } from 'react-router';


const CreatorHome = () => {
  return (
    <>
        <div className="max-w-2xl mx-auto px-4 py-8 relative">
          <CreatorProfile/>
          <Link to={"profile/edit"}>
          <Button className='flex gap-3 justify-center items-center absolute top-20 right-10'>
            Edit Profile
              <SquarePen size={20} className=' cursor-pointer'/> 
          </Button>
           </Link>
        </div>
    </>
  );
};

export default CreatorHome;