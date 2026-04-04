import React, { useState } from "react";
import CreatorProfileForm from "./CreatorProfileForm";
import { useNavigate } from 'react-router';

const OnBoarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState("profile");

  const handleProfileComplete = () => {
    navigate('/creator');
  };

  if (step === "profile") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">Welcome to Contreon! 🎉</h1>
            <p className="text-muted-foreground mt-2">
              Let's set up your creator profile first
            </p>
          </div>
          <CreatorProfileForm onSuccess={handleProfileComplete} />
        </div>
      </div>
    );
  }

  return null;
};

export default OnBoarding;