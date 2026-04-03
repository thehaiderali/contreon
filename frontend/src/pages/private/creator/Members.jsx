import React from 'react'
import Subscribers from './members/Subscribers'

const Members = () => {
  return (
    <div className='w-full h-screen'>
      <h1 className='text-xl m-4 font-semibold'>Your Audience</h1>
      <Subscribers/>
    </div>
  )
}

export default Members