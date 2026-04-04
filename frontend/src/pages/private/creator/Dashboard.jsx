import React from 'react'
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'motion/react'
import { api } from '@/lib/api';

import CreatorHome from '@/src/components/creator/dashboard/Home'

import NoShop from './dashboard/NoShop'
import Memberships from '@/src/components/creator/dashboard/Memberships'
import NoRecommendations from './dashboard/NoRecommendations'
import Collections from '@/src/components/creator/dashboard/Collections'
import OnBoarding from '@/src/components/creator/onboarding/OnBoarding';

export const Dashboard = () => {

  const navlinks = ["Home", "Collections", "Shop", "Memberships", "Recommendations"]
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true)
  const [hasProfile, setHasProfile] = useState(null)
  const [currentLink, setCurrentLink] = useState("Home")

  const componentMap = {
    "Home": <CreatorHome />,
    "Collections": <Collections />,
    "Shop": <NoShop />,
    "Memberships": <Memberships />,
    "Recommendations": <NoRecommendations />
  }

  useEffect(() => {
    const checkProfile = async () => {
      try {
        const response = await api.get('/creators/profile/me');
        console.log("Profile check response:", response);
        if (response.data.success && response.data.data.profile) {
          console.log("Profile found:", response.data.data.profile);
          setHasProfile(true);
        } else {
          console.log("No profile data");
          setHasProfile(false);
        }
      } catch (error) {
        console.log("Profile check error:", error.response?.status);
        setHasProfile(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkProfile();
  }, [location]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hasProfile) {
    return <OnBoarding />;
  }

  const navItemVariants = {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    hover: { 
      scale: 1.05,
      transition: { type: "spring", stiffness: 400, damping: 10 }
    },
    tap: { scale: 0.95 }
  }

  const contentVariants = {
    initial: { 
      opacity: 0, 
      x: 100,
      scale: 0.95
    },
    animate: { 
      opacity: 1, 
      x: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
        duration: 0.3
      }
    },
    exit: { 
      opacity: 0, 
      x: -100,
      scale: 0.95,
      transition: {
        duration: 0.2
      }
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className='w-full min-h-screen p-20'
    >
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className='flex gap-9 justify-center items-center flex-wrap'
      >
        {navlinks.map((link) => (
          <motion.div
            key={link}
            variants={navItemVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
            whileTap="tap"
            className="relative"
          >
            <h1 
              onClick={() => setCurrentLink(link)} 
              className={`cursor-pointer text-xs md:text-[1rem] transition-colors duration-200 ${
                currentLink === link 
                  ? 'bg-black px-3 py-2 text-white rounded-2xl' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {link}
            </h1>
          </motion.div>
        ))}
      </motion.div>
      
      <div className="mt-12 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentLink}
            variants={contentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full"
          >
            {componentMap[currentLink]}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}