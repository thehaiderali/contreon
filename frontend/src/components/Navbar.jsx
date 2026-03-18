import React from 'react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'

const Navbar = () => {
  return (
    <div className='bg-white/50 backdrop-blur-md  p-6 w-full flex justify-between items-center px-8  sticky top-0  '>
      <div className='flex gap-10'>
        <p className='rounded-4xl border-2 border-white hover:bg-black hover:text-white p-4'>Creators</p>
        <p className='rounded-4xl border-2 border-white hover:bg-black hover:text-white p-4'>Features</p>
        <p className='rounded-4xl border-2 border-white hover:bg-black hover:text-white p-4'>Pricing</p>
      </div>
      <div className='flex gap-10'>
        <p className='rounded-4xl border-2 border-white hover:bg-black hover:text-white p-4'>Login</p>
          <Button asChild >
      <Link to="/signup">Get Started</Link>
    </Button>
      </div>

    </div>
  )
}

export default Navbar