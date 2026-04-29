import React from 'react'
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { api } from '@/lib/api';
import { motion } from 'motion/react';
import { AnimatePresence } from 'motion/react';

import CreatorHome from '../../../components/creator/dashboard/Home'
import { Loader, PageLoader } from '../../../components/creator/dashboard/Loader'

import NoShop from './dashboard/NoShop'
import Memberships from '../../../components/creator/dashboard/Memberships'
import Recommendations from './dashboard/NoRecommendations';
import Collections from '../../../components/creator/dashboard/Collections'
import OnBoarding from '../../../components/creator/onboarding/OnBoarding';

export const Dashboard = () => {

  const navlinks = ["Home", "Collections", "Shop", "Memberships", "Recommendations"]
  const [isLoading, setIsLoading] = useState(true)
  const [hasProfile, setHasProfile] = useState(null)
  const [currentLink, setCurrentLink] = useState("Home")
  const navigate = useNavigate()
  const location = useLocation()

  const componentMap = {
    "Home": <CreatorHome />,
    "Collections": <Collections />,
    "Shop": <NoShop />,
    "Memberships": <Memberships />,
    "Recommendations": <Recommendations />
  }

  const pathMap = {
    "Home": "/creator/home",
    "Collections": "/creator/collections",
    "Shop": "/creator/shop",
    "Memberships": "/creator/memberships",
    "Recommendations": "/creator/recommendations"
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
  }, []);

  useEffect(() => {
    const path = location.pathname;
    if (path === '/creator/home' || path === '/creator' || path === '/creator/') {
      setCurrentLink("Home");
    } else if (path.includes('/collections')) {
      setCurrentLink("Collections");
    } else if (path.includes('/shop')) {
      setCurrentLink("Shop");
    } else if (path.includes('/memberships')) {
      setCurrentLink("Memberships");
    } else if (path.includes('/recommendations')) {
      setCurrentLink("Recommendations");
    }
  }, [location.pathname]);

  const handleNavClick = (link) => {
    setCurrentLink(link);
    navigate(pathMap[link]);
  };

  if (isLoading) {
    return <PageLoader />;
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
              onClick={() => handleNavClick(link)} 
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