import CreateMenu from '@/src/components/creator/dashboard/CreateMenu'
import PostTable from '@/src/components/creator/posts/PostTable'
import React from 'react'

const Library = () => {

  return (
    <div className='w-full min-h-screen flex flex-col gap-4  '>
      <div className='flex justify-between'>
        <h1 className='text-xl text-left font-semibold'>Library</h1>
        <h1 className='w-fit mr-40'><CreateMenu/></h1>
      </div>
      <PostTable/>
    </div>
  )
}

export default Library