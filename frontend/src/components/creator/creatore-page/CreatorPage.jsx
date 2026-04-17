import React from 'react'
import { useParams } from 'react-router'
const CreatorPage = () => {

    const {creatorUrl}=useParams();
  return (
    <div>
        CreatorPage
        
        for Creator  :{creatorUrl}
        </div>
  )
}

export default CreatorPage