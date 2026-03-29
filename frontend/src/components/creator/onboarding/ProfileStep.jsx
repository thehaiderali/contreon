import React from 'react'
import CreatorProfileForm from './CreatorProfileForm'
import { Button } from '@/components/ui/button';

const ProfileStep = ({ onNext }) => {
  return (
    <div>
      <h2>Profile Step</h2>
      <CreatorProfileForm />
      <Button className={"bg-white"} onClick={onNext}>Next</Button>
    </div>
  );
};
export default ProfileStep;
