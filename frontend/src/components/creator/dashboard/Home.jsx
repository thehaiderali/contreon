import { useAuthStore } from '@/store/authStore';
import CreatorProfileForm from '../onboarding/CreatorProfileForm';
import CreatorProfile from './Profile';// ✅ import the new profile component
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import OnBoarding from '../onboarding/OnBoarding';

const CreatorHome = () => {
  const { user } = useAuthStore();
  const [isOnboarded,setisOnboarded] = useState(false)
    const fetchProfile=async()=>{
      const response=await api.get("/creators/profile/me");
      console.log(response)
      if(!response.data.success){
        setisOnboarded(false);
      }
      else{
        setisOnboarded(true)
      }
    }
    useEffect(()=>{
       fetchProfile()
    },[])
  
  return (
    <>
      {isOnboarded ? (
        // ✅ Show profile component when onboarded
        <div className="max-w-2xl mx-auto px-4 py-8">
          <CreatorProfile/>
        </div>
      ) : (
        // ✅ Show onboarding form when not onboarded
        <div className="flex flex-col gap-5 justify-center items-center min-h-screen px-4">
          <div className="text-center space-y-2">
            <p className="text-3xl font-semibold">
              Welcome to our Platform
            </p>
            <p className="text-muted-foreground text-base">
              Let's begin creating your page!
            </p>
          </div>
          <div className="w-full max-w-2xl min-h-screen">
            <CreatorProfileForm/>
          </div>
        </div>
      )}
    </>
  );
};

export default CreatorHome;