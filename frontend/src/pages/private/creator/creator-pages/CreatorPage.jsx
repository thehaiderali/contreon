import React from 'react'
import { useParams } from 'react-router'
import { useAuthStore } from '@/store/authStore.js'
import CreatorPagePublic from './CreatorPagePublic';
import CreatorPagePrivate from './CreatorPagePrivate';

const CreatorPage = () => {
  const { creatorUrl } = useParams();
  const { user } = useAuthStore();

  if (user) {
    return <CreatorPagePrivate creatorUrl={creatorUrl} user={user} />
  }
  
  return <CreatorPagePublic creatorUrl={creatorUrl} />
}

export default CreatorPage