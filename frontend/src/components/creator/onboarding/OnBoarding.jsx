import React, { useState } from "react";
import CreatorProfileForm from "./CreatorProfileForm";
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

const OnBoarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState("greeting");

  const handleProfileComplete = () => {
    navigate('/creator');
  };

  const greetingVariants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    },
    exit: { 
      opacity: 0, 
      scale: 0.9,
      transition: { duration: 0.3 }
    }
  };

  const formVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, delay: 0.2 }
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="w-full max-w-2xl">
        <AnimatePresence mode="wait">
          {step === "greeting" ? (
            <motion.div
              key="greeting"
              variants={greetingVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.3 }}
                className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 mb-8"
              >
                <Sparkles className="w-12 h-12 text-primary" />
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-4xl font-bold mb-4"
              >
                Welcome to Contreon!
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-xl text-muted-foreground mb-4"
              >
                We're excited to have you here
              </motion.p>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="text-muted-foreground mb-10"
              >
                Let's set up your creator profile to start sharing your work with the world.
              </motion.p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
              >
                <Button 
                  size="lg" 
                  onClick={() => setStep("profile")}
                  className="gap-2"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </motion.div>

            </motion.div>
          ) : (
            <motion.div
              key="form"
              variants={formVariants}
              initial="initial"
              animate="animate"
            >
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold">Create Your Profile</h1>
                <p className="text-muted-foreground mt-2">
                  Tell your audience who you are
                </p>
              </div>
              <CreatorProfileForm onSuccess={handleProfileComplete} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OnBoarding;