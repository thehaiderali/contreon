import CreatorProfile from './Profile';
import { SquarePen } from 'lucide-react';
import { Link } from 'react-router';


const CreatorHome = () => {


  return (
    <>
        <div className="max-w-2xl mx-auto px-4 py-8 relative">
          <CreatorProfile/>
          <div className='flex gap-3 justify-center absolute top-20 right-10'>
            <span className='text-background dark:text-foreground text-sm'>Edit Profile </span>
            <Link to={"profile/edit"}>
              <SquarePen size={20} className='text-background dark:text-foreground cursor-pointer'/> 
            </Link>
          </div>
        </div>
    </>
  );
};

export default CreatorHome;