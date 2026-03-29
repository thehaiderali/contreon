import React, { useState } from "react";
import ProfileStep from "./ProfileStep";
import FirstPostStep from "./FirstPost";
const OnBoarding = () => {
  const steps = ["profile", "firstpost"];
  const [currentStep, setCurrentStep] = useState("profile");

  const goNext = () => {
    const currentIndex = steps.indexOf(currentStep);
    const nextStep = steps[currentIndex + 1];

    if (nextStep) {
      setCurrentStep(nextStep);
    } else {
      console.log("Onboarding complete");
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case "profile":
        return <ProfileStep onNext={goNext} />;

      case "firstpost":
        return <FirstPostStep onNext={goNext} />;

      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <div className="w-full min-h-screen">
      <h1>This is the OnBoarding Flow</h1>
      {renderStep()}
    </div>
  );
};

export default OnBoarding;